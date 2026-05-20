import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  healthcheck(): { status: 'ok', uptime: number } {
    return { status: 'ok', uptime: process.uptime() };
  }
}
