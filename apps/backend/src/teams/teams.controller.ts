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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import {
  TeamDetailsResponseDto,
  TeamListResponseDto,
  TeamResponseDto,
  TeamRosterResponseDto,
} from './dto/team-response.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all teams' })
  @ApiOkResponse({ type: TeamListResponseDto })
  getTeams() {
    return this.teamsService.getTeams();
  }

  @Get(':id/players')
  @ApiOperation({ summary: 'Get team roster by team id' })
  @ApiParam({ name: 'id', description: 'Team cuid', example: 'cmon3wd920000k7sbuepwfi6r' })
  @ApiOkResponse({ type: TeamRosterResponseDto })
  @ApiBadRequestResponse({ description: 'The provided team id is invalid' })
  @ApiNotFoundResponse({ description: 'Team not found' })
  getTeamPlayers(@Param() params: CuidParamDto) {
    return this.teamsService.getTeamPlayers(params.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by id including players' })
  @ApiParam({ name: 'id', description: 'Team cuid', example: 'cmon3wd920000k7sbuepwfi6r' })
  @ApiOkResponse({ type: TeamDetailsResponseDto })
  @ApiBadRequestResponse({ description: 'The provided team id is invalid' })
  @ApiNotFoundResponse({ description: 'Team not found' })
  getTeamById(@Param() params: CuidParamDto) {
    return this.teamsService.getTeamById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a team' })
  @ApiBody({ type: CreateTeamDto })
  @ApiCreatedResponse({ type: TeamResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiConflictResponse({ description: 'Team shortName must be unique' })
  @ApiUnprocessableEntityResponse({ description: 'Team data is invalid' })
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.createTeam(createTeamDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing team' })
  @ApiParam({ name: 'id', description: 'Team cuid', example: 'cmon3wd920000k7sbuepwfi6r' })
  @ApiBody({ type: UpdateTeamDto })
  @ApiOkResponse({ type: TeamResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiNotFoundResponse({ description: 'Team not found' })
  @ApiConflictResponse({ description: 'Team shortName must be unique' })
  @ApiUnprocessableEntityResponse({ description: 'Team data is invalid' })
  updateTeam(@Param() params: CuidParamDto, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.updateTeam(params.id, updateTeamDto);
  }
}
