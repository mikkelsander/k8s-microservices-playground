import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('signup')
  signUp(): string {
    return 'sign up';
  }

  @Get('signin')
  signIn(): string {
    return 'sign in';
  }

  @Get('signout')
  signOut(): string {
    return 'sign out';
  }
}
