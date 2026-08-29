import { Response } from 'express';
import { encryptText } from '../../utils/crypto.util';

export class ApiResponse {
  static success(res: Response, message: string, data?: any, statusCode = 200) {
    const rawPayload = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    
    const encryptedData = encryptText(JSON.stringify(rawPayload));
    return res.status(statusCode).json({ encryptedData });
  }

  static error(res: Response, message: string, statusCode = 500, errors?: any) {
    const rawPayload = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
    
    const encryptedData = encryptText(JSON.stringify(rawPayload));
    return res.status(statusCode).json({ encryptedData });
  }
}
