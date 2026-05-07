import { randomUUID } from 'node:crypto';
import { calculateTeamStrengthV1 } from './team-strength-v1.mjs';

const REQUIRED_PLAYER_ATTRIBUTES = ['overall', 'shooting', 'passing', 'defense', 'rebounding'];

function stringToSeed(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function averageOverall(players) {
  if (players.length === 0) {
    return 60;
  }

  return rotationAverage(players, (player) => player.overall);
}

function averageAttribute(players, key) {
  if (players.length === 0) {
    return 60;
  }

  return rotationAverage(players, (player) => player[key]);
}

function rotationAverage(players, getValue) {
  const rotationWeights = [1, 0.95, 0.9, 0.86, 0.82, 0.24, 0.16, 0.1, 0.06, 0.03];
  const sortedPlayers = [...players].sort((left, right) => right.overall - left.overall);
  let weightedTotal = 0;
  let weightTotal = 0;

  sortedPlayers.slice(0, rotationWeights.length).forEach((player, index) => {
    const weight = rotationWeights[index];
    weightedTotal += getValue(player) * weight;
    weightTotal += weight;
  });

  return weightedTotal / weightTotal;
}

function buildTeamProfile(team) {
  const players = team.players ?? [];

  return {
    overall: averageOverall(players),
    shooting: averageAttribute(players, 'shooting'),
    passing: averageAttribute(players, 'passing'),
    defense: averageAttribute(players, 'defense'),
    rebounding: averageAttribute(players, 'rebounding'),
    athleticism: averageAttribute(players, 'athleticism'),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function centeredRandom(random, amplitude = 1) {
  return (random() * 2 - 1) * amplitude;
}

function roundTo(value, digits = 3) {
  return Number(value.toFixed(digits));
}

function assertFiniteNumber(name, value) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function validateTeam(team, label) {
  if (!team || typeof team !== 'object') {
    throw new TypeError(`${label} must be an object`);
  }

  if (typeof team.id !== 'string' || team.id.trim() === '') {
    throw new TypeError(`${label}.id must be a non-empty string`);
  }

  if (team.players == null) {
    return;
  }

  if (!Array.isArray(team.players)) {
    throw new TypeError(`${label}.players must be an array`);
  }

  team.players.forEach((player, index) => {
    if (!player || typeof player !== 'object') {
      throw new TypeError(`${label}.players[${index}] must be an object`);
    }

    for (const attribute of REQUIRED_PLAYER_ATTRIBUTES) {
      assertFiniteNumber(`${label}.players[${index}].${attribute}`, player[attribute]);
    }

    if (typeof player.athleticism !== 'number' && typeof player.stamina !== 'number') {
      throw new TypeError(`${label}.players[${index}].athleticism is required`);
    }

    assertFiniteNumber(
      `${label}.players[${index}].athleticism`,
      player.athleticism ?? player.stamina,
    );
  });
}

function validateSimulationInput(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('input must be an object');
  }

  if (typeof input.matchId !== 'string' || input.matchId.trim() === '') {
    throw new TypeError('matchId must be a non-empty string');
  }

  if (input.seed != null && typeof input.seed !== 'string') {
    throw new TypeError('seed must be a string');
  }

  validateTeam(input.homeTeam, 'homeTeam');
  validateTeam(input.awayTeam, 'awayTeam');

  if (input.homeTeam.id === input.awayTeam.id) {
    throw new RangeError('homeTeam and awayTeam must be different teams');
  }
}

function calculatePaceModifier(teamProfile, opponentProfile) {
  return clamp(
    (teamProfile.athleticism - 75) / 4.8 +
      (teamProfile.passing - 75) / 7.2 +
      (teamProfile.rebounding - opponentProfile.rebounding) / 14,
    -4,
    4,
  );
}

function buildGameContext(homeProfile, awayProfile, homeStrength, awayStrength) {
  const paceBase =
    68 +
    (homeProfile.athleticism + awayProfile.athleticism) / 30 +
    (homeProfile.passing + awayProfile.passing) / 46 +
    (homeProfile.overall + awayProfile.overall) / 78;
  const strengthDelta = homeStrength - awayStrength;
  const homePaceModifier = calculatePaceModifier(homeProfile, awayProfile);
  const awayPaceModifier = calculatePaceModifier(awayProfile, homeProfile);

  return {
    basePossessions: clamp(Math.round(paceBase), 70, 82),
    homePaceModifier,
    awayPaceModifier,
    paceVariance: 5,
    strengthDelta,
    homeEfficiency: clamp(
      0.87 +
        homeStrength / 380 +
        (homeProfile.shooting - awayProfile.defense) / 420 +
        strengthDelta / 620,
      0.78,
      1.2,
    ),
    homeExecutionModifier: clamp(
      (homeProfile.shooting - awayProfile.defense) / 520 +
        (homeProfile.passing - awayProfile.defense) / 760,
      -0.06,
      0.07,
    ),
    awayEfficiency: clamp(
      0.85 +
        awayStrength / 385 +
        (awayProfile.shooting - homeProfile.defense) / 420 -
        strengthDelta / 650,
      0.76,
      1.17,
    ),
    awayExecutionModifier: clamp(
      (awayProfile.shooting - homeProfile.defense) / 520 +
        (awayProfile.passing - homeProfile.defense) / 760,
      -0.07,
      0.07,
    ),
  };
}

function generateRegulationScore(context, random) {
  const gameSwing = centeredRandom(random, 0.075);
  const homeLuck = centeredRandom(random, 0.12);
  const awayLuck = centeredRandom(random, 0.12);
  const sharedPossessions = clamp(
    Math.round(
      context.basePossessions +
        (context.homePaceModifier + context.awayPaceModifier) / 2 +
        centeredRandom(random, context.paceVariance),
    ),
    66,
    86,
  );
  const possessionSplit = clamp(
    Math.round(
      (context.homePaceModifier - context.awayPaceModifier) * 0.45 + centeredRandom(random, 2),
    ),
    -4,
    4,
  );
  const homePossessions = clamp(sharedPossessions + possessionSplit, 64, 90);
  const awayPossessions = clamp(sharedPossessions - possessionSplit, 64, 90);
  const homePointsPerPossession = clamp(
    context.homeEfficiency + context.homeExecutionModifier + gameSwing + homeLuck,
    0.74,
    1.26,
  );
  const awayPointsPerPossession = clamp(
    context.awayEfficiency + context.awayExecutionModifier + gameSwing + awayLuck,
    0.72,
    1.24,
  );

  const homeScore = clamp(
    Math.round(homePossessions * homePointsPerPossession + centeredRandom(random, 8.5)),
    48,
    112,
  );
  const awayScore = clamp(
    Math.round(awayPossessions * awayPointsPerPossession + centeredRandom(random, 8.5)),
    46,
    112,
  );

  return {
    homePossessions,
    awayPossessions,
    homeScore,
    awayScore,
  };
}

function resolveOvertime(homeScore, awayScore, context, random) {
  let resolvedHomeScore = homeScore;
  let resolvedAwayScore = awayScore;
  let overtimeCount = 0;

  while (resolvedHomeScore === resolvedAwayScore) {
    overtimeCount += 1;

    const overtimePace = clamp(
      Math.round(
        context.basePossessions / 8 + (context.homePaceModifier + context.awayPaceModifier) / 4,
      ),
      7,
      12,
    );
    const homeOvertimeScore = clamp(
      Math.round(
        overtimePace * clamp(context.homeEfficiency + context.homeExecutionModifier, 0.78, 1.22) +
          centeredRandom(random, 4.5) +
          context.strengthDelta / 70,
      ),
      2,
      18,
    );
    const awayOvertimeScore = clamp(
      Math.round(
        overtimePace * clamp(context.awayEfficiency + context.awayExecutionModifier, 0.76, 1.2) +
          centeredRandom(random, 4.5) -
          context.strengthDelta / 70,
      ),
      2,
      18,
    );

    resolvedHomeScore += homeOvertimeScore;
    resolvedAwayScore += awayOvertimeScore;
  }

  return {
    homeScore: resolvedHomeScore,
    awayScore: resolvedAwayScore,
    overtimeCount,
  };
}

function buildBaseTeamStatistics(score, possessions, teamProfile, opponentProfile, random) {
  const freeThrowPercentage = clamp(0.68 + teamProfile.shooting / 500, 0.68, 0.92);
  const threePointPercentage = clamp(
    0.28 + (teamProfile.shooting - opponentProfile.defense) / 400,
    0.24,
    0.47,
  );
  const fieldGoalPercentage = clamp(
    0.41 + (teamProfile.shooting - opponentProfile.defense) / 300,
    0.38,
    0.58,
  );
  const turnovers = clamp(
    Math.round(
      possessions * (0.118 - (teamProfile.passing - 70) / 520) + centeredRandom(random, 1.8),
    ),
    7,
    22,
  );
  const freeThrowsAttempted = clamp(
    Math.round(
      possessions * (0.19 + teamProfile.athleticism / 1400 + centeredRandom(random, 0.025)),
    ),
    10,
    38,
  );
  const estimatedFreeThrowsMade = clamp(
    Math.round(freeThrowsAttempted * freeThrowPercentage),
    8,
    freeThrowsAttempted,
  );
  const estimatedNonFreeThrowPoints = Math.max(0, score - estimatedFreeThrowsMade);
  const threePointShare = clamp(
    0.24 +
      teamProfile.shooting / 520 +
      teamProfile.passing / 1100 -
      opponentProfile.defense / 700 +
      centeredRandom(random, 0.025),
    0.2,
    0.46,
  );
  const threePointsMade = clamp(
    Math.round((estimatedNonFreeThrowPoints / 2.35) * threePointShare),
    4,
    Math.max(4, Math.floor(estimatedNonFreeThrowPoints / 3)),
  );
  const maxTwoPointPoints = Math.max(0, score - threePointsMade * 3);
  const twoPointFieldGoalsMade = Math.max(
    0,
    Math.floor((maxTwoPointPoints - estimatedFreeThrowsMade) / 2),
  );
  const freeThrowsMade = clamp(
    score - (twoPointFieldGoalsMade * 2 + threePointsMade * 3),
    0,
    freeThrowsAttempted,
  );
  const fieldGoalsMade = threePointsMade + twoPointFieldGoalsMade;

  const threePointsAttempted = clamp(
    Math.round(threePointsMade / threePointPercentage),
    threePointsMade,
    fieldGoalsMade + 20,
  );
  const fieldGoalsAttempted = clamp(
    Math.round(
      Math.max(
        fieldGoalsMade / fieldGoalPercentage,
        possessions - turnovers - freeThrowsAttempted * 0.44 + centeredRandom(random, 3),
      ),
    ),
    fieldGoalsMade,
    fieldGoalsMade + 38,
  );
  const rawAssistsRate = clamp(
    0.48 + teamProfile.passing / 240 - opponentProfile.defense / 900 + centeredRandom(random, 0.03),
    0.42,
    0.82,
  );
  const assists = clamp(Math.round(fieldGoalsMade * rawAssistsRate), 10, fieldGoalsMade);
  const fieldGoalsMissed = Math.max(0, fieldGoalsAttempted - fieldGoalsMade);
  const freeThrowsMissed = Math.max(0, freeThrowsAttempted - freeThrowsMade);

  return {
    points: score,
    possessions,
    fieldGoalsMade,
    fieldGoalsAttempted,
    fieldGoalPercentage: roundTo(fieldGoalsMade / Math.max(1, fieldGoalsAttempted)),
    threePointsMade,
    threePointsAttempted,
    freeThrowsMade,
    freeThrowsAttempted,
    assists,
    turnovers,
    steals: clamp(Math.round(5 + teamProfile.defense / 20 + random() * 4), 3, 16),
    blocks: clamp(Math.round(2 + teamProfile.defense / 28 + random() * 3), 1, 11),
    fouls: clamp(Math.round(14 + opponentProfile.athleticism / 16 + random() * 6), 10, 30),
    fieldGoalsMissed,
    freeThrowsMissed,
  };
}

function attachTeamRebounds(homeStats, awayStats, homeProfile, awayProfile, random) {
  const totalReboundPool = clamp(
    Math.round(
      24 +
        (homeStats.fieldGoalsMissed + awayStats.fieldGoalsMissed) * 0.68 +
        (homeStats.freeThrowsMissed + awayStats.freeThrowsMissed) * 0.35,
    ),
    28,
    74,
  );
  const homeReboundShare = clamp(
    0.5 + (homeProfile.rebounding - awayProfile.rebounding) / 160 + centeredRandom(random, 0.035),
    0.38,
    0.62,
  );
  const homeRebounds = clamp(Math.round(totalReboundPool * homeReboundShare), 20, 48);
  const awayRebounds = clamp(totalReboundPool - homeRebounds, 20, 48);

  return {
    homeTeam: {
      ...homeStats,
      rebounds: homeRebounds,
    },
    awayTeam: {
      ...awayStats,
      rebounds: awayRebounds,
    },
  };
}

function finalizeTeamStatistics(teamStats) {
  const statistics = { ...teamStats };
  delete statistics.fieldGoalsMissed;
  delete statistics.freeThrowsMissed;
  return statistics;
}

export function simulateMatch(input) {
  validateSimulationInput(input);

  const seed = input.seed ?? randomUUID();
  const random = createRandom(stringToSeed(seed));
  const homeStrength = calculateTeamStrengthV1(input.homeTeam, {
    randomValue: random(),
  });
  const awayStrength = calculateTeamStrengthV1(input.awayTeam, {
    randomValue: random(),
  });
  const homeProfile = buildTeamProfile(input.homeTeam);
  const awayProfile = buildTeamProfile(input.awayTeam);
  const context = buildGameContext(homeProfile, awayProfile, homeStrength, awayStrength);
  const regulationScore = generateRegulationScore(context, random);
  const resolvedScore = resolveOvertime(
    regulationScore.homeScore,
    regulationScore.awayScore,
    context,
    random,
  );

  const { homeScore, awayScore, overtimeCount } = resolvedScore;

  const winnerTeamId = homeScore > awayScore ? input.homeTeam.id : input.awayTeam.id;
  const loserTeamId = winnerTeamId === input.homeTeam.id ? input.awayTeam.id : input.homeTeam.id;
  const overtimePossessions = overtimeCount * clamp(Math.round(context.basePossessions / 8), 8, 16);
  const homeBaseStatistics = buildBaseTeamStatistics(
    homeScore,
    regulationScore.homePossessions + overtimePossessions,
    homeProfile,
    awayProfile,
    random,
  );
  const awayBaseStatistics = buildBaseTeamStatistics(
    awayScore,
    regulationScore.awayPossessions + overtimePossessions,
    awayProfile,
    homeProfile,
    random,
  );
  const resolvedStatistics = attachTeamRebounds(
    homeBaseStatistics,
    awayBaseStatistics,
    homeProfile,
    awayProfile,
    random,
  );

  return {
    matchId: input.matchId,
    seed,
    homeScore,
    awayScore,
    overtimeCount,
    score: {
      home: homeScore,
      away: awayScore,
    },
    winnerTeamId,
    loserTeamId,
    statistics: {
      homeTeam: finalizeTeamStatistics(resolvedStatistics.homeTeam),
      awayTeam: finalizeTeamStatistics(resolvedStatistics.awayTeam),
    },
  };
}
