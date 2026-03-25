import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { BusinessGuard } from '../common/guards/business.guard';
import { DashboardService } from './dashboard.service';
import * as express from 'express';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, BusinessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Req() req: express.Request) {
    const businessId = req['businessId'] as string;
    return this.dashboardService.getSummary(businessId);
  }
}
