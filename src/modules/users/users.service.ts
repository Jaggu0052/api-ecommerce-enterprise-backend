import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common'

import * as bcrypt from 'bcrypt'

import { PrismaService } from 'src/prisma/prisma.service'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @Optional() private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      })

    if (existingUser && !existingUser.deletedAt) {
      throw new BadRequestException(
        'User already exists',
      )
    }

    const hashedPassword =
      await bcrypt.hash(dto.password, 10)

    const user =
      await this.prisma.user.create({
        data: {
          name: dto.name,

          email: dto.email,

          phone: dto.phone,

          password: hashedPassword,

          roleId: dto.roleId,
        },

        include: {
          role: true,
        },
      })

    const { password, ...safeUser } = user

    return {
      success: true,
      message: 'User created successfully',
      data: safeUser,
    }
  }

  async findAll() {
    const users =
      await this.prisma.user.findMany({
        include: {
          role: true,
        },
        where: {
          deletedAt: null,
        },

        orderBy: {
          createdAt: 'desc',
        },
      })

    const safeUsers = users.map(({ password, ...user }) => user)

    return {
      success: true,
      message: 'Users fetched successfully',
      data: safeUsers,
    }
  }

  async findOne(id: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
          deletedAt: null,
        },

        include: {
          role: true,
        },
      })

    if (!user) {
      throw new NotFoundException(
        'User not found',
      )
    }

    const { password, ...safeUser } = user

    return {
      success: true,
      message: 'User fetched successfully',
      data: safeUser,
    }
  }

  async update(
    id: string,
    dto: UpdateUserDto,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      )
    }

    const updateData =
      dto.password
        ? {
            ...dto,
            password: await bcrypt.hash(dto.password, 10),
          }
        : dto

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id,
        },

        data: updateData,

        include: {
          role: true,
        },
      })

    const { password, ...safeUser } = updatedUser

    return {
      success: true,
      message: 'User updated successfully',
      data: safeUser,
    }
  }

  async remove(id: string) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      )
    }

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return {
      success: true,
      message: 'User deleted successfully',
    }
  }
}
