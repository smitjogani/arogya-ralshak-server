import vision from '@google-cloud/vision';
import { logger } from '../../../../config/logger';

// Instantiates a client. Note: This requires GOOGLE_APPLICATION_CREDENTIALS to be set in the environment.
// For development without credentials, this will throw an auth error when called.
const client = new vision.ImageAnnotatorClient();

export class OcrService {
  async extractTextFromBuffer(imageBuffer: Buffer): Promise<string> {
    try {
      logger.info('Starting OCR extraction via Google Vision API');
      const [result] = await client.documentTextDetection(imageBuffer);
      const fullTextAnnotation = result.fullTextAnnotation;
      
      if (!fullTextAnnotation) {
        return '';
      }
      
      logger.info('OCR extraction successful');
      return fullTextAnnotation.text || '';
    } catch (error) {
      logger.error({ error }, 'OCR extraction failed');
      throw new Error('Failed to extract text from document');
    }
  }
}
