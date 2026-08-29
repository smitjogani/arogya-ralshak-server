import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../../config/env';
import { logger } from '../../../../config/logger';

// Initialize the Gemini client (handling potential missing keys in dev)
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || 'dummy_key');

export class AiService {
  async extractEntities(ocrText: string): Promise<any> {
    try {
      logger.info('Starting AI Entity Extraction via Gemini (Free Tier)');
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
      
      const prompt = `
      You are an expert medical billing AI. 
      Extract the following information from the OCR text of a hospital estimate or insurance policy.
      Format the output strictly as a JSON object matching this schema:
      {
        "hospitalName": "string",
        "totalBilledAmount": 0,
        "lineItems": [
          { "description": "string", "amount": 0, "category": "string", "isPotentiallyNonPayable": boolean }
        ]
      }
      
      OCR Text:
      ${ocrText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonString = response.text() || '{}';
      
      logger.info('AI Extraction successful');
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error({ error }, 'AI Extraction failed via Gemini');
      throw new Error('Failed to extract entities from document text');
    }
  }
}
