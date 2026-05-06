import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CreateSaveDto } from './dto/create-save.dto';
import { CreateCareerSaveResponseDto } from './dto/save-response.dto';
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
}
