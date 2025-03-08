import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin@sugria.com',
    description: 'The email address for login'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'sugria@admin2024',
    description: 'The password for login'
  })
  @IsString()
  password: string;
} 