import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { AuthModule } from '../common/auth/auth.module';
import { BusinessGuard } from '../common/guards/business.guard';

@Module({
  imports: [AuthModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, BusinessGuard],
})
export class InvoicesModule {}