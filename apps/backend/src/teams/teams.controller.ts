import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  getTeams() {
    return this.teamsService.getTeams();
  }

  @Get(':id/players')
  getTeamPlayers(@Param() params: CuidParamDto) {
    return this.teamsService.getTeamPlayers(params.id);
  }

  @Get(':id')
  getTeamById(@Param() params: CuidParamDto) {
    return this.teamsService.getTeamById(params.id);
  }

  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.createTeam(createTeamDto);
  }

  @Patch(':id')
  updateTeam(@Param() params: CuidParamDto, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.updateTeam(params.id, updateTeamDto);
  }
}
