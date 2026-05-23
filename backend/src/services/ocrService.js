import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

/**
 * Extracts text from standard text-based PDFs or image files.
 * @param {Buffer} fileBuffer - File buffer from multer memory storage.
 * @param {string} mimeType - The mime type of the file.
 * @returns {Promise<string>} - Extracted text string.
 */
export const extractTextFromFile = async (fileBuffer, mimeType) => {
  try {
    console.log(`[OCRService] Starting text extraction for file type: ${mimeType}`);

    if (mimeType === 'application/pdf') {
      console.log('[OCRService] Using pdf-parse for PDF text extraction...');
      const data = await pdfParse(fileBuffer);
      
      // If we got clean text, return it
      if (data.text && data.text.trim().length > 10) {
        console.log(`[OCRService] Successfully extracted ${data.text.trim().length} characters from PDF.`);
        return data.text.trim();
      }

      // If the PDF is scanned (little to no text), we will log a warning.
      // In a full desktop setup you could convert PDF pages to images and run tesseract,
      // but in standard Node it's safer to extract what is available.
      console.warn('[OCRService] Text-based PDF extraction returned very little text. Could be a scanned PDF.');
      return data.text || 'Scanned PDF - No digital text found.';
    }

    if (mimeType.startsWith('image/')) {
      console.log('[OCRService] Using Tesseract.js for Image OCR extraction...');
      const { data: { text } } = await Tesseract.recognize(
        fileBuffer,
        'eng',
        { 
          logger: m => console.log(`[Tesseract.js] ${m.status}: ${Math.round(m.progress * 100)}%`) 
        }
      );
      console.log(`[OCRService] Successfully OCR'd image. Text length: ${text.length}`);
      return text.trim();
    }

    throw new Error('Unsupported file type for text extraction. Must be PDF or Image.');
  } catch (error) {
    console.error(`[OCRService] Error during text extraction: ${error.message}`);
    // Non-blocking: return empty string on error so the upload doesn't crash completely
    return '';
  }
};
