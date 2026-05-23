import SavedPaper from '../models/SavedPaper.js';
import QuestionPaper from '../models/QuestionPaper.js';

/**
 * @desc    Toggle saving/bookmarking a paper
 * @route   POST /api/v1/saved/:paperId
 * @access  Private
 */
export const toggleSavePaper = async (req, res, next) => {
  try {
    const { paperId } = req.params;
    const userId = req.user._id;

    // Check if the paper exists
    const paper = await QuestionPaper.findById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Question paper not found'
      });
    }

    // Check if already saved
    const existingBookmark = await SavedPaper.findOne({ user: userId, paper: paperId });

    if (existingBookmark) {
      // Remove bookmark
      await existingBookmark.deleteOne();
      return res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Paper removed from bookmarks'
      });
    } else {
      // Create bookmark
      await SavedPaper.create({ user: userId, paper: paperId });
      return res.status(201).json({
        success: true,
        isSaved: true,
        message: 'Paper added to bookmarks successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookmarked papers for the current logged-in user
 * @route   GET /api/v1/saved
 * @access  Private
 */
export const getSavedPapers = async (req, res, next) => {
  try {
    const bookmarks = await SavedPaper.find({ user: req.user._id })
      .populate({
        path: 'paper',
        populate: {
          path: 'subject',
          select: 'name code branch semester',
          populate: [
            { path: 'branch', select: 'name code' },
            { path: 'semester', select: 'number name' }
          ]
        }
      })
      .sort({ createdAt: -1 });

    // Clean response to return paper details directly with bookmarks structure
    const papers = bookmarks
      .filter(b => b.paper !== null) // Filter out papers that might have been deleted by admin
      .map(b => b.paper);

    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    next(error);
  }
};
