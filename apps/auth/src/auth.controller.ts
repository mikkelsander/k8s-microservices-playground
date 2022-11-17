import {
  Request,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CustomError } from './errors/errors';
import { User } from './db/schemas/user.schema';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }

  @Post('signup')
  @HttpCode(201)
  async signUp(@Body() dto: SignInDto): Promise<User> {
    try {
      const user = await this.authService.signUp(dto.email, dto.password);
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw new ConflictException(`email already in use`);
      }

      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @HttpCode(200)
  async signIn(@Request() req): Promise<{ access_token: string }> {
    return await this.authService.signJWT(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  async getAccounts(): Promise<User[]> {
    return await this.authService.getAccounts();
  }
}
