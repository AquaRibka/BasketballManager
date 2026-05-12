import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import {
  PlayerHealthDetailsResponseDto,
  PlayerListResponseDto,
  PlayerResponseDto,
  PlayerSocialDetailsResponseDto,
} from './dto/player-response.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all players' })
  @ApiOkResponse({ type: PlayerListResponseDto })
  getPlayers() {
    return this.playersService.getPlayers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a player by id' })
  @ApiParam({ name: 'id', description: 'Player cuid', example: 'cmon3yv4y0003qfsbfdn5nihz' })
  @ApiOkResponse({ type: PlayerResponseDto })
  @ApiBadRequestResponse({ description: 'The provided player id is invalid' })
  @ApiNotFoundResponse({ description: 'Player not found' })
  getPlayerById(@Param() params: CuidParamDto) {
    return this.playersService.getPlayerById(params.id);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get player health profile and injury history' })
  @ApiParam({ name: 'id', description: 'Player cuid', example: 'cmon3yv4y0003qfsbfdn5nihz' })
  @ApiOkResponse({ type: PlayerHealthDetailsResponseDto })
  @ApiBadRequestResponse({ description: 'The provided player id is invalid' })
  @ApiNotFoundResponse({ description: 'Player not found' })
  getPlayerHealthById(@Param() params: CuidParamDto) {
    return this.playersService.getPlayerHealthById(params.id);
  }

  @Get(':id/social')
  @ApiOperation({ summary: 'Get player social profile' })
  @ApiParam({ name: 'id', description: 'Player cuid', example: 'cmon3yv4y0003qfsbfdn5nihz' })
  @ApiOkResponse({ type: PlayerSocialDetailsResponseDto })
  @ApiBadRequestResponse({ description: 'The provided player id is invalid' })
  @ApiNotFoundResponse({ description: 'Player not found' })
  getPlayerSocialById(@Param() params: CuidParamDto) {
    return this.playersService.getPlayerSocialProfileById(params.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a player' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiCreatedResponse({ type: PlayerResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiNotFoundResponse({ description: 'Referenced team not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Player overall or attributes violate domain rules',
  })
  createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.createPlayer(createPlayerDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing player' })
  @ApiParam({ name: 'id', description: 'Player cuid', example: 'cmon3yv4y0003qfsbfdn5nihz' })
  @ApiBody({ type: UpdatePlayerDto })
  @ApiOkResponse({ type: PlayerResponseDto })
  @ApiBadRequestResponse({ description: 'Payload validation failed' })
  @ApiNotFoundResponse({ description: 'Player or referenced team not found' })
  @ApiUnprocessableEntityResponse({
    description: 'Player overall or attributes violate domain rules',
  })
  updatePlayer(@Param() params: CuidParamDto, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playersService.updatePlayer(params.id, updatePlayerDto);
  }
}
