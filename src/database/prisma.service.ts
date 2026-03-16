import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../log/logger.interface';

@injectable()
export class PrismaService {
  client: PrismaClient;
  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    this.client = new PrismaClient();
  }
  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.log('[PrismaService] Connection to the database successful');
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error('[PrismaService] Database connection error ' + e.message);
      }
         throw e;
    }
  }
  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}
