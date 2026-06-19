import EventEmitter from 'events';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { fromBuffer } from 'pdf2pic';
import { Jimp, JimpMime } from 'jimp';
import QuestionPaper from '../models/QuestionPaper.js';
import { extractAndStoreQuestions } from '../services/questionParser.js';

export const ocrEvents = new EventEmitter();

// Preprocess image buffer with Jimp
const preprocessImage = async (imageBuffer) => {
  const image = await Jimp.read(imageBuffer);
  image.greyscale();
  image.contrast(0.5); // Basic thresholding/grayscale
  return await image.getBuffer(JimpMime.png);
};

// Fallback logic
const processPdfFallback = async (fileBuffer) => {
  console.log('[OCRWorker] Starting PDF to Image fallback...');
  try {
    const options = {
      density: 300,
      format: 'png',
      width: 2000,
      height: 2800
    };
    const convert = fromBuffer(fileBuffer, options);
    
    // Process all pages dynamically (-1 tells pdf2pic to convert all available pages safely)
    // We pass { responseType: "base64" } instead of an invalid boolean
    const results = await convert.bulk(-1, { responseType: "base64" });
    
    let fullText = '';
    for (const page of results) {
      if (page && page.base64) {
        const imgBuffer = Buffer.from(page.base64, 'base64');
        const processedBuffer = await preprocessImage(imgBuffer);
        const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng');
        fullText += text + '\n\n';
      }
    }
    return fullText.trim();
  } catch (err) {
    console.error('[OCRWorker] Fallback failed:', err);
    throw new Error('PDF-to-Image fallback failed: ' + err.message);
  }
};

const processImage = async (fileBuffer) => {
  const processedBuffer = await preprocessImage(fileBuffer);
  const { data: { text } } = await Tesseract.recognize(processedBuffer, 'eng');
  return text.trim();
};

ocrEvents.on('process-paper', async ({ paperId, fileBuffer, mimeType, subjectId, semesterId, year }) => {
  console.log(`[OCRWorker] Async Job started for paper ${paperId}`);
  try {
    await QuestionPaper.findByIdAndUpdate(paperId, { ocrStatus: 'PROCESSING' });
    
    let extractedText = '';
    
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text ? data.text.trim() : '';
      
      // Fallback if empty or < 100 chars
      if (extractedText.length < 100) {
        console.log(`[OCRWorker] Text length ${extractedText.length} < 100. Triggering Ghostscript/Tesseract fallback.`);
        extractedText = await processPdfFallback(fileBuffer);
      }
    } else if (mimeType.startsWith('image/')) {
      extractedText = await processImage(fileBuffer);
    } else {
      throw new Error('Unsupported mime type');
    }
    
    // Save extracted text and update status
    await QuestionPaper.findByIdAndUpdate(paperId, { 
      extractedText,
      ocrStatus: 'SUCCESS' 
    });
    
    // Parse Questions
    if (extractedText) {
       await extractAndStoreQuestions(extractedText, subjectId, semesterId, year, paperId);
    }
    console.log(`[OCRWorker] Async Job completed successfully for paper ${paperId}`);
    
  } catch (error) {
    console.error(`[OCRWorker] Job failed for paper ${paperId}:`, error);
    await QuestionPaper.findByIdAndUpdate(paperId, { 
      ocrStatus: 'FAILED',
      ocrError: error.message || 'Unknown OCR Error'
    });
  }
});
