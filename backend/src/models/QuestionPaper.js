import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    year: {
      type: Number,
      required: [true, 'Please provide the examination year'],
      index: true
    },
    examType: {
      type: String,
      enum: ['EndSem', 'MidSem', 'Supple'],
      default: 'EndSem'
    },
    pdfUrl: {
      type: String,
      required: [true, 'Please provide a PDF or image URL']
    },
    pdfPublicId: {
      type: String,
      required: [true, 'Please provide the Cloudinary public asset ID']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    extractedText: {
      type: String,
      default: ''
    },
    ocrStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'],
      default: 'PENDING'
    },
    ocrError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes to speed up queries for academic searches
questionPaperSchema.index({ subject: 1, year: -1 });

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
export default QuestionPaper;
