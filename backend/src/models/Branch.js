import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a branch name'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Please provide a branch code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure name is unique per department
branchSchema.index({ name: 1, department: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
