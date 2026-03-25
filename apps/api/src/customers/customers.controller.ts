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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, BusinessGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Req() req: express.Request) {
    const businessId = req['businessId'] as string;
    return this.customersService.findAll(businessId);
  }

  @Post()
  create(@Req() req: express.Request, @Body() dto: CreateCustomerDto) {
    const businessId = req['businessId'] as string;
    return this.customersService.create(businessId, dto);
  }

  @Put(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    const businessId = req['businessId'] as string;
    return this.customersService.update(businessId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: express.Request, @Param('id') id: string) {
    const businessId = req['businessId'] as string;
    return this.customersService.remove(businessId, id);
  }
}
