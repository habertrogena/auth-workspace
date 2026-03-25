import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { BusinessGuard } from '../common/guards/business.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
@UseGuards(JwtAuthGuard, BusinessGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Req() req: express.Request) {
    const businessId = req['businessId'] as string;
    return this.invoicesService.findAll(businessId);
  }

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateInvoiceDto) {
    const businessId = req['businessId'] as string;
    return this.invoicesService.create(businessId, dto);
  }

  @Put(':id')
  update(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    const businessId = req['businessId'] as string;
    return this.invoicesService.update(businessId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: express.Request, @Param('id') id: string) {
    const businessId = req['businessId'] as string;
    return this.invoicesService.remove(businessId, id);
  }
}
