import User from '../models/User.js';
import QuestionPaper from '../models/QuestionPaper.js';
import Question from '../models/Question.js';
import Report from '../models/Report.js';
import Branch from '../models/Branch.js';
import Subject from '../models/Subject.js';

/**
 * @desc    Get dashboard statistics (Admin only)
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPapers = await QuestionPaper.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalReports = await Report.countDocuments({ status: 'pending' });

    // Aggregate papers per branch for charts
    // Since Subject links to Branch, we can aggregate paper counts by subject -> branch
    const branches = await Branch.find().select('name code');
    const branchStats = [];

    for (const branch of branches) {
      const subjects = await Subject.find({ branch: branch._id }).select('_id');
      const subjectIds = subjects.map(sub => sub._id);
      
      const paperCount = await QuestionPaper.countDocuments({ subject: { $in: subjectIds } });
      
      branchStats.push({
        name: branch.name,
        code: branch.code,
        papers: paperCount
      });
    }

    // Get recent uploads
    const recentUploads = await QuestionPaper.find()
      .populate({
        path: 'subject',
        select: 'name code',
        populate: { path: 'branch', select: 'code' }
      })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: totalUsers,
          papers: totalPapers,
          questions: totalQuestions,
          pendingReports: totalReports
        },
        branchStats,
        recentUploads
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a valid role: admin or user'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
