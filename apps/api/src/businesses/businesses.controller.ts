import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { BusinessesService } from './businesses.service';

@Controller('businesses')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Patch(':id/lock')
  lock(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.businessesService.lock(id, body?.reason);
  }

  @Patch(':id/unlock')
  unlock(@Param('id') id: string) {
    return this.businessesService.unlock(id);
  }
}
