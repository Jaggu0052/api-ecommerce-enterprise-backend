import { BadRequestException, Injectable, Optional } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OtpVerificationService extends CrudService {
  constructor(@Optional() private readonly prismaService: PrismaService) {
    super(prismaService, {
      model: 'oTPVerification',
      include: { user: true },
      defaultOrderBy: { createdAt: 'desc' },
    })
  }

  async issue(data: { userId: string; type: string; otp: string; expiresAt: string }) {
    const otp = await bcrypt.hash(data.otp, 10)
    return this.create({ ...data, otp, expiresAt: new Date(data.expiresAt) })
  }

  async verify(id: string, otp: string) {
    const existing = await this.prismaService.oTPVerification.findFirst({
      where: { id, deletedAt: null, isVerified: false },
    })

    if (!existing || existing.expiresAt < new Date()) {
      throw new BadRequestException('OTP is invalid or expired')
    }

    const isValid = await bcrypt.compare(otp, existing.otp)
    if (!isValid) {
      throw new BadRequestException('OTP is invalid or expired')
    }

    const record = await this.prismaService.oTPVerification.update({
      where: { id },
      data: { isVerified: true },
    })

    return { success: true, message: 'OTP verified successfully', data: record }
  }
}
