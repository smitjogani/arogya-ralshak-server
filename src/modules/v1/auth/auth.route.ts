import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../../core/middlewares/validation.middleware';
import { registerSchema, loginSchema } from './dto/auth.dto';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;
