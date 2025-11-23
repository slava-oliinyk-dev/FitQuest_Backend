import { ConsultationDto } from './dto/consultation.dto';

export interface ITelegramService {
  sendConsultation: (data: ConsultationDto) => Promise<{ success: boolean; message: string }>;
}
