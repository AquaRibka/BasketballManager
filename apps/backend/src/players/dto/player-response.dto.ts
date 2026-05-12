import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PLAYER_BODY_TYPES,
  PLAYER_AUDIENCE_SENTIMENTS,
  PLAYER_CAREER_STATUSES,
  PLAYER_DEVELOPMENT_FOCUS,
  PLAYER_DOMINANT_HANDS,
  PLAYER_INJURY_SEVERITIES,
  PLAYER_INJURY_STATUSES,
  PLAYER_MEDIA_STATUSES,
  PLAYER_POSITIONS,
  PLAYER_SOCIAL_PLATFORMS,
} from '@basketball-manager/shared';
import type {
  PlayerAudienceSentiment,
  PlayerAwardShape,
  PlayerBodyType,
  PlayerCareerHistoryEntryShape,
  PlayerCareerTotalsShape,
  PlayerCareerStatus,
  PlayerDevelopmentFocus,
  PlayerDominantHand,
  PlayerHealthDetailsShape,
  PlayerHealthSummaryShape,
  PlayerHiddenSummaryShape,
  PlayerInjuryHistoryEntryShape,
  PlayerInjurySeverity,
  PlayerInjuryStatus,
  PlayerMediaStatus,
  PlayerPhysicalSummaryShape,
  PlayerPsychologySummaryShape,
  PlayerSeasonStatEntryShape,
  PlayerSocialDetailsShape,
  PlayerSocialProfile,
  PlayerSocialPlatform,
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

export class PlayerCareerHistoryEntryDto implements PlayerCareerHistoryEntryShape {
  @ApiProperty({ example: 'cmoxxxxy0001abcd1234efgh' })
  id!: string;

  @ApiProperty({ example: '2025/26' })
  season!: string;

  @ApiProperty({ example: 'VTB United League' })
  league!: string;

  @ApiProperty({ example: 'Starter' })
  role!: string;

  @ApiPropertyOptional({ example: 8, nullable: true })
  jerseyNumber!: number | null;

  @ApiProperty({ enum: PLAYER_CAREER_STATUSES, example: 'ACTIVE' })
  status!: PlayerCareerStatus;

  @ApiPropertyOptional({ example: '2025-08-01T00:00:00.000Z', nullable: true })
  transferDate!: string | null;

  @ApiPropertyOptional({ example: 'Signed with first team', nullable: true })
  transferReason!: string | null;

  @ApiProperty({ type: [String], example: ['League Champion'] })
  achievements!: string[];

  @ApiPropertyOptional({ type: PlayerTeamSummaryDto, nullable: true })
  team!: PlayerTeamSummaryDto | null;
}

export class PlayerAwardDto implements PlayerAwardShape {
  @ApiProperty({ example: 'cmoxxxxy0003abcd1234mnop' })
  id!: string;

  @ApiProperty({ example: '2025/26' })
  season!: string;

  @ApiProperty({ example: 'League MVP' })
  awardType!: string;

  @ApiProperty({ example: 'VTB United League' })
  league!: string;

  @ApiPropertyOptional({ example: 'Best player of the regular season', nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ type: PlayerTeamSummaryDto, nullable: true })
  team!: PlayerTeamSummaryDto | null;
}

export class PlayerSeasonStatEntryDto implements PlayerSeasonStatEntryShape {
  @ApiProperty({ example: 'cmoxxxxy0002abcd1234ijkl' })
  id!: string;

  @ApiProperty({ example: '2025/26' })
  season!: string;

  @ApiProperty({ example: 'VTB United League' })
  league!: string;

  @ApiPropertyOptional({ type: PlayerTeamSummaryDto, nullable: true })
  team!: PlayerTeamSummaryDto | null;

  @ApiProperty({ example: 34, minimum: 0 })
  gamesPlayed!: number;

  @ApiProperty({ example: 27.6, minimum: 0 })
  minutesPerGame!: number;

  @ApiProperty({ example: 14.8, minimum: 0 })
  pointsPerGame!: number;

  @ApiProperty({ example: 5.2, minimum: 0 })
  reboundsPerGame!: number;

  @ApiProperty({ example: 4.9, minimum: 0 })
  assistsPerGame!: number;

  @ApiProperty({ example: 1.3, minimum: 0 })
  stealsPerGame!: number;

  @ApiProperty({ example: 0.4, minimum: 0 })
  blocksPerGame!: number;

  @ApiProperty({ example: 2.1, minimum: 0 })
  turnoversPerGame!: number;

  @ApiProperty({ example: 2.4, minimum: 0 })
  foulsPerGame!: number;

  @ApiProperty({ example: 47.8, minimum: 0, maximum: 100 })
  fgPct!: number;

  @ApiProperty({ example: 36.4, minimum: 0, maximum: 100 })
  threePct!: number;

  @ApiProperty({ example: 82.1, minimum: 0, maximum: 100 })
  ftPct!: number;

  @ApiProperty({ example: 17.6, minimum: 0 })
  efficiencyRating!: number;

  @ApiProperty({ example: 24, minimum: 0 })
  gamesStarted!: number;
}

export class PlayerCareerTotalsDto implements PlayerCareerTotalsShape {
  @ApiProperty({ example: 4, minimum: 0 })
  seasonsCount!: number;

  @ApiProperty({ example: 138, minimum: 0 })
  gamesPlayed!: number;

  @ApiProperty({ example: 97, minimum: 0 })
  gamesStarted!: number;

  @ApiProperty({ example: 3568.4, minimum: 0 })
  totalMinutes!: number;

  @ApiProperty({ example: 1824.6, minimum: 0 })
  totalPoints!: number;

  @ApiProperty({ example: 604.1, minimum: 0 })
  totalRebounds!: number;

  @ApiProperty({ example: 488.3, minimum: 0 })
  totalAssists!: number;

  @ApiProperty({ example: 152.7, minimum: 0 })
  totalSteals!: number;

  @ApiProperty({ example: 43.8, minimum: 0 })
  totalBlocks!: number;

  @ApiProperty({ example: 271.5, minimum: 0 })
  totalTurnovers!: number;

  @ApiProperty({ example: 318.4, minimum: 0 })
  totalFouls!: number;

  @ApiProperty({ example: 25.9, minimum: 0 })
  averageMinutesPerGame!: number;

  @ApiProperty({ example: 13.2, minimum: 0 })
  averagePointsPerGame!: number;

  @ApiProperty({ example: 4.4, minimum: 0 })
  averageReboundsPerGame!: number;

  @ApiProperty({ example: 3.5, minimum: 0 })
  averageAssistsPerGame!: number;

  @ApiProperty({ example: 1.1, minimum: 0 })
  averageStealsPerGame!: number;

  @ApiProperty({ example: 0.3, minimum: 0 })
  averageBlocksPerGame!: number;

  @ApiProperty({ example: 2.0, minimum: 0 })
  averageTurnoversPerGame!: number;

  @ApiProperty({ example: 2.3, minimum: 0 })
  averageFoulsPerGame!: number;

  @ApiProperty({ example: 47.8, minimum: 0, maximum: 100 })
  fgPct!: number;

  @ApiProperty({ example: 36.4, minimum: 0, maximum: 100 })
  threePct!: number;

  @ApiProperty({ example: 82.1, minimum: 0, maximum: 100 })
  ftPct!: number;

  @ApiProperty({ example: 17.6, minimum: 0 })
  efficiencyRating!: number;
}

export class PlayerSocialProfileDto implements PlayerSocialProfile {
  @ApiProperty({ enum: PLAYER_SOCIAL_PLATFORMS, example: 'INSTAGRAM' })
  platform!: PlayerSocialPlatform;

  @ApiProperty({ example: '@aleks_player' })
  nickname!: string;

  @ApiProperty({ example: 184000, minimum: 0 })
  followersCount!: number;

  @ApiProperty({ example: 4200 })
  followerGrowthWeekly!: number;

  @ApiProperty({ example: 6.8, minimum: 0, maximum: 100 })
  engagementRate!: number;

  @ApiProperty({ enum: PLAYER_AUDIENCE_SENTIMENTS, example: 'POSITIVE' })
  audienceSentiment!: PlayerAudienceSentiment;

  @ApiProperty({ enum: PLAYER_MEDIA_STATUSES, example: 'NATIONAL_NAME' })
  mediaStatus!: PlayerMediaStatus;

  @ApiProperty({ example: 78, minimum: 1, maximum: 100 })
  hypeScore!: number;

  @ApiProperty({ example: 24, minimum: 1, maximum: 100 })
  controversyScore!: number;

  @ApiProperty({ example: 81, minimum: 1, maximum: 100 })
  marketabilityScore!: number;

  @ApiProperty({ example: '2026-05-12T09:30:00.000Z' })
  lastUpdatedAt!: string;
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

  @ApiProperty({ example: 91, minimum: 1, maximum: 100 })
  potentialAbility!: number;

  @ApiProperty({ example: 82, minimum: 1, maximum: 100 })
  currentAbility!: number;

  @ApiProperty({ example: 84, minimum: 1, maximum: 100 })
  growthRate!: number;

  @ApiProperty({ enum: PLAYER_DEVELOPMENT_FOCUS, example: 'BALANCED' })
  developmentFocus!: PlayerDevelopmentFocus;

  @ApiProperty({ example: 23, minimum: 16, maximum: 40 })
  peakStartAge!: number;

  @ApiProperty({ example: 28, minimum: 16, maximum: 40 })
  peakEndAge!: number;

  @ApiProperty({ example: 31, minimum: 16, maximum: 45 })
  declineStartAge!: number;

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

  @ApiPropertyOptional({ type: PlayerSocialProfileDto, nullable: true })
  socialProfile!: PlayerSocialProfileDto | null;

  @ApiPropertyOptional({ example: 'cmon3wd920000k7sbuepwfi6r', nullable: true })
  teamId!: string | null;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-05-01T16:09:33.730Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: PlayerTeamSummaryDto, nullable: true })
  team?: PlayerTeamSummaryDto | null;

  @ApiPropertyOptional({ type: [PlayerCareerHistoryEntryDto] })
  careerHistory?: PlayerCareerHistoryEntryDto[];

  @ApiPropertyOptional({ type: [PlayerSeasonStatEntryDto] })
  seasonStats?: PlayerSeasonStatEntryDto[];

  @ApiPropertyOptional({ type: PlayerCareerTotalsDto, nullable: true })
  careerTotals?: PlayerCareerTotalsDto | null;

  @ApiPropertyOptional({ type: [PlayerAwardDto] })
  awards?: PlayerAwardDto[];
}

export class PlayerCompactResponseDto extends PlayerResponseDto {}

export class PlayerFullResponseDto extends PlayerResponseDto {}

export class PlayerListResponseDto {
  @ApiProperty({ type: [PlayerCompactResponseDto] })
  items!: PlayerCompactResponseDto[];

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

export class PlayerSocialDetailsResponseDto implements PlayerSocialDetailsShape {
  @ApiProperty({ example: 'cmon3yv4y0003qfsbfdn5nihz' })
  playerId!: string;

  @ApiProperty({ example: 'Ilya Melnikov' })
  playerName!: string;

  @ApiPropertyOptional({ type: PlayerSocialProfileDto, nullable: true })
  socialProfile!: PlayerSocialProfileDto | null;
}
