import { Injectable } from '@nestjs/common';
import { SignInResponseDto, AuthenticatedUser } from './dto/sign-in.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthErrors } from '@/common/errors/auth.errors';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  buildSignInResponseDto(user: AuthenticatedUser): SignInResponseDto {
    const token = this.generateJWT(user);

    return {
      user,
      token,
    };
  }

  generateJWT(payload: AuthenticatedUser, jwtOptions?: JwtSignOptions): string {
    try {
      if (jwtOptions) {
        return this.jwtService.sign(payload, jwtOptions);
      } else {
        return this.jwtService.sign(payload);
      }
    } catch (error) {
      throw AuthErrors.Exceptions.ERROR_GENERATING_JWT(error);
    }
  }

  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  checkAuthStatus(user: AuthenticatedUser): SignInResponseDto {
    return this.buildSignInResponseDto(user);
  }
}
