import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  getPlayers() {
    return this.playersService.getPlayers();
  }

  @Get(':id')
  getPlayerById(@Param() params: CuidParamDto) {
    return this.playersService.getPlayerById(params.id);
  }

  @Post()
  createPlayer(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.createPlayer(createPlayerDto);
  }

  @Patch(':id')
  updatePlayer(@Param() params: CuidParamDto, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playersService.updatePlayer(params.id, updatePlayerDto);
  }
}
