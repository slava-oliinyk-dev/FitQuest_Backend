import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProgramDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString({ message: 'Program title is required' })
  @IsNotEmpty({ message: 'Program title must not be empty' })
  title: string;
}
