import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy, AuthGuard } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/db/schemas/user.schema';
import { AuthService } from '../auth.service';
import { CustomError } from '../errors/errors';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    try {
      const user = await this.authService.signIn(email, password);
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw new UnauthorizedException(`invalid credentials`);
      }

      throw error;
    }
  }
}
