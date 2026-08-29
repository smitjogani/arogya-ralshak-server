import { Request, Response, NextFunction } from 'express';
import { decryptText } from '../../utils/crypto.util';
import { AppError } from '../errors/app.error';

export const payloadDecryptMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only attempt to decrypt if the request has an encryptedData payload
  if (req.body && req.body.encryptedData) {
    try {
      const decryptedString = decryptText(req.body.encryptedData);
      req.body = JSON.parse(decryptedString);
    } catch (error) {
      return next(new AppError('Invalid encrypted payload', 400));
    }
  }
  next();
};
