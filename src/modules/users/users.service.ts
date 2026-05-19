import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import * as bcrypt from 'bcrypt'

import { PrismaService } from 'src/prisma/prisma.service'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      })

    if (existingUser) {
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

    return {
      success: true,
      message: 'User created successfully',
      data: user,
    }
  }

  async findAll() {
    const users =
      await this.prisma.user.findMany({
        include: {
          role: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      })

    return {
      success: true,
      data: users,
    }
  }

  async findOne(id: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
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

    return {
      success: true,
      data: user,
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
        },
      })

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      )
    }

    const updatedUser =
      await this.prisma.user.update({
        where: {
          id,
        },

        data: dto,

        include: {
          role: true,
        },
      })

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    }
  }

  async remove(id: string) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          id,
        },
      })

    if (!existingUser) {
      throw new NotFoundException(
        'User not found',
      )
    }

    await this.prisma.user.delete({
      where: {
        id,
      },
    })

    return {
      success: true,
      message: 'User deleted successfully',
    }
  }
}