import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { MatchSimulationResponseDto } from './dto/match-response.dto';
import { MatchesService } from './matches.service';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

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
