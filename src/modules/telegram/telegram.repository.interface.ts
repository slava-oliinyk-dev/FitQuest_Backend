export interface ITelegramRepository {
	consultationRepository: (data: any) => Promise<{ success: boolean; message?: string }>;
}
