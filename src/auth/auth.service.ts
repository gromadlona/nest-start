import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.userService.findByEmail(email);

    if (user && user?.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        return user;
      }
    }

    return null;
  }

  async generateNewTokens(user: UserDocument) {
    const userIdString = user._id.toString();

    const accessTokenPayload = {
      email: user.email,
      sub: userIdString,
      username: user.username,
    };
    const accessToken = this.jwtService.sign(accessTokenPayload);

    const refreshTokenPayload = { sub: userIdString };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET')!,
      expiresIn:
        this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_TIME')! + 's',
    });

    const refreshTokenExpiresInSecond = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_EXPIRATION_TIME')!,
      10,
    );
    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpiresInSecond * 1000,
    );

    await this.userService.updateRefreshToken(
      userIdString,
      refreshToken,
      refreshTokenExpiresAt,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(user: UserDocument) {
    return this.generateNewTokens(user);
  }

  async removeRefreshToken(userId: string): Promise<UserDocument | null> {
    return this.userService.updateRefreshToken(userId, null, null);
  }
}
