import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

// Expiry in seconds; default 1 hour, minimum 60s to avoid accidental 1s tokens
const parsed = process.env.JWT_EXPIRES_IN
  ? parseInt(process.env.JWT_EXPIRES_IN, 10)
  : NaN;
const JWT_EXPIRES_IN_SEC = Number.isNaN(parsed) || parsed < 60 ? 3600 : parsed;

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: JWT_EXPIRES_IN_SEC,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
