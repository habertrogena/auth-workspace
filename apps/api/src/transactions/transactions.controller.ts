import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { BusinessGuard } from '../common/guards/business.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType } from '@prisma/client';

@Controller('transactions')
@UseGuards(JwtAuthGuard, BusinessGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @Req() req: express.Request,
    @Query('type') type?: TransactionType,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const businessId = req['businessId'] as string;
    return this.transactionsService.findAll(businessId, type, from, to);
  }

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateTransactionDto) {
    const businessId = req['businessId'] as string;
    return this.transactionsService.create(businessId, dto);
  }

  @Put(':id')
  update(
    @Req() req: express.Request,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const businessId = req['businessId'] as string;
    return this.transactionsService.update(businessId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: express.Request, @Param('id') id: string) {
    const businessId = req['businessId'] as string;
    return this.transactionsService.remove(businessId, id);
  }
}
