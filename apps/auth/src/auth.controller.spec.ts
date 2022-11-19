import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import {
  DuplicateEmailError,
  InvalidPasswordError,
  NotFoundError,
} from './errors/errors';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const signInDto: SignInDto = {
    email: '.',
    password: '.',
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(() => {}),
            signIn: jest.fn(() => {}),
            getAccounts: jest.fn(() => []),
          },
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should return "pong" on ping', async () => {
    expect(authController.ping()).toBe('pong');
  });

  describe('sign up', () => {
    it('should call auth service', async () => {
      jest.spyOn(authService, 'signUp').mockImplementation(() => null);

      await authController.signUp(signInDto);

      expect(authService.signUp).toHaveBeenCalled();
      expect(authService.signUp).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
    });

    it('should throw ConflictException when catching DuplicateEmailError from auth service', async () => {
      jest.spyOn(authService, 'signUp').mockImplementation(() => {
        throw new DuplicateEmailError('');
      });

      try {
        await authController.signUp(signInDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
      }
    });
  });

  describe('sign in', () => {
    it('should call auth service', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(() => null);

      await authController.signIn(signInDto);

      expect(authService.signIn).toHaveBeenCalled();
      expect(authService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
    });

    it('should throw Unauthorized exception when catching NotFoundError from auth service', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(() => {
        throw new NotFoundError('');
      });

      try {
        await authController.signIn(signInDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw Unauthorized exception when catching PasswordInvalid error from auth service', async () => {
      jest.spyOn(authService, 'signIn').mockImplementation(() => {
        throw new InvalidPasswordError('');
      });

      try {
        await authController.signIn(signInDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('get accounts', () => {
    it('should call auth service', async () => {
      jest.spyOn(authService, 'getAccounts').mockImplementation(() => null);
      await authController.getAccounts();
      expect(authService.getAccounts).toHaveBeenCalled();
    });
  });
});
