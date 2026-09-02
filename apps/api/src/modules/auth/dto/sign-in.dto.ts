import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UserRoles } from '@/common/interfaces/enums';

export class SignInDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class AuthenticatedUser {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'admin' })
  username: string;
  @ApiProperty({ example: 'Administrador General' })
  nombre: string;
  @ApiProperty({
    enum: UserRoles,
    enumName: 'RolUsuario',
  })
  rol: UserRoles;
}

export class SignInResponseDto {
  @ApiProperty()
  user: AuthenticatedUser;
  @ApiProperty()
  token: string;
}
