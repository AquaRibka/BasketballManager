import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { CreateSaveDto } from './dto/create-save.dto';
import { CareerSaveStateResponseDto, CreateCareerSaveResponseDto } from './dto/save-response.dto';
import { SavesService } from './saves.service';

@ApiTags('Saves')
@Controller('saves')
export class SavesController {
  constructor(private readonly savesService: SavesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new career save with season, schedule and standings' })
  @ApiBody({ type: CreateSaveDto })
  @ApiCreatedResponse({ type: CreateCareerSaveResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiNotFoundResponse({ description: 'Selected team not found' })
  createSave(@Body() createSaveDto: CreateSaveDto) {
    return this.savesService.createSave(createSaveDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a career save with current season, schedule and standings' })
  @ApiParam({ name: 'id', description: 'Career save cuid', example: 'csave000000000000000000001' })
  @ApiOkResponse({ type: CareerSaveStateResponseDto })
  @ApiBadRequestResponse({ description: 'The provided save id is invalid' })
  @ApiNotFoundResponse({ description: 'Save not found' })
  getSave(@Param() params: CuidParamDto) {
    return this.savesService.getSave(params.id);
  }

  @Post(':id/next-season')
  @ApiOperation({ summary: 'Start the next season for an existing career save' })
  @ApiParam({ name: 'id', description: 'Career save cuid', example: 'csave000000000000000000001' })
  @ApiOkResponse({ type: CareerSaveStateResponseDto })
  @ApiBadRequestResponse({ description: 'The provided save id is invalid' })
  @ApiNotFoundResponse({ description: 'Save not found' })
  startNextSeason(@Param() params: CuidParamDto) {
    return this.savesService.startNextSeason(params.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a career save and clean up its season when it is no longer referenced' })
  @ApiParam({ name: 'id', description: 'Career save cuid', example: 'csave000000000000000000001' })
  @ApiBadRequestResponse({ description: 'The provided save id is invalid' })
  @ApiNotFoundResponse({ description: 'Save not found' })
  removeSave(@Param() params: CuidParamDto) {
    return this.savesService.deleteSave(params.id);
  }
}
