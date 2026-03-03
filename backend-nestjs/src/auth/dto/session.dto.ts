import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SessionDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsString()
  @IsOptional()
  username?: string;
}
