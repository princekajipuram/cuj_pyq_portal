import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuestionPaper from './src/models/QuestionPaper.js';

dotenv.config({ path: './.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const paper = await QuestionPaper.findById('6a359bc5da16c0367fe24021');
    if (paper) console.log('pdfUrl:', paper.pdfUrl);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
