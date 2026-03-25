import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthModule } from '../common/auth/auth.module';
import { BusinessGuard } from '../common/guards/business.guard';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService, BusinessGuard],
})
export class DashboardModule {}
