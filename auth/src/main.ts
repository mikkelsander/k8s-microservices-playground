import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { logger } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  //global middleware
  app.use(logger);
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
