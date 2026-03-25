import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureBusiness(transaction: { businessId: string } | null, businessId: string) {
    if (!transaction || transaction.businessId !== businessId) {
      throw new NotFoundException('Transaction not found');
    }
  }

  async findAll(businessId: string, type?: TransactionType, from?: string, to?: string) {
    const where: { businessId: string; type?: TransactionType; date?: { gte?: Date; lte?: Date } } = {
      businessId,
    };
    if (type) where.type = type;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    const list = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return list.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      description: t.description,
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async create(businessId: string, dto: CreateTransactionDto) {
    const created = await this.prisma.transaction.create({
      data: {
        businessId,
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        description: dto.description ?? null,
        date: new Date(dto.date),
      },
    });
    return {
      id: created.id,
      amount: Number(created.amount),
      type: created.type,
      category: created.category,
      description: created.description,
      date: created.date.toISOString(),
      createdAt: created.createdAt.toISOString(),
    };
  }

  async update(businessId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findUnique({ where: { id } });
    this.ensureBusiness(existing, businessId);
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.amount != null && { amount: dto.amount }),
        ...(dto.type != null && { type: dto.type }),
        ...(dto.category != null && { category: dto.category }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date != null && { date: new Date(dto.date) }),
      },
    });
    return {
      id: updated.id,
      amount: Number(updated.amount),
      type: updated.type,
      category: updated.category,
      description: updated.description,
      date: updated.date.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async remove(businessId: string, id: string) {
    const existing = await this.prisma.transaction.findUnique({ where: { id } });
    this.ensureBusiness(existing, businessId);
    await this.prisma.transaction.delete({ where: { id } });
    return { deleted: true };
  }
}
