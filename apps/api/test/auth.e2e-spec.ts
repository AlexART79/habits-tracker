import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import supertest from 'supertest';
import session = require('express-session');
import passport = require('passport');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

async function buildApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: false, sameSite: 'lax' as const },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  await app.init();
  return app;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await buildApp();
    prisma = app.get(PrismaService);
  }, 30000);

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /auth/me', () => {
    it('returns 401 when not authenticated', async () => {
      await supertest(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 even when no session exists', async () => {
      await supertest(app.getHttpServer())
        .post('/auth/logout')
        .expect(200)
        .expect({ message: 'Logged out' });
    });
  });
});
