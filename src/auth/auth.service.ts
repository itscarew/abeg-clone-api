import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UpdateAuthCredentialsDto } from './dto/update-auth-credentials.dto';
import { User } from './schema/user.schema';

import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private walletService: WalletService,
  ) {}

  async signin(user: User) {
    const payload = {
      username: user.username,
      email: user.email,
      sub: user._id,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signup(authCredentialsDto: AuthCredentialsDto) {
    const {
      fullname,
      username,
      email,
      password,
      phoneNumber,
    } = authCredentialsDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      fullname,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    try {
      await user.save();
      await this.walletService.createWallet(user._id);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('user info already taken');
      }
      throw error;
    }
  }

  async me({ user }) {
    return user;
  }

  async findUserById(id) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async updateUser(id, updateAuthCredentialsDto: UpdateAuthCredentialsDto) {
    const user = await this.findUserById(id.sub);

    if (user) {
      await this.userModel.findByIdAndUpdate(id.sub, updateAuthCredentialsDto, {
        new: true,
        useFindAndModify: false,
      });
      return { message: 'user updated successfully' };
    }

    throw new NotFoundException();
  }

  async deleteUser(id) {
    const user = await this.findUserById(id.sub);

    if (!user) {
      throw new NotFoundException();
    }
    await this.userModel.findByIdAndDelete(id.sub);

    return { message: 'user deleted successfully' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (valid) {
      return user;
    }

    return null;
  }
}
