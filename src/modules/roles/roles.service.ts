import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'

import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateRoleDto) {
    const existingRole =
      await this.prisma.role.findFirst({
        where: {
          name: dto.name,
        },
      })

    if (existingRole) {
      throw new BadRequestException(
        'Role already exists',
      )
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    })

    return {
      success: true,
      message: 'Role created successfully',
      data: role,
    }
  }

  async findAll() {
    const roles =
      await this.prisma.role.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })

    return {
      success: true,
      data: roles,
    }
  }

  async findOne(id: string) {
    const role =
      await this.prisma.role.findUnique({
        where: {
          id,
        },
      })

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      )
    }

    return {
      success: true,
      data: role,
    }
  }

  async update(
    id: string,
    dto: UpdateRoleDto,
  ) {
    const existingRole =
      await this.prisma.role.findUnique({
        where: {
          id,
        },
      })

    if (!existingRole) {
      throw new NotFoundException(
        'Role not found',
      )
    }

    const updatedRole =
      await this.prisma.role.update({
        where: {
          id,
        },

        data: dto,
      })

    return {
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    }
  }

  async remove(id: string) {
    const existingRole =
      await this.prisma.role.findUnique({
        where: {
          id,
        },
      })

    if (!existingRole) {
      throw new NotFoundException(
        'Role not found',
      )
    }

    await this.prisma.role.delete({
      where: {
        id,
      },
    })

    return {
      success: true,
      message: 'Role deleted successfully',
    }
  }
}