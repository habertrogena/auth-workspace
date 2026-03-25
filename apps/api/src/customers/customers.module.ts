import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuthModule } from '../common/auth/auth.module';
import { BusinessGuard } from '../common/guards/business.guard';

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, BusinessGuard],
})
export class CustomersModule {}
