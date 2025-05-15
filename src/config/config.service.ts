import { config as loadEnv } from 'dotenv';
import { inject, injectable } from 'inversify';
import { IConfigService } from './config.service.interface';
import { ILogger } from '../log/logger.interface';
import { TYPES } from '../types';

@injectable()
export class ConfigService implements IConfigService {
  private env: Record<string, string>;

  constructor(@inject(TYPES.ILogger) private logger: ILogger) {
    const result = loadEnv();
    if (result.error) {
      this.logger.warn('[ConfigService] .env file not found — using process.env');

      this.env = { ...process.env } as Record<string, string>;
    } else {
      this.logger.log('[ConfigService] Loaded .env configuration');
      this.env = result.parsed as Record<string, string>;
    }
  }

  get(key: string): string {
    const val = this.env[key];
    if (val === undefined) {
      this.logger.error(`[ConfigService] Missing configuration for key "${key}"`);
      throw new Error(`Missing configuration key "${key}"`);
    }
    return val;
  }
}
