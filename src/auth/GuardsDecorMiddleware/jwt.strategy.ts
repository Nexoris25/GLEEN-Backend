import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false, // Passport handles exp automatically
    });
  }

  async validate(payload: any) {
    // payload MUST match how you signed the token
    return {
      id: payload.sub,       // 🔥 REQUIRED
      email: payload.email,
      role: payload.role,   // optional
    };
  }
}
