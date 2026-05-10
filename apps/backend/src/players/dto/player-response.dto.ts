import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PLAYER_BODY_TYPES,
  PLAYER_DOMINANT_HANDS,
  PLAYER_INJURY_SEVERITIES,
  PLAYER_INJURY_STATUSES,
  PLAYER_POSITIONS,
} from '@basketball-manager/shared';
import type {
  PlayerBodyType,
  PlayerDominantHand,
  PlayerHealthDetailsShape,
  PlayerHealthSummaryShape,
  PlayerHiddenSummaryShape,
  PlayerInjuryHistoryEntryShape,
  PlayerInjurySeverity,
  PlayerInjuryStatus,
  PlayerPhysicalSummaryShape,
  PlayerPsychologySummaryShape,
  PlayerSummaryShape,
  PlayerTacticalSummaryShape,
  PlayerTeamSummaryShape,
} from '@basketball-manager/shared';
import { PlayerPosition } from '@prisma/client';

export class PlayerTeamSummaryDto implements PlayerTeamSummaryShape {
  @ApiProperty({ example: 'cmon3wd920000k7sbuepwfi6r' })
  id!: string;

  @ApiProperty({ example: 'CSKA Moscow' })
  name!: string;

  @ApiProperty({ example: 'CSKA' })
  shortName!: string;
}

export class PlayerPhysicalProfileDto implements PlayerPhysicalSummaryShape {
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

export class PlayerHealthProfileDto implements PlayerHealthSummaryShape {
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

export class PlayerPsychologyProfileDto implements PlayerPsychologySummaryShape {
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

export class PlayerTacticalProfileDto implements PlayerTacticalSummaryShape {
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

export class PlayerHiddenProfileDto implements PlayerHiddenSummaryShape {
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

export class PlayerResponseDto implements PlayerSummaryShape {
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

  @ApiPropertyOptional({ type: PlayerPhysicalProfileDto, nullable: true })
  physicalProfile!: PlayerPhysicalProfileDto | null;

  @ApiPropertyOptional({ type: PlayerHealthProfileDto, nullable: true })
  healthProfile!: PlayerHealthProfileDto | null;

  @ApiPropertyOptional({ type: PlayerPsychologyProfileDto, nullable: true })
  psychologyProfile!: PlayerPsychologyProfileDto | null;

  @ApiPropertyOptional({ type: PlayerTacticalProfileDto, nullable: true })
  tacticalProfile!: PlayerTacticalProfileDto | null;

  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r', nullable: true })
  teamId!: string | null;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: PlayerTeamSummaryDto, nullable: true })
  team?: PlayerTeamSummaryDto | null;
}

export class PlayerListResponseDto {
  @ApiProperty({ type: [PlayerResponseDto] })
  items!: PlayerResponseDto[];

  @ApiProperty({ example: 88 })
  total!: number;
}

export class PlayerHiddenResponseDto {
  @ApiProperty({ example: 'cmon3yv4y0003qfsbfdn5nihz' })
  id!: string;

  @ApiProperty({ example: 'Ilya Melnikov' })
  name!: string;

  @ApiProperty({ type: PlayerHiddenProfileDto })
  hiddenProfile!: PlayerHiddenProfileDto;
}

export class PlayerInjuryHistoryEntryDto implements PlayerInjuryHistoryEntryShape {
  @ApiProperty({ example: 'cmovr6at60006g9sb7jjl3s1g' })
  id!: string;

  @ApiProperty({ example: 'Ankle sprain' })
  title!: string;

  @ApiProperty({ example: 'Right ankle' })
  bodyPart!: string;

  @ApiProperty({ enum: PLAYER_INJURY_SEVERITIES, example: 'MODERATE' })
  severity!: PlayerInjurySeverity;

  @ApiProperty({ enum: PLAYER_INJURY_STATUSES, example: 'RECOVERED' })
  status!: PlayerInjuryStatus;

  @ApiProperty({ example: '2026-03-12T00:00:00.000Z' })
  occurredAt!: string;

  @ApiPropertyOptional({ example: '2026-03-29T00:00:00.000Z', nullable: true })
  expectedReturnAt!: string | null;

  @ApiPropertyOptional({ example: '2026-03-26T00:00:00.000Z', nullable: true })
  returnedAt!: string | null;

  @ApiProperty({ example: 4, minimum: 0 })
  gamesMissed!: number;

  @ApiPropertyOptional({ example: 'Rolled ankle on landing', nullable: true })
  notes!: string | null;
}

export class PlayerHealthDetailsResponseDto implements PlayerHealthDetailsShape {
  @ApiProperty({ example: 'cmon3yv4y0003qfsbfdn5nihz' })
  playerId!: string;

  @ApiProperty({ example: 'Ilya Melnikov' })
  playerName!: string;

  @ApiPropertyOptional({ type: PlayerHealthProfileDto, nullable: true })
  healthProfile!: PlayerHealthProfileDto | null;

  @ApiProperty({ type: [PlayerInjuryHistoryEntryDto] })
  injuryHistory!: PlayerInjuryHistoryEntryDto[];
}
