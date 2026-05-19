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

import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

import { RolesService } from './roles.service'

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateRoleDto,
  ) {
    try {
      return await this.rolesService.create(
        dto,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to create role',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.rolesService.findAll()
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to fetch roles',
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
      return await this.rolesService.findOne(
        id,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to fetch role',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,

    @Body() dto: UpdateRoleDto,
  ) {
    try {
      return await this.rolesService.update(
        id,
        dto,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to update role',
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
      return await this.rolesService.remove(
        id,
      )
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message:
            error.message ||
            'Failed to delete role',
        },
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}