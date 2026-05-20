import { Module } from '@nestjs/common'
import { OtpVerificationController } from './otp-verification.controller'
import { OtpVerificationService } from './otp-verification.service'

@Module({
  controllers: [OtpVerificationController],
  providers: [OtpVerificationService],
})
export class OtpVerificationModule {}
