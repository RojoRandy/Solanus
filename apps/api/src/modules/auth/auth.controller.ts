import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AuthenticatedUser,
  SignInDto,
  SignInResponseDto,
} from './dto/sign-in.dto';
import {
  ApiBadRequestResponseError,
  ApiInternalServerErrorResponseError,
  ApiOkSchemaResponse,
  ApiUnauthorizedResponseError,
} from '@/common/dto/response.dto';
import { SignInUseCase } from './usecases/sign-in.usecase';
import { AuthErrors } from '@/common/errors/auth.errors';
import { AuthService } from './auth.service';
import { AuthUser } from './decorators/auth-user.decorator';
import { Auth } from './decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('SignInUseCase')
    private readonly signInUseCase: SignInUseCase,
    private readonly authService: AuthService,
  ) {}

  @Post('sign-in')
  @ApiOkSchemaResponse(SignInResponseDto)
  @ApiBadRequestResponseError([AuthErrors.Responses.EMPTY_TOKEN()])
  @ApiUnauthorizedResponseError([
    AuthErrors.Responses.USER_NOT_FOUND({ username: 'admin' }),
    AuthErrors.Responses.INVALID_TOKEN(),
    AuthErrors.Responses.PASSWORDS_DO_NOT_MATCH(),
  ])
  @ApiInternalServerErrorResponseError()
  async signIn(@Body() signInDto: SignInDto) {
    return this.signInUseCase.execute(signInDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@AuthUser() user: AuthenticatedUser) {
    return this.authService.checkAuthStatus(user);
  }
}
