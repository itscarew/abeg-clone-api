import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Wallet } from '../wallet/schema/wallet.schema';
import { WalletHistory } from '../wallet/schema/wallet-history.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TransferDto } from './dto/create-wallet.dto';
import { User } from 'src/auth/schema/user.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(WalletHistory.name)
    private walletHistoryModel: Model<WalletHistory>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  //create a naira currency wallet
  async createWallet(userId): Promise<Wallet> {
    const wallet = await new this.walletModel({ userId });
    return wallet.save();
  }

  async credit(
    recipientId: string,
    senderId: string,
    amount: number,
    reason: string,
  ): Promise<WalletHistory> {
    let wallet = await this.walletModel.findOne({ userId: recipientId });

    if (!wallet) {
      wallet = await this.createWallet({ userId: recipientId });
    }
    if (wallet) {
      const newWalletHistory = new this.walletHistoryModel({
        type: 'credit',
        walletId: wallet._id,
        recipientId: recipientId,
        senderId: senderId,
        amount: amount,
        previousBalance: wallet.currentBalance,
        currentBalance: wallet.currentBalance + amount,
        reason: reason,
      });

      await this.walletModel.findOneAndUpdate(
        { userId: recipientId },
        {
          $set: {
            previousBalance: wallet.currentBalance,
            currentBalance: wallet.currentBalance + amount,
          },
        },
        {
          new: true,
          useFindAndModify: false,
        },
      );

      return newWalletHistory.save();
    }
  }

  //debit wallet
  async debit(
    recipientId: string,
    senderId: string,
    amount: number,
    reason: string,
  ): Promise<WalletHistory> {
    const myWallet = await this.walletModel.findOne({ userId: senderId });

    if (myWallet) {
      if (myWallet.currentBalance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      const newWalletHistory = new this.walletHistoryModel({
        type: 'debit',
        walletId: myWallet._id,
        senderId: senderId,
        recipientId: recipientId,
        amount: amount,
        previousBalance: myWallet.currentBalance,
        currentBalance: myWallet.currentBalance - amount,
        reason: reason,
      });

      await this.walletModel.findOneAndUpdate(
        { userId: senderId },
        {
          $set: {
            previousBalance: myWallet.currentBalance,
            currentBalance: myWallet.currentBalance - amount,
          },
        },
        {
          new: true,
          useFindAndModify: false,
        },
      );

      return newWalletHistory.save();
    }
  }

  //transfer : calls debit and credit
  async transfer(transferDto: TransferDto) {
    const { recipientId, senderId, amount, reason } = transferDto;

    const user = await this.userModel.findOne({ _id: recipientId });
    if (user) {
      const debited = await this.debit(recipientId, senderId, amount, reason);
      const credited = await this.credit(recipientId, senderId, amount, reason);

      if (debited && !credited) {
        await this.credit(senderId, senderId, amount, reason);
        return { message: 'Transaction Failed' };
      }

      return { message: 'Transaction successful' };
    } else {
      throw new NotFoundException();
    }
  }

  async getWallet(userId: string): Promise<Wallet[]> {
    const wallet = await this.walletModel.findOne({ userId: userId });
    return wallet;
  }

  async getWalletHistory(userId: string): Promise<Wallet> {
    const wallet = await this.walletHistoryModel.find({ senderId: userId });
    return wallet;
  }
}
