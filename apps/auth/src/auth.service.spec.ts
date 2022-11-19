import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { AuthService } from './auth.service';
import {
  DuplicateEmailError,
  InvalidPasswordError,
  NotFoundError,
} from './errors/errors';
import { User, UserDocument } from './schemas/user.schema';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userModel: Model<UserDocument>;

  const email = '.';
  const password = '.';

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secretOrPrivateKey: 'test-secret',
        }),
      ],
      providers: [
        AuthService,
        {
          provide: getModelToken('User'),
          useValue: {
            find: jest.fn(() => {}),
            findOne: jest.fn(() => {}),
            create: jest.fn(() => {}),
            lean: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    jwtService = app.get<JwtService>(JwtService);
    userModel = app.get<Model<UserDocument>>('UserModel');
  });

  beforeEach(async () => jest.clearAllMocks());

  describe('sign up', () => {
    it('should create new user with a generated salt and hashed password', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

      jest.spyOn(userModel, 'create').mockImplementationOnce((user: User) => {
        const _id = new mongoose.Types.ObjectId();
        return Promise.resolve({
          _id: _id,
          id: _id.toString(),
          ...user,
        });
      });

      const user = await authService.signUp(email, password);

      expect(user.id).toBeDefined();
      expect(user.email).toEqual(email);
      expect(user.password).not.toEqual(password);
      expect(user.salt).toBeDefined();
      expect(userModel.findOne).toHaveBeenCalled();
      expect(userModel.create).toHaveBeenCalled();
    });

    it('should throw an DuplicateEmailError during sign up, if a user with the same email already exist', async () => {
      try {
        jest
          .spyOn(userModel, 'findOne')
          .mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

        await authService.signUp(email, password);
      } catch (error) {
        expect(error).toBeInstanceOf(DuplicateEmailError);
        expect(userModel.findOne).toHaveBeenCalled();
        expect(userModel.create).not.toHaveBeenCalled();
      }
    });
  });

  describe('sign in', () => {
    it('should generate a jwt token if a valid email and password is provided', async () => {
      const _id = new mongoose.Types.ObjectId();

      jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(<UserDocument>{
        _id: _id,
        id: _id.toString(),
        email: email,
        salt: 'x',
        password: crypto
          .pbkdf2Sync(password, 'x', 1000, 64, `sha512`)
          .toString(`hex`),
      });

      const token = await authService.signIn(email, password);
      expect(token).toBeDefined();

      const verifiedToken = jwtService.verify(token); //verifies signature and decodes token - throws error if invalid signature

      expect(verifiedToken.userId).toBeDefined();
      expect(verifiedToken.email).toEqual(email);
      expect(userModel.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundError if email does not exist in database', async () => {
      try {
        jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(null);

        await authService.signIn(email, password);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(userModel.findOne).toHaveBeenCalled();
      }
    });

    it('should throw InvalidPasswordError if a wrong password is provided', async () => {
      try {
        const _id = new mongoose.Types.ObjectId();

        jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(<UserDocument>{
          _id: _id,
          id: _id.toString(),
          email: email,
          salt: 'x',
          password: crypto
            .pbkdf2Sync(password, 'x', 1000, 64, `sha512`)
            .toString(`hex`),
        });

        await authService.signIn(email, password + 'x');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidPasswordError);
        expect(userModel.findOne).toHaveBeenCalled();
      }
    });
  });

  describe('get accounts', () => {
    it('should call mongoose user model', async () => {
      jest.spyOn(userModel, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValueOnce([]),
        }),
      } as any);

      await authService.getAccounts();
      expect(userModel.find).toHaveBeenCalled();
    });
  });
});
