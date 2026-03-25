import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { AuthModule } from '../common/auth/auth.module';
import { BusinessGuard } from '../common/guards/business.guard';

@Module({
  imports: [AuthModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, BusinessGuard],
})
export class TransactionsModule {}
