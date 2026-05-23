import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    paper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionPaper',
      default: null
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true
    },
    year: {
      type: Number,
      required: [true, 'Please specify the question year']
    },
    questionText: {
      type: String,
      required: [true, 'Please provide the question text'],
      trim: true
    },
    marks: {
      type: Number,
      required: [true, 'Please provide marks for the question']
    },
    type: {
      type: String,
      enum: ['Very Short', 'Short', 'Long'],
      required: [true, 'Please select the question type (Very Short, Short, Long)']
    }
  },
  {
    timestamps: true
  }
);

questionSchema.index({ subject: 1, type: 1, marks: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
