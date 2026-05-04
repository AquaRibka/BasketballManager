import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeasonsController } from './seasons.controller';
import { SeasonsService } from './seasons.service';

@Module({
  imports: [PrismaModule],
  controllers: [SeasonsController],
  providers: [SeasonsService],
})
export class SeasonsModule {}
