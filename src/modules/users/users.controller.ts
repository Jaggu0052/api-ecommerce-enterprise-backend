import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateUserDto,
  ) {
    try {
      return await this.usersService.create(
        dto,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to create user',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.usersService.findAll()
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to fetch users',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    try {
      return await this.usersService.findOne(
        id,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to fetch user',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,

    @Body() dto: UpdateUserDto,
  ) {
    try {
      return await this.usersService.update(
        id,
        dto,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to update user',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ) {
    try {
      return await this.usersService.remove(
        id,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to delete user',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}