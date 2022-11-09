import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  signUp(): string {
    return 'sign up';
  }

  signIn(): string {
    return 'sign in';
  }

  signOut(): string {
    return 'sign out';
  }
}
