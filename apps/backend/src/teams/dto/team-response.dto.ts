import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  PlayerBodyType,
  PlayerDominantHand,
  PlayerHealthSummaryShape,
  PlayerHiddenSummaryShape,
  PlayerPhysicalSummaryShape,
  PlayerPsychologySummaryShape,
  PlayerTacticalSummaryShape,
  TeamDetailsShape,
  TeamPlayerShape,
  TeamRosterResponseShape,
  TeamSummaryShape,
} from '@basketball-manager/shared';
import {
  PLAYER_BODY_TYPES,
  PLAYER_DOMINANT_HANDS,
  PLAYER_POSITIONS,
} from '@basketball-manager/shared';
import { PlayerPosition } from '@prisma/client';

export class TeamPlayerPhysicalProfileDto implements PlayerPhysicalSummaryShape {
  @ApiProperty({ example: 198 })
  heightCm!: number;

  @ApiProperty({ example: 96 })
  weightKg!: number;

  @ApiPropertyOptional({ example: 210, nullable: true })
  wingspanCm!: number | null;

  @ApiPropertyOptional({ enum: PLAYER_BODY_TYPES, example: 'ATHLETIC', nullable: true })
  bodyType!: PlayerBodyType | null;

  @ApiProperty({ example: 81, minimum: 1, maximum: 100 })
  speed!: number;

  @ApiProperty({ example: 84, minimum: 1, maximum: 100 })
  acceleration!: number;

  @ApiProperty({ example: 77, minimum: 1, maximum: 100 })
  vertical!: number;

  @ApiProperty({ example: 74, minimum: 1, maximum: 100 })
  strength!: number;

  @ApiProperty({ example: 79, minimum: 1, maximum: 100 })
  endurance!: number;

  @ApiProperty({ example: 76, minimum: 1, maximum: 100 })
  balance!: number;

  @ApiProperty({ example: 80, minimum: 1, maximum: 100 })
  agility!: number;

  @ApiProperty({ example: 78, minimum: 1, maximum: 100 })
  coordination!: number;

  @ApiProperty({ example: 82, minimum: 1, maximum: 100 })
  reaction!: number;

  @ApiProperty({ example: 75, minimum: 1, maximum: 100 })
  recovery!: number;

  @ApiProperty({ example: 83, minimum: 1, maximum: 100 })
  explosiveness!: number;
}

export class TeamPlayerHealthProfileDto implements PlayerHealthSummaryShape {
  @ApiProperty({ example: 84, minimum: 1, maximum: 100 })
  overallCondition!: number;

  @ApiProperty({ example: 16, minimum: 1, maximum: 100 })
  fatigue!: number;

  @ApiProperty({ example: 100, minimum: 1, maximum: 100 })
  postInjuryCondition!: number;

  @ApiProperty({ example: 28, minimum: 1, maximum: 100 })
  injuryRisk!: number;

  @ApiProperty({ example: 77, minimum: 1, maximum: 100 })
  durability!: number;

  @ApiProperty({ example: 81, minimum: 1, maximum: 100 })
  recoveryRate!: number;

  @ApiProperty({ example: 73, minimum: 1, maximum: 100 })
  painTolerance!: number;

  @ApiProperty({ example: 75, minimum: 1, maximum: 100 })
  medicalOutlook!: number;
}

export class TeamPlayerPsychologyProfileDto implements PlayerPsychologySummaryShape {
  @ApiProperty({ example: 79, minimum: 1, maximum: 100 })
  selfControl!: number;

  @ApiProperty({ example: 81, minimum: 1, maximum: 100 })
  concentration!: number;

  @ApiProperty({ example: 84, minimum: 1, maximum: 100 })
  determination!: number;

  @ApiProperty({ example: 77, minimum: 1, maximum: 100 })
  leadership!: number;

  @ApiProperty({ example: 88, minimum: 1, maximum: 100 })
  workEthic!: number;

  @ApiProperty({ example: 68, minimum: 1, maximum: 100 })
  aggressiveness!: number;

  @ApiProperty({ example: 82, minimum: 1, maximum: 100 })
  teamwork!: number;

  @ApiProperty({ example: 80, minimum: 1, maximum: 100 })
  confidence!: number;
}

export class TeamPlayerTacticalProfileDto implements PlayerTacticalSummaryShape {
  @ApiProperty({ example: 82, minimum: 1, maximum: 100 })
  basketballIQ!: number;

  @ApiProperty({ example: 77, minimum: 1, maximum: 100 })
  shotSelection!: number;

  @ApiProperty({ example: 80, minimum: 1, maximum: 100 })
  courtVision!: number;

  @ApiProperty({ example: 74, minimum: 1, maximum: 100 })
  defenseReading!: number;

  @ApiProperty({ example: 78, minimum: 1, maximum: 100 })
  offenseReading!: number;

  @ApiProperty({ example: 79, minimum: 1, maximum: 100 })
  decisionMaking!: number;

  @ApiProperty({ example: 75, minimum: 1, maximum: 100 })
  offBallMovement!: number;

  @ApiProperty({ example: 76, minimum: 1, maximum: 100 })
  spacing!: number;

  @ApiProperty({ example: 73, minimum: 1, maximum: 100 })
  pickAndRollOffense!: number;

  @ApiProperty({ example: 71, minimum: 1, maximum: 100 })
  pickAndRollDefense!: number;

  @ApiProperty({ example: 74, minimum: 1, maximum: 100 })
  helpDefense!: number;

  @ApiProperty({ example: 81, minimum: 1, maximum: 100 })
  discipline!: number;
}

export class TeamPlayerHiddenProfileDto implements PlayerHiddenSummaryShape {
  @ApiProperty({ example: 91, minimum: 1, maximum: 100 })
  potential!: number;

  @ApiProperty({ example: 82, minimum: 1, maximum: 100 })
  currentAbility!: number;

  @ApiProperty({ example: 84, minimum: 1, maximum: 100 })
  professionalism!: number;

  @ApiProperty({ example: 72, minimum: 1, maximum: 100 })
  loyalty!: number;

  @ApiProperty({ example: 76, minimum: 1, maximum: 100 })
  consistency!: number;

  @ApiProperty({ example: 34, minimum: 1, maximum: 100 })
  injuryProneness!: number;

  @ApiProperty({ example: 79, minimum: 1, maximum: 100 })
  importantMatches!: number;

  @ApiProperty({ example: 81, minimum: 1, maximum: 100 })
  mediaAppeal!: number;

  @ApiProperty({ example: 58, minimum: 1, maximum: 100 })
  ego!: number;

  @ApiProperty({ example: 27, minimum: 1, maximum: 100 })
  wantsToLeave!: number;

  @ApiProperty({ example: 63, minimum: 1, maximum: 100 })
  agentInfluence!: number;

  @ApiProperty({ example: 78, minimum: 1, maximum: 100 })
  learningAbility!: number;

  @ApiProperty({ example: 80, minimum: 1, maximum: 100 })
  hiddenReputation!: number;
}

export class TeamPlayerDto implements TeamPlayerShape {
  @ApiProperty({ example: 'cmon3yv4y0003qfsbfdn5nihz' })
  id!: string;

  @ApiProperty({ example: 'Ilya Melnikov' })
  name!: string;

  @ApiProperty({ example: 24, minimum: 16, maximum: 50 })
  age!: number;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.SF })
  position!: PlayerPosition;

  @ApiPropertyOptional({ example: '2002-07-16T00:00:00.000Z', nullable: true })
  dateOfBirth!: string | null;

  @ApiPropertyOptional({ enum: PLAYER_DOMINANT_HANDS, example: 'RIGHT', nullable: true })
  dominantHand!: PlayerDominantHand | null;

  @ApiProperty({ enum: PLAYER_POSITIONS, isArray: true, example: ['SG'] })
  secondaryPositions!: PlayerPosition[];

  @ApiProperty({ example: 93, minimum: 0, maximum: 100 })
  shooting!: number;

  @ApiProperty({ example: 90, minimum: 0, maximum: 100 })
  passing!: number;

  @ApiProperty({ example: 92, minimum: 0, maximum: 100 })
  defense!: number;

  @ApiProperty({ example: 91, minimum: 0, maximum: 100 })
  rebounding!: number;

  @ApiProperty({ example: 94, minimum: 0, maximum: 100 })
  athleticism!: number;

  @ApiProperty({ example: 89, minimum: 0, maximum: 100 })
  overall!: number;

  @ApiPropertyOptional({ type: TeamPlayerPhysicalProfileDto, nullable: true })
  physicalProfile!: TeamPlayerPhysicalProfileDto | null;

  @ApiPropertyOptional({ type: TeamPlayerHealthProfileDto, nullable: true })
  healthProfile!: TeamPlayerHealthProfileDto | null;

  @ApiPropertyOptional({ type: TeamPlayerPsychologyProfileDto, nullable: true })
  psychologyProfile!: TeamPlayerPsychologyProfileDto | null;

  @ApiPropertyOptional({ type: TeamPlayerTacticalProfileDto, nullable: true })
  tacticalProfile!: TeamPlayerTacticalProfileDto | null;

  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r', nullable: true })
  teamId!: string | null;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  updatedAt!: string;
}

export class TeamResponseDto implements TeamSummaryShape {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'Moscow' })
  city!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;

  @ApiProperty({ example: 88, minimum: 0, maximum: 100 })
  rating!: number;

  @ApiProperty({ example: '2026-05-01T16:07:37.238Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.659Z' })
  updatedAt!: string;
}

export class TeamDetailsResponseDto extends TeamResponseDto implements TeamDetailsShape {
  @ApiProperty({ type: [TeamPlayerDto] })
  players!: TeamPlayerDto[];
}

export class TeamListResponseDto {
  @ApiProperty({ type: [TeamResponseDto] })
  items!: TeamResponseDto[];

  @ApiProperty({ example: 11 })
  total!: number;
}

export class TeamRosterResponseDto implements TeamRosterResponseShape {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  teamId!: string;

  @ApiProperty({ type: [TeamPlayerDto] })
  items!: TeamPlayerDto[];

  @ApiProperty({ example: 8 })
  total!: number;
}
