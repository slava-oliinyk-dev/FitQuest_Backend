import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DayDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString({ message: 'Day name is required' })
  @IsNotEmpty({ message: 'Day name must not be empty' })
  dayName: string;

  @IsString({ message: 'Muscle group is required' })
  @IsNotEmpty({ message: 'Muscle group must not be empty' })
  muscle: string;
}
