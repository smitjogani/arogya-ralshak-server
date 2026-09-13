import vision from '@google-cloud/vision';
import { logger } from '../../../../config/logger';

// Instantiates a client. Note: This requires GOOGLE_APPLICATION_CREDENTIALS to be set in the environment,
// OR GOOGLE_CREDS_JSON to contain the stringified JSON credentials.
const visionOptions: vision.ClientOptions = {};
if (process.env.GOOGLE_CREDS_JSON) {
  try {
    visionOptions.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
  } catch (e) {
    logger.error('Failed to parse GOOGLE_CREDS_JSON env variable');
  }
}
const client = new vision.ImageAnnotatorClient(visionOptions);

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
