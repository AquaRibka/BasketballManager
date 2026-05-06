import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
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
import { SeasonFullSimulationResponseDto } from './dto/season-full-simulation-response.dto';
import { SeasonParamDto } from './dto/season-param.dto';
import { SeasonRoundSimulationResponseDto } from './dto/season-round-simulation-response.dto';
import { SeasonResponseDto } from './dto/season-response.dto';
import { SeasonNextRoundResponseDto } from './dto/season-next-round-response.dto';
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

  @Post(':id/current-round/simulate')
  @ApiOperation({ summary: 'Simulate all unfinished matches in the current season round' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiOkResponse({ type: SeasonRoundSimulationResponseDto })
  @ApiBadRequestResponse({ description: 'The provided season id is invalid' })
  @ApiNotFoundResponse({ description: 'Season or round matches not found' })
  @ApiConflictResponse({ description: 'Current round has already been simulated or season is completed' })
  @HttpCode(HttpStatus.OK)
  simulateCurrentRound(@Param() params: SeasonParamDto) {
    return this.seasonsService.simulateCurrentRound(params.id);
  }

  @Post(':id/simulate')
  @ApiOperation({ summary: 'Quick-simulate all remaining season rounds until the season is completed' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiOkResponse({ type: SeasonFullSimulationResponseDto })
  @ApiBadRequestResponse({ description: 'The provided season id is invalid' })
  @ApiNotFoundResponse({ description: 'Season or current round schedule not found' })
  @ApiConflictResponse({ description: 'Season is already completed' })
  @HttpCode(HttpStatus.OK)
  simulateRemainingSeason(@Param() params: SeasonParamDto) {
    return this.seasonsService.simulateRemainingSeason(params.id);
  }

  @Post(':id/next-round')
  @ApiOperation({ summary: 'Advance the season to the next round when the current round is completed' })
  @ApiParam({ name: 'id', description: 'Season id', example: 'season_2026' })
  @ApiOkResponse({ type: SeasonNextRoundResponseDto })
  @ApiBadRequestResponse({ description: 'The provided season id is invalid' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  @ApiConflictResponse({ description: 'Current round is not completed or season is already completed' })
  @HttpCode(HttpStatus.OK)
  advanceToNextRound(@Param() params: SeasonParamDto) {
    return this.seasonsService.advanceToNextRound(params.id);
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
