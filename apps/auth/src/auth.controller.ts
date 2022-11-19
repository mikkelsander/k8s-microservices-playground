import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CustomError } from './errors/errors';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AccessTokenDto } from './dto/access-token.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('ping')
  ping(): string {
    return 'pong';
  }

  @Post('signup')
  @HttpCode(201)
  async signUp(@Body(ValidationPipe) dto: SignInDto): Promise<User> {
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

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body(ValidationPipe) dto: SignInDto): Promise<AccessTokenDto> {
    try {
      const token = await this.authService.signIn(dto.email, dto.password);
      return new AccessTokenDto(token);
    } catch (error) {
      if (error instanceof CustomError) {
        throw new UnauthorizedException(`invalid credentials`);
      }

      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  async getAccounts(): Promise<User[]> {
    return await this.authService.getAccounts();
  }
}
