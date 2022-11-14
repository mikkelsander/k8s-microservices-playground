import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './db/schemas/user.schema';
import {
  NotFoundError,
  InvalidPasswordError,
  DuplicateEmailError,
} from './errors/errors';

Logger;
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string): Promise<User> {
    const exists = await this.userModel.exists({ email: email }).lean();

    if (exists != null) {
      this.logger.log(
        `Reject sign up for user '${email}': email already in use`,
      );

      throw new DuplicateEmailError('email already in use');
    }

    const user = new this.userModel({ email, password });

    await user.save();

    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email });

    if (user == null) {
      this.logger.log(`Reject sign in for user '${email}': email not found`);

      throw new NotFoundError('email not found');
    }
    const bob = user.validatePassword(password);

    if (!user.validatePassword(password)) {
      this.logger.log(`Reject sign in for user '${email}': invalid password`);

      throw new InvalidPasswordError('invalid password');
    }

    return user;
  }

  async getAccounts(): Promise<User[]> {
    const users = await this.userModel
      .find()
      .select({ _id: true, email: true })
      .lean();

    return users;
  }

  async signJWT(user: User): Promise<{ access_token: string }> {
    return {
      access_token: await this.jwtService.signAsync({
        userId: user.id,
        email: user.email,
      }),
    };
  }
}
