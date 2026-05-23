import Department from '../models/Department.js';
import Branch from '../models/Branch.js';
import Subject from '../models/Subject.js';
import Semester from '../models/Semester.js';

// --- DEPARTMENTS ---
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const department = await Department.create({ name, code });
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

// --- BRANCHES ---
export const getBranches = async (req, res, next) => {
  try {
    const { deptId } = req.params;
    const branches = await Branch.find({ department: deptId }).sort({ name: 1 });
    res.status(200).json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const { name, code, departmentId } = req.body;

    // Check if department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const branch = await Branch.create({ name, code, department: departmentId });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

// --- SEMESTERS ---
export const getSemesters = async (req, res, next) => {
  try {
    const semesters = await Semester.find().sort({ number: 1 });
    res.status(200).json({ success: true, data: semesters });
  } catch (error) {
    next(error);
  }
};

// --- SUBJECTS ---
export const getSubjects = async (req, res, next) => {
  try {
    const { branchId } = req.params;
    const { semesterId } = req.query;

    const query = { branch: branchId };
    if (semesterId) {
      query.semester = semesterId;
    }

    const subjects = await Subject.find(query)
      .populate('semester', 'number name')
      .sort({ name: 1 });

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req, res, next) => {
  try {
    const { name, code, branchId, semesterId } = req.body;

    // Validate Branch & Semester exist
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ success: false, message: 'Semester not found' });
    }

    const subject = await Subject.create({
      name,
      code,
      branch: branchId,
      semester: semesterId
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};
