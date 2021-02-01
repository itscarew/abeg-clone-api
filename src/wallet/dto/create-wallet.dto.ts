import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { CURRENCIES } from '../enum/wallet.dto';

export class CreateWalletDto {
  @IsOptional()
  userId?: string;

  @IsNotEmpty()
  @IsIn(Object.values(CURRENCIES))
  currency: string;
}

export class TransferDto {
  @IsOptional()
  senderId?: string;

  @IsNotEmpty()
  recipientId: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsIn(Object.values(CURRENCIES))
  currency: string;

  @IsNotEmpty()
  @IsOptional()
  reason: string;
}
