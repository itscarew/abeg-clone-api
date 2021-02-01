import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { WalletHistoryType } from '../enum/wallet.dto';

@Schema({ timestamps: true })
export class WalletHistory extends Document {
  @Prop({ required: true })
  walletId: string;

  @Prop({ enum: Object.values(WalletHistoryType) })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true })
  reason: string;
}

export const WalletHistorySchema = SchemaFactory.createForClass(WalletHistory);
