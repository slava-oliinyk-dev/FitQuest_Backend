import { IsString } from 'class-validator';

export class ProgramDto {
  @IsString({ message: 'Program title is required' }) 
  title: string;

  @IsString({ message: 'Program color is required' }) 
  color: string;
}
