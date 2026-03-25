import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';

/**
 * Use after JwtAuthGuard. Ensures the authenticated user has role ADMIN.
 * Admin-only routes (e.g. GET /businesses, PATCH lock) must use both guards.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req['user'] as { sub?: string; role?: Role } | undefined;

    if (!user || user.role !== Role.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
