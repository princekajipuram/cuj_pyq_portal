import Question from '../models/Question.js';

/**
 * Parses raw text from a question paper and extracts individual questions using heuristics.
 * @param {string} rawText - The full raw text extracted via PDF/OCR.
 * @param {string} subjectId - The ObjectId of the Subject.
 * @param {string} semesterId - The ObjectId of the Semester.
 * @param {number} year - The exam year.
 * @param {string} paperId - The ObjectId of the QuestionPaper.
 * @returns {Promise<Array>} - Array of saved Question documents.
 */
export const extractAndStoreQuestions = async (rawText, subjectId, semesterId, year, paperId) => {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  const lines = rawText.split('\n');
  const questionsList = [];
  
  // Heuristic patterns
  // 1. Matches "Q.1", "Q1.", "1.", "2)", "Question 3:"
  const questionStartRegex = /^(?:Q(?:uestion)?\s*[\.\-]?\s*(\d+)|(\d+))\s*[\.\)\-:]\s*(.+)$/i;
  // 2. Matches marks like "[5]", "(10 marks)", "[Marks 2]"
  const marksRegex = /(?:\[|\()(?:\s*marks?\s*)?(\d+)(?:\s*marks?)?(?:\]|\))/i;

  let currentQuestion = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const match = line.match(questionStartRegex);
    if (match) {
      // If we already have a question in progress, save it
      if (currentQuestion) {
        questionsList.push(currentQuestion);
      }

      const qNum = match[1] || match[2];
      let qText = match[3].trim();
      let marks = 5; // Default marks

      // Attempt to extract marks from the text
      const marksMatch = qText.match(marksRegex);
      if (marksMatch) {
        marks = parseInt(marksMatch[1], 10);
        // Strip marks text from the question description for a cleaner UI
        qText = qText.replace(marksRegex, '').trim();
      }

      // Determine type based on marks
      let type = 'Short';
      if (marks <= 2) {
        type = 'Very Short';
      } else if (marks > 5) {
        type = 'Long';
      }

      currentQuestion = {
        paper: paperId,
        subject: subjectId,
        semester: semesterId,
        year: year,
        questionText: qText,
        marks: marks,
        type: type
      };
    } else {
      // If the line doesn't start a new question but we have one active, append it to the question text
      if (currentQuestion) {
        // Stop appending if it looks like general page headers/footers
        if (
          !line.toLowerCase().includes('page') &&
          !line.toLowerCase().includes('roll no') &&
          line.length > 3
        ) {
          currentQuestion.questionText += ' ' + line;
        }
      }
    }
  }

  // Add the last question if active
  if (currentQuestion) {
    questionsList.push(currentQuestion);
  }

  // If we couldn't parse anything using regex, let's create a single general fallback question block
  // so the database isn't completely empty for that paper.
  if (questionsList.length === 0 && rawText.length > 50) {
    questionsList.push({
      paper: paperId,
      subject: subjectId,
      semester: semesterId,
      year: year,
      questionText: rawText.substring(0, 400) + '...',
      marks: 100,
      type: 'Long'
    });
  }

  // Save parsed questions in MongoDB
  const savedQuestions = [];
  for (const q of questionsList) {
    try {
      const newQ = new Question(q);
      await newQ.save();
      savedQuestions.push(newQ);
    } catch (err) {
      console.error(`[QuestionParser] Error saving question: ${err.message}`);
    }
  }

  console.log(`[QuestionParser] Extracted and stored ${savedQuestions.length} questions.`);
  return savedQuestions;
};
export default extractAndStoreQuestions;
