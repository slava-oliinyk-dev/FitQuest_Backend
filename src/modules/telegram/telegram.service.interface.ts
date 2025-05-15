export interface ITelegramService {
	consultationService: (data: any) => Promise<{ success: boolean; message?: string }>;
}
