import { PickType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from '../schemas/user.schema';

export class CreateUserBase extends PickType(User, [
  'username',
  'email',
  'password',
] as const) {}

export class CreateUserDto extends CreateUserBase {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
