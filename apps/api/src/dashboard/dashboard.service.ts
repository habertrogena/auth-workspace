import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(businessId: string) {
    const [transactions, overdueInvoices] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { businessId },
        select: { amount: true, type: true, date: true, category: true, description: true, id: true },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      this.prisma.invoice.count({
        where: { businessId, status: 'UNPAID', dueDate: { lt: new Date() } },
      }),
    ]);

    const allTx = await this.prisma.transaction.findMany({
      where: { businessId },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const t of allTx) {
      const amt = Number(t.amount);
      if (t.type === TransactionType.INCOME) totalIncome += amt;
      else totalExpenses += amt;
    }
    const balance = totalIncome - totalExpenses;

    const recentTransactions = transactions.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      description: t.description,
      date: t.date.toISOString(),
    }));

    return {
      totalIncome,
      totalExpenses,
      balance,
      recentTransactions,
      overdueInvoicesCount: overdueInvoices,
    };
  }
}
