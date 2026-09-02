import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ApiResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    app.useGlobalInterceptors(new ApiResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/auth/sign-in rechaza credenciales inexistentes', () => {
    return request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({ username: 'no-existe', password: 'lo-que-sea' })
      .expect(401);
  });

  it('POST /api/auth/sign-in requiere username y password', () => {
    return request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send({})
      .expect(400);
  });

  it('GET /api/auth/check-status sin token responde 401', () => {
    return request(app.getHttpServer())
      .get('/api/auth/check-status')
      .expect(401);
  });
});
