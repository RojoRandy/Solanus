import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRoles } from '@/common/interfaces/enums';

export class CrearUsuarioDto {
  @ApiProperty({ example: 'jvoluntario' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Jose Voluntario' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRoles, enumName: 'RolUsuario' })
  @IsEnum(UserRoles)
  rol: UserRoles;
}

export class ActualizarUsuarioDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ required: false, enum: UserRoles, enumName: 'RolUsuario' })
  @IsOptional()
  @IsEnum(UserRoles)
  rol?: UserRoles;

  @ApiProperty({ required: false, minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UsuarioResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  username: string;
  @ApiProperty()
  nombre: string;
  @ApiProperty({ enum: UserRoles, enumName: 'RolUsuario' })
  rol: UserRoles;
  @ApiProperty()
  activo: boolean;
  @ApiProperty()
  createdAt: Date;
}
