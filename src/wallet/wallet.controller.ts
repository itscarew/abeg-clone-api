import {
  Controller,
  UseGuards,
  Post,
  Request,
  Body,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { TransferDto } from './dto/create-wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  async transfer(@Request() req, @Body() transferDto: TransferDto) {
    const userId = req.user.sub;
    transferDto.senderId = userId;
    if (userId) {
      return this.walletService.transfer(transferDto);
    } else {
      throw new ForbiddenException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getWallets(@Request() req) {
    const userId = req.user.sub;
    return this.walletService.getWallet(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallethistory')
  getWalletHistory(@Request() req) {
    const userId = req.user.sub;
    return this.walletService.getWalletHistory(userId);
  }
}
