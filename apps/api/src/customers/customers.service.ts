import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureBusiness(customer: { businessId: string } | null, businessId: string) {
    if (!customer || customer.businessId !== businessId) {
      throw new NotFoundException('Customer not found');
    }
  }

  async findAll(businessId: string) {
    const list = await this.prisma.customer.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
    });
    return list.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  async create(businessId: string, dto: CreateCustomerDto) {
    const created = await this.prisma.customer.create({
      data: {
        businessId,
        name: dto.name,
        phone: dto.phone ?? null,
        email: dto.email ?? null,
      },
    });
    return {
      id: created.id,
      name: created.name,
      phone: created.phone,
      email: created.email,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async update(businessId: string, id: string, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    this.ensureBusiness(existing, businessId);
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone ?? null }),
        ...(dto.email !== undefined && { email: dto.email ?? null }),
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      email: updated.email,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async remove(businessId: string, id: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    this.ensureBusiness(existing, businessId);
    await this.prisma.customer.delete({ where: { id } });
    return { deleted: true };
  }
}
