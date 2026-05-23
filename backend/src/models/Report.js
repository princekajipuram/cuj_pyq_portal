import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionPaper',
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please select a reason for reporting'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ status: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
