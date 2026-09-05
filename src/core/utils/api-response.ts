import { Response } from 'express';
import { encryptText } from '../../utils/crypto.util';
import { env } from '../../config/env';

export class ApiResponse {
  static success(res: Response, message: string, data?: any, statusCode = 200) {
    const rawPayload = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    
    // Bypass encryption for Swagger UI in dev mode
    const isSwaggerDev = env.NODE_ENV === 'development' && res.req?.headers['x-swagger-dev'] === 'true';
    if (isSwaggerDev) {
      return res.status(statusCode).json(rawPayload);
    }
    
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
    
    // Bypass encryption for Swagger UI in dev mode
    const isSwaggerDev = env.NODE_ENV === 'development' && res.req?.headers['x-swagger-dev'] === 'true';
    if (isSwaggerDev) {
      return res.status(statusCode).json(rawPayload);
    }
    
    const encryptedData = encryptText(JSON.stringify(rawPayload));
    return res.status(statusCode).json({ encryptedData });
  }
}
