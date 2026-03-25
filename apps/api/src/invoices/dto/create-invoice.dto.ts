import { IsNumber, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  customerId: string;

  @IsNumber()
  amount: number;

  @IsString()
  dueDate: string; // ISO date
}
