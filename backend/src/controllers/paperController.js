import QuestionPaper from '../models/QuestionPaper.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import SavedPaper from '../models/SavedPaper.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';
import { ocrEvents } from '../workers/ocrWorker.js';

/**
 * @desc    Get all question papers with search and filters
 * @route   GET /api/v1/papers
 * @access  Public
 */
export const getPapers = async (req, res, next) => {
  try {
    const { branch, semester, subject, year, search } = req.query;

    const query = {};

    // 1. Filter by subject directly
    if (subject) {
      query.subject = subject;
    } else if (branch || semester || search) {
      // If we don't have subject but have branch/semester/search, we first search matching subjects
      const subjectQuery = {};
      if (branch) subjectQuery.branch = branch;
      if (semester) subjectQuery.semester = semester;
      if (search) {
        subjectQuery.name = { $regex: search, $options: 'i' };
      }

      const matchingSubjects = await Subject.find(subjectQuery).select('_id');
      const subjectIds = matchingSubjects.map(sub => sub._id);
      
      query.subject = { $in: subjectIds };
    }

    if (year) {
      query.year = parseInt(year, 10);
    }

    const papers = await QuestionPaper.find(query)
      .populate({
        path: 'subject',
        select: 'name code branch semester',
        populate: [
          { path: 'branch', select: 'name code' },
          { path: 'semester', select: 'number name' }
        ]
      })
      .populate('uploadedBy', 'name email')
      .sort({ year: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single question paper by ID
 * @route   GET /api/v1/papers/:id
 * @access  Public
 */
export const getPaperById = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id)
      .populate({
        path: 'subject',
        select: 'name code branch semester',
        populate: [
          { path: 'branch', select: 'name code' },
          { path: 'semester', select: 'number name' }
        ]
      })
      .populate('uploadedBy', 'name email');

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Question paper not found'
      });
    }

    // Fetch individual questions parsed/stored for this paper
    const questions = await Question.find({ paper: paper._id }).sort({ marks: 1 });

    res.status(200).json({
      success: true,
      data: {
        paper,
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload a new question paper (Multer PDF/Image upload + Cloudinary + OCR)
 * @route   POST /api/v1/papers
 * @access  Private (Registered users/admins)
 */
export const uploadPaper = async (req, res, next) => {
  try {
    const { subjectId, year, examType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF or image file'
      });
    }

    // Validate subject exists
    const subject = await Subject.findById(subjectId).populate('semester');
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Specified subject not found'
      });
    }

    console.log(`[UploadPaper] File received: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. Upload file buffer to Cloudinary
    const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
    const resourceType = isPdf ? 'raw' : 'image';
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'pyq_papers', resourceType, req.file.originalname);
    console.log(`[UploadPaper] Cloudinary upload successful: ${uploadResult.secure_url}`);

    // 2. Create the QuestionPaper document as PENDING
    const paper = await QuestionPaper.create({
      subject: subjectId,
      year: parseInt(year, 10),
      examType: examType || 'EndSem',
      pdfUrl: uploadResult.secure_url,
      pdfPublicId: uploadResult.public_id,
      uploadedBy: req.user._id,
      isVerified: req.user.role === 'admin',
      ocrStatus: 'PENDING'
    });

    // 3. Dispatch Async OCR Job (Does not block Event Loop)
    ocrEvents.emit('process-paper', {
      paperId: paper._id,
      fileBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      subjectId,
      semesterId: subject.semester._id,
      year: parseInt(year, 10)
    });

    // 4. Respond instantly
    res.status(202).json({
      success: true,
      message: 'Question paper uploaded successfully. OCR processing started in background.',
      data: {
        paper,
        jobStatus: 'PENDING'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a question paper (Admin only)
 * @route   DELETE /api/v1/papers/:id
 * @access  Private (Admin only)
 */
export const deletePaper = async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Question paper not found'
      });
    }

    console.log(`[DeletePaper] Removing paper: ${paper._id}`);

    // 1. Delete asset from Cloudinary
    try {
      // Determine correct resource type. Cloudinary raw for pdf, image for image.
      const isPdf = paper.pdfUrl.toLowerCase().endsWith('.pdf');
      const resourceType = isPdf ? 'raw' : 'image';
      await deleteFromCloudinary(paper.pdfPublicId, resourceType);
    } catch (cloudErr) {
      console.error(`[DeletePaper] Cloudinary asset deletion failed: ${cloudErr.message}`);
    }

    // 2. Remove associated extracted questions
    await Question.deleteMany({ paper: paper._id });

    // 3. Remove any saved bookmarks for this paper
    await SavedPaper.deleteMany({ paper: paper._id });

    // 4. Remove paper document
    await paper.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question paper and its extracted questions removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get individual questions for a subject with filters
 * @route   GET /api/v1/questions
 * @access  Public
 */
export const getQuestions = async (req, res, next) => {
  try {
    const { subjectId, type, marks, year } = req.query;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID is required to query questions'
      });
    }

    const query = { subject: subjectId };
    if (type) query.type = type;
    if (marks) query.marks = parseInt(marks, 10);
    if (year) query.year = parseInt(year, 10);

    const questions = await Question.find(query)
      .populate('paper', 'year examType pdfUrl')
      .sort({ year: -1, marks: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};
