import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PrismaModule, PassportModule.register({ session: true })],
  providers: [AuthService, SessionSerializer],
  exports: [AuthService],
})
export class AuthModule {}
