import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { getRedis } from '../../config/redis';
import { env } from '../../config/env';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/errors/AppError';
import type { LoginInput, RegisterInput, ChangePasswordInput } from './auth.validation';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds
const BLACKLIST_PREFIX = 'bl_token:';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Usuario desactivado. Contacte al administrador.');
    }

    // Account lockout check (after N failed attempts, lock for a period)
    const lockKey = `lock:${user.id}`;
    const isLocked = await getRedis().get(lockKey);
    if (isLocked) {
      const ttl = await getRedis().ttl(lockKey);
      const minutes = Math.ceil(ttl / 60);
      throw new UnauthorizedError(
        `Demasiados intentos fallidos. Cuenta bloqueada por ${minutes} minuto(s).`
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempt counter (15 min window)
      const failKey = `fail:${user.id}`;
      const attempts = await getRedis().incr(failKey);
      if (attempts === 1) {
        await getRedis().expire(failKey, 15 * 60);
      }
      // After 5 failed attempts, lock the account for 15 minutes
      if (attempts >= 5) {
        await getRedis().setex(lockKey, 15 * 60, '1');
        await getRedis().del(failKey);
        throw new UnauthorizedError(
          'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.'
        );
      }
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Successful login - clear failed attempts and lockout
    await getRedis().del(`fail:${user.id}`);
    await getRedis().del(lockKey);

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in Redis
    await getRedis().setex(
      `refresh:${user.id}`,
      REFRESH_TOKEN_EXPIRY_SECONDS,
      tokens.refreshToken
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'VIEWER',
      },
    });

    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in Redis
    await getRedis().setex(
      `refresh:${user.id}`,
      REFRESH_TOKEN_EXPIRY_SECONDS,
      tokens.refreshToken
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(token: string) {
    // Check if token is blacklisted
    const isBlacklisted = await getRedis().get(`${BLACKLIST_PREFIX}${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token inválido');
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Token expirado o inválido');
    }

    // Check if refresh token matches stored one
    const storedToken = await getRedis().get(`refresh:${payload.userId}`);
    if (storedToken !== token) {
      throw new UnauthorizedError('Token inválido');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no encontrado o desactivado');
    }

    // Blacklist old refresh token
    await getRedis().setex(
      `${BLACKLIST_PREFIX}${token}`,
      REFRESH_TOKEN_EXPIRY_SECONDS,
      'blacklisted'
    );

    // Generate new tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store new refresh token
    await getRedis().setex(
      `refresh:${user.id}`,
      REFRESH_TOKEN_EXPIRY_SECONDS,
      tokens.refreshToken
    );

    return tokens;
  }

  async logout(userId: string, token?: string) {
    // Remove refresh token from Redis
    await getRedis().del(`refresh:${userId}`);

    // Blacklist access token if provided
    if (token) {
      const decoded = jwt.decode(token) as TokenPayload & { exp: number };
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await getRedis().setex(`${BLACKLIST_PREFIX}${token}`, ttl, 'blacklisted');
        }
      }
    }
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('La contraseña actual es incorrecta');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Invalidate all refresh tokens
    await getRedis().del(`refresh:${userId}`);
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, id: { not: userId } },
      });
      if (existing) {
        throw new BadRequestError('El email ya está en uso');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return updated;
  }

  private generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
