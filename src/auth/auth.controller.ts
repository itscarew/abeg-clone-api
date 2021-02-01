import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UpdateAuthCredentialsDto } from './dto/update-auth-credentials.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signin(@Request() req) {
    return this.authService.signin(req.user);
  }

  @Post('signup')
  @UsePipes(ValidationPipe)
  async signup(@Body() authCredentialsDto: AuthCredentialsDto) {
    return this.authService.signup(authCredentialsDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req) {
    return this.authService.me(req);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  findUserById(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  upateUser(
    @Request() req,
    @Body() updateAuthCredentialsDto: UpdateAuthCredentialsDto,
  ) {
    return this.authService.updateUser(req.user, updateAuthCredentialsDto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  deleteUser(@Request() req) {
    return this.authService.deleteUser(req.user);
  }
}
