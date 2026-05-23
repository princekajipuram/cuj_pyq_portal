import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Branch from '../models/Branch.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import QuestionPaper from '../models/QuestionPaper.js';
import Question from '../models/Question.js';
import SavedPaper from '../models/SavedPaper.js';
import Report from '../models/Report.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Resolve .env path relative to this source file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected successfully. Cleaning collections...');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Branch.deleteMany({});
    await Semester.deleteMany({});
    await Subject.deleteMany({});
    await QuestionPaper.deleteMany({});
    await Question.deleteMany({});
    await SavedPaper.deleteMany({});
    await Report.deleteMany({});

    console.log('[Seed] Database cleared. Seeding custom Academic Departments...');

    // 1. Create Semesters (1 to 8)
    const semesterNums = [1, 2, 3, 4, 5, 6, 7, 8];
    const semesters = [];
    for (const num of semesterNums) {
      const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th';
      const sem = await Semester.create({
        number: num,
        name: `${num}${suffix} Semester`
      });
      semesters.push(sem);
    }
    const sem6 = semesters[5]; // 6th Semester index

    // 2. Create Departments
    const deptBtech = await Department.create({
      name: 'B.Tech',
      code: 'BTECH'
    });
    const deptMtech = await Department.create({
      name: 'M.Tech',
      code: 'MTECH'
    });
    console.log('[Seed] Seeding departments completed.');

    // 3. Create Branches under B.Tech and M.Tech
    const branches = [
      // B.Tech Branches
      { name: 'CSE (Core)', code: 'CSE', department: deptBtech._id },
      { name: 'Cyber Security', code: 'CSE-CYS', department: deptBtech._id },
      { name: 'ECE (Core)', code: 'ECE', department: deptBtech._id },
      { name: 'Avionics', code: 'ECE-AV', department: deptBtech._id },
      // M.Tech Branches
      { name: 'CSE (Core)', code: 'MCSE', department: deptMtech._id }
    ];

    const branchDocs = {};
    for (const b of branches) {
      const doc = await Branch.create(b);
      // Unique mapping by name + department code for easy subjects link
      const key = `${b.code}_${b.department.toString() === deptBtech._id.toString() ? 'BTECH' : 'MTECH'}`;
      branchDocs[key] = doc;
    }
    console.log('[Seed] Seeding branches completed.');

    // 4. Create Specific B.Tech CSE 6th Semester Subjects
    const subjects = [
      {
        name: 'Big Data Analytics',
        code: 'BECSE3C021',
        branch: branchDocs['CSE_BTECH']._id,
        semester: sem6._id
      },
      {
        name: 'Deep learning',
        code: 'BECSE3C022',
        branch: branchDocs['CSE_BTECH']._id,
        semester: sem6._id
      },
      {
        name: 'Block Chain',
        code: 'BECSE3C023',
        branch: branchDocs['CSE_BTECH']._id,
        semester: sem6._id
      },
      {
        name: 'Data Mining and Warehousing',
        code: 'BECSE0O011',
        branch: branchDocs['CSE_BTECH']._id,
        semester: sem6._id
      },
      {
        name: 'Robotics and AI',
        code: 'BECSE3C009',
        branch: branchDocs['CSE_BTECH']._id,
        semester: sem6._id
      }
    ];

    const subjectDocs = {};
    for (const sub of subjects) {
      const doc = await Subject.create(sub);
      subjectDocs[sub.code] = doc;
    }
    console.log('[Seed] Seeding custom 6th semester subjects completed.');

    // 5. Create Default Sandbox Users
    const adminUser = await User.create({
      name: 'CUJ Admin',
      email: 'admin@cuj.edu',
      password: 'admin123',
      role: 'admin'
    });

    const standardStudent = await User.create({
      name: 'CUJ Student',
      email: 'student@cuj.edu',
      password: 'student123',
      role: 'user'
    });

    console.log('[Seed] Seeding default users completed:');
    console.log(` - Admin account: ${adminUser.email} (password: admin123)`);
    console.log(` - Student account: ${standardStudent.email} (password: student123)`);

    // 6. Create 1 sample QuestionPaper with clean W3C generic PDF (No flower images!)
    const sampleOcrText = `
CENTRAL UNIVERSITY OF JAMMU
End Semester Examination 2024
B.Tech CSE | Semester: VI
Subject: Big Data Analytics [BECSE3C021]
Time: 3 Hours | Max Marks: 100

Instructions: Solve all questions.

1. Discuss HDFS architecture. Explain NameNode and DataNode functions in detail.
2. Outline MapReduce processing flows. Illustrate Mapper and Reducer logic.
3. Compare Hadoop vs Apache Spark performance parameters.
4. Elaborate on Big Data storage schemas and NoSQL database structures.
    `;

    const samplePaper = await QuestionPaper.create({
      subject: subjectDocs['BECSE3C021']._id,
      year: 2024,
      examType: 'EndSem',
      // Safe W3C Testing PDF document (Standard plain text - No flower images!)
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf-test.pdf',
      pdfPublicId: 'sample_pdf_placeholder_cuj',
      uploadedBy: adminUser._id,
      isVerified: true,
      extractedText: sampleOcrText
    });

    // NOTE: AS REQUESTED, WE DO NOT SEED ANY QUESTIONS INTO THE QUESTION COLLECTION!
    // The Question collection is left empty.
    
    console.log('[Seed] Sample papers seeding completed without question collection records.');
    console.log('[Seed] Custom database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[SeedError] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
