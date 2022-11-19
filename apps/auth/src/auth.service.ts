import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
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
    const exists = await this.userModel.findOne({ email: email });

    if (exists != null) {
      this.logger.log(
        `Reject sign up for user '${email}': email already in use`,
      );

      throw new DuplicateEmailError('email already in use');
    }

    const [salt, hashedPassword] = this.hashPassword(password);

    const user = await this.userModel.create({
      email,
      salt,
      password: hashedPassword,
    });

    return user;
  }

  async signIn(email: string, password: string): Promise<string> {
    const user = await this.userModel.findOne({ email: email });

    if (user == null) {
      this.logger.log(`Reject sign in for user '${email}': email not found`);

      throw new NotFoundError('email not found');
    }

    if (!this.validatePassword(password, user)) {
      this.logger.log(`Reject sign in for user '${email}': invalid password`);

      throw new InvalidPasswordError('invalid password');
    }

    const token = await this.jwtService.signAsync({
      userId: user.id,
      email: user.email,
    });

    return token;
  }

  async getAccounts(): Promise<User[]> {
    const users = await this.userModel
      .find()
      .select({ _id: true, email: true })
      .lean();

    return users;
  }

  private hashPassword = (password: string): [string, string] => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
      .toString(`hex`);

    return [salt, hash];
  };

  private validatePassword = (password: string, user: User): boolean => {
    const hash = crypto
      .pbkdf2Sync(password, user.salt, 1000, 64, `sha512`)
      .toString(`hex`);

    return hash === user.password;
  };
}
