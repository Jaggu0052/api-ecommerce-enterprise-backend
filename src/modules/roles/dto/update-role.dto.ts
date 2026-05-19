import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator'

import { UserRole } from '@prisma/client'

export class UpdateRoleDto {
  @IsOptional()
  @IsEnum(UserRole)
  name?: UserRole

  @IsOptional()
  @IsString()
  description?: string
}