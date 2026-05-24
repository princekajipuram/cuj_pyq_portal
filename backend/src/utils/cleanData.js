import mongoose from 'mongoose';
import dotenv from 'dotenv';
import QuestionPaper from '../models/QuestionPaper.js';
import Subject from '../models/Subject.js';
import Question from '../models/Question.js';
import Report from '../models/Report.js';
import SavedPaper from '../models/SavedPaper.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env path relative to this source file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const cleanData = async () => {
  try {
    console.log('[Cleanup] Connecting to database...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables.');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Cleanup] Connected successfully. Querying papers...');

    // Find all papers
    const allPapers = await QuestionPaper.find({}).populate('subject');
    console.log(`[Cleanup] Found total papers in database: ${allPapers.length}`);

    const badPapers = [];
    const validPapers = [];

    for (const paper of allPapers) {
      const url = paper.pdfUrl || '';
      // Check if it is a broken image/upload PDF
      const isBad = url.includes('image/upload') && url.toLowerCase().endsWith('.pdf');
      
      if (isBad) {
        badPapers.push(paper);
      } else {
        validPapers.push(paper);
      }
    }

    console.log(`[Cleanup] Identified ${badPapers.length} broken 'image/upload' PDF entries.`);

    if (badPapers.length === 0) {
      console.log("[Cleanup] No broken 'image/upload' papers found. Database is already clean!");
    } else {
      for (const p of badPapers) {
        console.log(`\n[Cleanup] Deleting broken paper:`);
        console.log(` - ID: ${p._id}`);
        console.log(` - Subject: ${p.subject?.name} (${p.subject?.code})`);
        console.log(` - Year: ${p.year}`);
        console.log(` - URL: ${p.pdfUrl}`);

        // 1. Delete associated questions
        const qDeleteRes = await Question.deleteMany({ paper: p._id });
        console.log(`   -> Deleted ${qDeleteRes.deletedCount} associated questions.`);

        // 2. Delete associated reports
        const rDeleteRes = await Report.deleteMany({ paper: p._id });
        console.log(`   -> Deleted ${rDeleteRes.deletedCount} associated reports.`);

        // 3. Delete from saved lists
        const sDeleteRes = await SavedPaper.deleteMany({ paper: p._id });
        console.log(`   -> Deleted ${sDeleteRes.deletedCount} bookmark listings.`);

        // 4. Delete paper document
        await p.deleteOne();
        console.log(`   -> Deleted QuestionPaper document successfully.`);
      }
      console.log(`\n[Cleanup] Successfully purged all ${badPapers.length} broken entries!`);
    }

    // Double check valid papers to show active database status
    console.log(`\n[Cleanup] Active Valid Papers remaining: ${validPapers.length}`);
    validPapers.forEach((vp, idx) => {
      console.log(` ${idx + 1}. [${vp.year} ${vp.examType}] ${vp.subject?.name || 'Unknown'} - URL: ${vp.pdfUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error(`[CleanupError] Failed to perform database cleanup: ${error.message}`);
    process.exit(1);
  }
};

cleanData();
