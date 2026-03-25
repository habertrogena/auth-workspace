import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureBusiness(invoice: { businessId: string } | null, businessId: string) {
    if (!invoice || invoice.businessId !== businessId) {
      throw new NotFoundException('Invoice not found');
    }
  }

  async findAll(businessId: string) {
    const list = await this.prisma.invoice.findMany({
      where: { businessId },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((i) => ({
      id: i.id,
      customerId: i.customerId,
      customer: i.customer,
      amount: Number(i.amount),
      status: i.status,
      dueDate: i.dueDate.toISOString(),
      createdAt: i.createdAt.toISOString(),
    }));
  }

  async create(businessId: string, dto: CreateInvoiceDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    const created = await this.prisma.invoice.create({
      data: {
        businessId,
        customerId: dto.customerId,
        amount: dto.amount,
        dueDate: new Date(dto.dueDate),
      },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
    });
    return {
      id: created.id,
      customerId: created.customerId,
      customer: created.customer,
      amount: Number(created.amount),
      status: created.status,
      dueDate: created.dueDate.toISOString(),
      createdAt: created.createdAt.toISOString(),
    };
  }

  async update(businessId: string, id: string, dto: UpdateInvoiceDto) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    this.ensureBusiness(existing, businessId);
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: dto.customerId, businessId },
      });
      if (!customer) throw new NotFoundException('Customer not found');
    }
    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...(dto.customerId != null && { customerId: dto.customerId }),
        ...(dto.amount != null && { amount: dto.amount }),
        ...(dto.status != null && { status: dto.status }),
        ...(dto.dueDate != null && { dueDate: new Date(dto.dueDate) }),
      },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
    });
    return {
      id: updated.id,
      customerId: updated.customerId,
      customer: updated.customer,
      amount: Number(updated.amount),
      status: updated.status,
      dueDate: updated.dueDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async remove(businessId: string, id: string) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    this.ensureBusiness(existing, businessId);
    await this.prisma.invoice.delete({ where: { id } });
    return { deleted: true };
  }
}
