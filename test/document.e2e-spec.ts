import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('DocumentController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = moduleFixture.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.document.deleteMany();
  });

  afterAll(async () => {
    await prisma.document.deleteMany();
    await app.close();
  });

  it('POST create returns ok', () => {
    return request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'foo', value: 'bar' })
      .expect(200)
      .expect({ status: 'ok', code: 0 });
  });

  it('POST create duplicate key returns error code 2', async () => {
    await request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'dup', value: 'first' })
      .expect(200);

    return request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'dup', value: 'second' })
      .expect(200)
      .expect({ status: 'error', code: 2 });
  });

  it('GET returns value for existing key', async () => {
    await request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'get-me', value: 'hello' })
      .expect(200);

    return request(app.getHttpServer())
      .get('/document/get-me')
      .expect(200)
      .expect({ status: 'ok', code: 0, value: 'hello' });
  });

  it('GET returns error for missing key', () => {
    return request(app.getHttpServer())
      .get('/document/missing')
      .expect(200)
      .expect({ status: 'error', code: 3 });
  });

  it('POST update returns ok', async () => {
    await request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'upd', value: 'old' })
      .expect(200);

    return request(app.getHttpServer())
      .post('/document')
      .send({ action: 'update', key: 'upd', value: 'new' })
      .expect(200)
      .expect({ status: 'ok', code: 0 });
  });

  it('POST update missing key returns error code 3', () => {
    return request(app.getHttpServer())
      .post('/document')
      .send({ action: 'update', key: 'nope', value: 'val' })
      .expect(200)
      .expect({ status: 'error', code: 3 });
  });

  it('POST delete returns ok', async () => {
    await request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'del', value: 'x' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/document')
      .send({ action: 'delete', key: 'del' })
      .expect(200)
      .expect({ status: 'ok', code: 0 });

    return request(app.getHttpServer())
      .get('/document/del')
      .expect(200)
      .expect({ status: 'error', code: 3 });
  });

  it('POST delete missing key returns error code 3', () => {
    return request(app.getHttpServer())
      .post('/document')
      .send({ action: 'delete', key: 'ghost' })
      .expect(200)
      .expect({ status: 'error', code: 3 });
  });

  it('POST invalid payload returns error code 1', () => {
    return request(app.getHttpServer())
      .post('/document')
      .send({ action: 'create', key: 'k' })
      .expect(200)
      .expect({ status: 'error', code: 1 });
  });
});
