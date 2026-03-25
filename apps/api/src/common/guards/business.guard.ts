import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Use after JwtAuthGuard. Ensures user has role BUSINESS and has at least one business.
 * Attaches businessId (first business) to request for multi-tenant scoping.
 */
@Injectable()
export class BusinessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req['user'] as { sub?: string; role?: Role } | undefined;

    if (!user || user.role !== Role.BUSINESS) {
      throw new ForbiddenException('Business access required');
    }

    const business = await this.prisma.business.findFirst({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (!business) {
      throw new ForbiddenException('No business found for this user');
    }

    req['businessId'] = business.id;
    return true;
  }
}
