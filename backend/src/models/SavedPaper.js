import mongoose from 'mongoose';

const savedPaperSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionPaper',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user cannot bookmark the exact same paper multiple times
savedPaperSchema.index({ user: 1, paper: 1 }, { unique: true });

const SavedPaper = mongoose.model('SavedPaper', savedPaperSchema);
export default SavedPaper;
