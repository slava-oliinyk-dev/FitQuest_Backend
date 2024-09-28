import { IsString } from 'class-validator';

export class DayDto {
  @IsString({ message: 'Day name is required' })
  dayName: string;

  @IsString({ message: 'Muscle group is required' })
  muscle: string;
}
