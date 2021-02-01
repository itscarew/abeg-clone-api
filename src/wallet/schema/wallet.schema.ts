import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CURRENCIES } from '../enum/wallet.dto';

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ required: true, ref: 'User' })
  userId: string;

  @Prop({ required: true, default: CURRENCIES.NGN })
  currency: string;

  @Prop({ required: true, default: 0 })
  currentBalance: number;

  @Prop({ required: true, default: 0 })
  previousBalance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
