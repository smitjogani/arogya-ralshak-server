import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../config/prisma';
import { env } from '../../../config/env';
import { AppError } from '../../../core/errors/app.error';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
      },
    });

    return { id: user.id, email: user.email, fullName: user.fullName };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, data.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }
}
