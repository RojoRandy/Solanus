import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorResponseDto } from '../dto/response.dto';

const Exceptions = {
  EMPTY_TOKEN: (data?: any) =>
    new BadRequestException(Responses.EMPTY_TOKEN(data)),
  INVALID_TOKEN: (data?: any) =>
    new UnauthorizedException(Responses.INVALID_TOKEN(data)),
  PASSWORDS_DO_NOT_MATCH: (data?: any) =>
    new UnauthorizedException(Responses.PASSWORDS_DO_NOT_MATCH(data)),
  USER_ALREADY_EXISTS: (data?: any) =>
    new BadRequestException(Responses.USER_ALREADY_EXISTS(data)),
  USER_NOT_FOUND: (data?: any) =>
    new UnauthorizedException(Responses.USER_NOT_FOUND(data)),
  ERROR_SAVING_USER_INFO: (data?: any) =>
    new InternalServerErrorException(Responses.ERROR_SAVING_USER_INFO(data)),
  INCORRECT_PASSWORD: (data?: any) =>
    new UnauthorizedException(Responses.INCORRECT_PASSWORD(data)),
  ERROR_REGISTERING_USER: (data?: any) =>
    new InternalServerErrorException(Responses.ERROR_REGISTERING_USER(data)),
  ERROR_GENERATING_JWT: (data?: any) =>
    new InternalServerErrorException(Responses.ERROR_GENERATING_JWT(data)),
  ERROR_SAVING_PASSWORD_RECOVERY_TOKEN: (data?: any) =>
    new InternalServerErrorException(
      Responses.ERROR_SAVING_PASSWORD_RECOVERY_TOKEN(data),
    ),
  GENERATING_PASSWORD_RECOVERY_TOKEN_ERROR: (data?: any) =>
    new InternalServerErrorException(
      Responses.GENERATING_PASSWORD_RECOVERY_TOKEN_ERROR(data),
    ),
  UPDATING_USER_PASSWORD_ERROR: (data?: any) =>
    new InternalServerErrorException(
      Responses.UPDATING_USER_PASSWORD_ERROR(data),
    ),
  TOKEN_CODE_DO_NOT_MATCH: (data?: any) =>
    new BadRequestException(Responses.TOKEN_CODE_DO_NOT_MATCH(data)),
  TOKEN_CODE_HAS_EXPIRED: (data?: any) =>
    new BadRequestException(Responses.TOKEN_CODE_DO_NOT_MATCH(data)),
};

const Responses = {
  EMPTY_TOKEN: (data?: any) =>
    new ErrorResponseDto('EMPTY_TOKEN', 'No se recibio el token', data),
  INVALID_TOKEN: (data?: any) =>
    new ErrorResponseDto(
      'INVALID_TOKEN',
      'El token es incorrecto o ha expirado',
      data,
    ),
  PASSWORDS_DO_NOT_MATCH: (data?: any) =>
    new ErrorResponseDto(
      'PASSWORDS_DO_NOT_MATCH',
      'La contraseña es incorrecta',
      data,
    ),
  USER_ALREADY_EXISTS: (data?: any) =>
    new ErrorResponseDto(
      'USER_ALREADY_EXISTS',
      'Ya existe un usuario con esa cuenta',
      data,
    ),
  USER_NOT_FOUND: (data?: any) =>
    new ErrorResponseDto(
      'USER_NOT_FOUND',
      'No se encontro un usuario con el correo proporcionado',
      data,
    ),
  ERROR_SAVING_USER_INFO: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_SAVING_USER_INFO',
      'No se pudo guardar la información de la cuenta',
      data,
    ),
  INCORRECT_PASSWORD: (data?: any) =>
    new ErrorResponseDto(
      'INCORRECT_PASSWORD',
      'La contraseña ingresada es incorrecta',
      data,
    ),
  ERROR_REGISTERING_USER: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_REGISTERING_USER',
      'Fallo el registro de usuarios.',
      data,
    ),
  ERROR_GENERATING_JWT: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_GENERATING_JWT',
      'Fallo la generación de token de usuario.',
      data,
    ),
  ERROR_SAVING_PASSWORD_RECOVERY_TOKEN: (data?: any) =>
    new ErrorResponseDto(
      'ERROR_SAVING_PASSWORD_RECOVERY_TOKEN',
      'Fallo el guardado de el código de recuperación de contraseña.',
      data,
    ),
  GENERATING_PASSWORD_RECOVERY_TOKEN_ERROR: (data?: any) =>
    new ErrorResponseDto(
      'GENERATING_PASSWORD_RECOVERY_TOKEN_ERROR',
      'Fallo la generación del código de recuperación de contraseña.',
      data,
    ),
  UPDATING_USER_PASSWORD_ERROR: (data?: any) =>
    new ErrorResponseDto(
      'UPDATING_USER_PASSWORD_ERROR',
      'Fallo la actualización de la contraseña del usuario',
      data,
    ),
  TOKEN_CODE_DO_NOT_MATCH: (data?: any) =>
    new ErrorResponseDto(
      'TOKEN_CODE_DO_NOT_MATCH',
      'El código para actualización de contraseña no coincide.',
      data,
    ),
  TOKEN_CODE_HAS_EXPIRED: (data?: any) =>
    new ErrorResponseDto(
      'TOKEN_CODE_HAS_EXPIRED',
      'El código para actualización de contraseña ha expirado.',
      data,
    ),
};

export const AuthErrors = {
  Exceptions,
  Responses,
};
