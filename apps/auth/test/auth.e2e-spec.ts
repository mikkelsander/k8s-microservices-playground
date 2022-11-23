import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AuthController } from '../src/auth.controller';
import { AuthService } from '../src/auth.service';
import { User, UserDocument, UserSchema } from '../src/schemas/user.schema';
import { JwtStrategy } from '../src/guards/jwt.guard';
import { ConfigModule } from '@nestjs/config';

describe('AuthController (e2e) with in-memory mongo db', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;
  let userModel: Model<UserDocument>;
  let jwtService: JwtService;

  const email = 'test@test.com';
  const password = 'test';

  const SIGN_UP = '/signup';
  const SIGN_IN = '/signin';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvVars: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret', // passport jwt strategy uses the config service to initialize JWT secret, so we need to provide this
            }),
          ],
        }),
        MongooseModule.forRoot(mongoServer.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
          secretOrPrivateKey: 'test-secret',
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = app.get<JwtService>(JwtService);
    userModel = app.get<Model<UserDocument>>('UserModel');
    connection = await app.get(getConnectionToken());
    await app.init();
  });

  beforeEach(async () => {
    await userModel.deleteMany({});
  });

  afterAll(async () => {
    if (connection) {
      await connection.close();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }

    if (app) {
      app.close();
    }
  });

  describe('/ping', () => {
    it('GET', async () => {
      await request(app.getHttpServer())
        .get('/ping')
        .expect(200)
        .expect('not pong');
    });
  });

  describe('/signup', () => {
    it('POST - requests with valid credentials should return a user', async () => {
      const res = await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.email).toEqual(email);
      expect(res.body.password).not.toBeDefined();
    });

    it('POST - requests with an already existing emails should return 409', async () => {
      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password })
        .expect(201);

      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password })
        .expect(409);
    });

    it('POST - requests with an invalid emails should return 400', async () => {
      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email: 'test', password })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email: '', password })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ password })
        .expect(400);
    });

    it('POST - requests with invalid passwords should return 400', async () => {
      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password: '' })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email })
        .expect(400);
    });
  });

  describe('/signin', () => {
    it('POST - requests with valid credentials should return a valid jwt token', async () => {
      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email, password })
        .expect(200);

      const verifiedToken = jwtService.verify(res.body.accces_token); //verifies signature and decodes token - throws error if invalid signature

      expect(verifiedToken.userId).toBeDefined();
      expect(verifiedToken.email).toEqual(email);
    });

    it('POST - requests with wrong passwords should return 401', async () => {
      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password })
        .expect(201);

      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email, password: password + 'x' })
        .expect(401);
    });

    it('POST - requests with unknown emails should return 401', async () => {
      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email, password })
        .expect(401);
    });

    it('POST - requests with an invalid emails should return 400', async () => {
      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email: 'test', password })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email: '', password })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ password })
        .expect(400);
    });

    it('POST - requests with invalid passwords should return 400', async () => {
      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email, password: '' })
        .expect(400);

      await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email })
        .expect(400);
    });
  });

  describe('/accounts', () => {
    const route = '/accounts';

    it('GET - requests with a valid JWT should return a list of accounts', async () => {
      await request(app.getHttpServer())
        .post(SIGN_UP)
        .send({ email, password })
        .expect(201);

      const { body } = await request(app.getHttpServer())
        .post(SIGN_IN)
        .send({ email, password })
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/accounts')
        .set('Authorization', 'Bearer ' + body.accces_token)
        .expect(200);

      expect(res.body).toHaveLength(1);
    });
    it('GET - requests without a valid JWT should return 401', async () => {
      return request(app.getHttpServer()).get('/accounts').expect(401);
    });
  });
});
