import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a subject name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please provide a subject code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Semester',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexing for faster branch/semester searches
subjectSchema.index({ branch: 1, semester: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
