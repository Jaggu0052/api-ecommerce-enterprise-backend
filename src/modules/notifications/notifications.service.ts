import { Injectable, Optional } from '@nestjs/common'
import { CrudService } from '../../common/services/crud.service'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class NotificationsService extends CrudService {
  constructor(@Optional() prisma: PrismaService) {
    super(prisma, {
      model: 'notification',
      searchableFields: ['title', 'message'],
      include: { user: true },
      defaultOrderBy: { createdAt: 'desc' },
    })
  }

  createWhatsAppPayload(phone: string, message: string) {
    return {
      provider: process.env.WHATSAPP_PROVIDER ?? 'placeholder',
      to: phone,
      message,
      status: 'queued',
    }
  }
}
