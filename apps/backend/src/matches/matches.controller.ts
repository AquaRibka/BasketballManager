import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { ListMatchesQueryDto } from './dto/list-matches-query.dto';
import {
  MatchListResponseDto,
  MatchResponseDto,
  MatchSimulationResponseDto,
} from './dto/match-response.dto';
import { MatchesService } from './matches.service';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get matches filtered by season and optional round/team/status' })
  @ApiQuery({ name: 'seasonId', required: true, example: 'season_2026' })
  @ApiQuery({ name: 'round', required: false, example: 12 })
  @ApiQuery({
    name: 'teamId',
    required: false,
    example: 'cmon3wd920000k7sbuepwfi6r',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['SCHEDULED', 'COMPLETED'] })
  @ApiOkResponse({ type: MatchListResponseDto })
  @ApiBadRequestResponse({ description: 'Query validation failed' })
  @ApiNotFoundResponse({ description: 'Season not found' })
  getMatches(@Query() query: ListMatchesQueryDto) {
    return this.matchesService.getMatches(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a match by id' })
  @ApiParam({
    name: 'id',
    description: 'Match cuid',
    example: 'cmolpef3i0004f3sbsx7ulstu',
  })
  @ApiOkResponse({ type: MatchResponseDto })
  @ApiBadRequestResponse({ description: 'The provided match id is invalid' })
  @ApiNotFoundResponse({ description: 'Match not found' })
  getMatchById(@Param() params: CuidParamDto) {
    return this.matchesService.getMatchById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a scheduled match' })
  @ApiBody({ type: CreateMatchDto })
  @ApiCreatedResponse({ type: MatchResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiNotFoundResponse({ description: 'Season or referenced team not found' })
  @ApiUnprocessableEntityResponse({ description: 'Match data is invalid' })
  createMatch(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.createMatch(createMatchDto);
  }

  @Post(':id/simulate')
  @ApiOperation({ summary: 'Simulate a specific match and persist the result' })
  @ApiParam({
    name: 'id',
    description: 'Match cuid',
    example: 'cmolpef3i0004f3sbsx7ulstu',
  })
  @ApiOkResponse({ type: MatchSimulationResponseDto })
  @ApiBadRequestResponse({ description: 'The provided match id is invalid' })
  @ApiNotFoundResponse({ description: 'Match not found' })
  @ApiConflictResponse({
    description: 'The match has already been simulated or is not eligible',
  })
  @HttpCode(HttpStatus.OK)
  simulateMatch(@Param() params: CuidParamDto) {
    return this.matchesService.simulateMatch(params.id);
  }
}
