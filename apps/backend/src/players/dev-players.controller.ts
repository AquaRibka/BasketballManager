import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CuidParamDto } from '../common/dto/cuid-param.dto';
import { PlayerHiddenResponseDto } from './dto/player-response.dto';
import { PlayersService } from './players.service';

@ApiTags('Dev Players')
@Controller('dev/players')
export class DevPlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get(':id/hidden')
  @ApiOperation({ summary: 'Get hidden player attributes for dev/admin usage' })
  @ApiParam({ name: 'id', description: 'Player cuid', example: 'cmon3yv4y0003qfsbfdn5nihz' })
  @ApiOkResponse({ type: PlayerHiddenResponseDto })
  @ApiBadRequestResponse({ description: 'The provided player id is invalid' })
  @ApiNotFoundResponse({ description: 'Player or hidden profile not found' })
  getPlayerHiddenProfile(@Param() params: CuidParamDto) {
    return this.playersService.getPlayerHiddenProfileById(params.id);
  }
}
