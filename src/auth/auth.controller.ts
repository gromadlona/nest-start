import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Request() req: RequestWithUser,
    @Body() refreshTokenDto: RefreshTokenDto,
  ) {
    const user = req.user;

    if (
      !user.refreshToken ||
      user.refreshToken !== refreshTokenDto.refreshToken
    ) {
      throw new UnauthorizedException(
        'Invalid refresh token: Token mismatch or revoked.',
      );
    }

    if (
      !user.refreshTokenExpiresAt ||
      user.refreshTokenExpiresAt < new Date()
    ) {
      await this.authService.removeRefreshToken(user._id.toString());
      throw new UnauthorizedException('Refresh token expired or invalid.');
    }

    const newTokens = await this.authService.generateNewTokens(user);

    return newTokens;
  }
}
