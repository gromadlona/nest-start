export interface JwtPayload {
  email: string;
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
