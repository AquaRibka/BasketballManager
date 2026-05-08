import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlayersController } from './players.controller';
import { PlayerRatingsSyncService } from './player-ratings-sync.service';
import { PlayersService } from './players.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersController],
  providers: [PlayersService, PlayerRatingsSyncService],
})
export class PlayersModule {}
