import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSeasonDto } from './dto/create-season.dto';
import { SeasonParamDto } from './dto/season-param.dto';
import { SeasonResponseDto } from './dto/season-response.dto';
import { SeasonScheduleResponseDto } from './dto/season-schedule-response.dto';
import { SeasonStandingsResponseDto } from './dto/season-standings-response.dto';
import { UpdateSeasonStatusDto } from './dto/update-season-status.dto';
import { SeasonsService } from './seasons.service';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonsService: SeasonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new current season' })
  @ApiBody({ type: CreateSeasonDto })
  @ApiCreatedResponse({ type: SeasonResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiConflictResponse({ description: 'Current season already exists' })
  createSeason(@Body() createSeasonDto: CreateSeasonDto) {
    return this.seasonsService.createSeason(createSeasonDto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current in-progress season' })
  @ApiOkResponse({ type: SeasonResponseDto })
  @ApiNotFoundResponse({ description: 'Current season not found' })
  getCurrentSeason() {
    return this.seasonsService.getCurrentSeason();
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Generate a season schedule grouped by rounds' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiCreatedResponse({ type: SeasonScheduleResponseDto })
  @ApiBadRequestResponse({ description: 'The provided season id is invalid' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  @ApiConflictResponse({ description: 'Schedule already exists for this season' })
  generateSchedule(@Param() params: SeasonParamDto) {
    return this.seasonsService.generateSchedule(params.id);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get a season schedule grouped by rounds' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiOkResponse({ type: SeasonScheduleResponseDto })
  @ApiBadRequestResponse({ description: 'The provided season id is invalid' })
  @ApiNotFoundResponse({ description: 'Season not found or schedule not found' })
  getSchedule(@Param() params: SeasonParamDto) {
    return this.seasonsService.getSchedule(params.id);
  }

  @Get(':id/standings')
  @ApiOperation({ summary: 'Get season standings sorted by MVP table rules' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiOkResponse({ type: SeasonStandingsResponseDto })
  @ApiBadRequestResponse({ description: 'The provided season id is invalid' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  getStandings(@Param() params: SeasonParamDto) {
    return this.seasonsService.getStandings(params.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update season status using MVP transition rules' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiBody({ type: UpdateSeasonStatusDto })
  @ApiOkResponse({ type: SeasonResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  @ApiConflictResponse({ description: 'Season status transition is not allowed' })
  updateSeasonStatus(
    @Param() params: SeasonParamDto,
    @Body() updateSeasonStatusDto: UpdateSeasonStatusDto,
  ) {
    return this.seasonsService.updateSeasonStatus(params.id, updateSeasonStatusDto.status);
  }
}
