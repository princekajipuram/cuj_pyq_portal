import Report from '../models/Report.js';
import QuestionPaper from '../models/QuestionPaper.js';

/**
 * @desc    Submit a report for a question paper
 * @route   POST /api/v1/reports
 * @access  Private
 */
export const createReport = async (req, res, next) => {
  try {
    const { paperId, reason, description } = req.body;

    if (!paperId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide paper ID and reason for reporting'
      });
    }

    // Check if the paper exists
    const paper = await QuestionPaper.findById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Question paper not found'
      });
    }

    const report = await Report.create({
      user: req.user._id,
      paper: paperId,
      reason,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for your feedback.',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reported papers (Admin only)
 * @route   GET /api/v1/reports
 * @access  Private/Admin
 */
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .populate({
        path: 'paper',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update report status (Admin only)
 * @route   PUT /api/v1/reports/:id
 * @access  Private/Admin
 */
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: pending, resolved, or dismissed'
      });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status;
    await report.save();

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: report
    });
  } catch (error) {
    next(error);
  }
};
