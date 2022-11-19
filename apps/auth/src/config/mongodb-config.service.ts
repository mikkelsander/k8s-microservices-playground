import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

@Injectable()
export class MongoDbConfigService implements MongooseOptionsFactory {
  private user: string;
  private password: string;
  private host: string;
  private port: string;
  private db: string;

  constructor(private readonly configService: ConfigService) {
    this.user = configService.getOrThrow<string>('MONGODB_USER');
    this.password = configService.getOrThrow<string>('MONGODB_PASSWORD');
    this.host = configService.getOrThrow<string>('MONGODB_HOST');
    this.port = configService.getOrThrow<string>('MONGODB_PORT');
    this.db = configService.getOrThrow<string>('MONGODB_DB');
  }

  public createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.db}`,
      authSource: 'admin',
    };
  }
}
