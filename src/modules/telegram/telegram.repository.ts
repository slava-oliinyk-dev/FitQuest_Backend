import { ITelegramRepository } from './telegram.repository.interface';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { TYPES } from '../../types';
import { ILogger } from '../../log/logger.interface';
import axios from 'axios';
import { IConfigService } from '../../config/config.service.interface';

@injectable()
export class TelegramRepository implements ITelegramRepository {
  private readonly telegramApiUrl: string;
  private readonly chatId: string;

  constructor(
    @inject(TYPES.ILogger) private readonly loggerService: ILogger,
    @inject(TYPES.ConfigService) private readonly configService: IConfigService,
  ) {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get('TELEGRAM_CHAT_ID');
    this.telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  }
  async sendMessage(message: string): Promise<{ success: boolean; message?: string }> {
    try {
      await axios.post(this.telegramApiUrl, {
        chat_id: this.chatId,
        text: message,
      });
      this.loggerService.info(`[TelegramRepository] Message delivered to chat ${this.chatId}.`);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.description || error?.message || 'Unknown error';
      this.loggerService.error(
        `[TelegramRepository] Failed to send data to Telegram: ${errorMessage}`,
      );
      return { success: false, message: `Failed to send data to Telegram: ${errorMessage}` };
    }
  }
}
