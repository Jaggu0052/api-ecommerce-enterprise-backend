import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'

import { Messages } from '../constants/messages.constants'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        if (
          response &&
          typeof response === 'object' &&
          'success' in response
        ) {
          return response
        }

        return {
          success: true,
          message: Messages.OPERATION_SUCCESSFUL,
          data: response ?? null,
        }
      }),
    )
  }
}
