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
import { User } from './schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
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
    const { username, email, password, phoneNumber } = authCredentialsDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    try {
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Username or email already taken');
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

  async deleteUser(id) {
    const user = await this.userModel.findById(id.sub);

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
