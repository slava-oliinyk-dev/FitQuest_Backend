export interface ITelegramRepository {
  sendMessage: (message: string) => Promise<{ success: boolean; message?: string }>;
}
