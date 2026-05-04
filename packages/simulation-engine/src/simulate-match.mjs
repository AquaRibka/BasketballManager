import { calculateTeamStrengthV1 } from './team-strength-v1.mjs';

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

  const total = players.reduce((sum, player) => sum + player.overall, 0);
  return total / players.length;
}

function averageAttribute(players, key) {
  if (players.length === 0) {
    return 60;
  }

  const total = players.reduce((sum, player) => sum + player[key], 0);
  return total / players.length;
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

function calculatePaceModifier(teamProfile, opponentProfile) {
  return clamp(
    (teamProfile.athleticism - 75) / 3.2 +
      (teamProfile.passing - 75) / 4.6 +
      (teamProfile.rebounding - opponentProfile.rebounding) / 10,
    -6,
    6,
  );
}

function buildGameContext(homeProfile, awayProfile, homeStrength, awayStrength) {
  const paceBase =
    90 +
    (homeProfile.athleticism + awayProfile.athleticism) / 16 +
    (homeProfile.passing + awayProfile.passing) / 24 +
    (homeProfile.overall + awayProfile.overall) / 40;
  const strengthDelta = homeStrength - awayStrength;
  const homePaceModifier = calculatePaceModifier(homeProfile, awayProfile);
  const awayPaceModifier = calculatePaceModifier(awayProfile, homeProfile);

  return {
    basePossessions: clamp(Math.round(paceBase), 86, 102),
    homePaceModifier,
    awayPaceModifier,
    paceVariance: 4.5,
    strengthDelta,
    homeEfficiency: clamp(
      0.95 +
        homeStrength / 260 +
        (homeProfile.shooting - awayProfile.defense) / 300 +
        strengthDelta / 360,
      0.88,
      1.28,
    ),
    homeExecutionModifier: clamp(
      (homeProfile.shooting - awayProfile.defense) / 340 +
        (homeProfile.passing - awayProfile.defense) / 520,
      -0.07,
      0.09,
    ),
    awayEfficiency: clamp(
      0.93 +
        awayStrength / 260 +
        (awayProfile.shooting - homeProfile.defense) / 300 -
        strengthDelta / 380,
      0.86,
      1.24,
    ),
    awayExecutionModifier: clamp(
      (awayProfile.shooting - homeProfile.defense) / 340 +
        (awayProfile.passing - homeProfile.defense) / 520,
      -0.08,
      0.08,
    ),
  };
}

function generateRegulationScore(context, random) {
  const sharedPossessions = clamp(
    Math.round(
      context.basePossessions +
        (context.homePaceModifier + context.awayPaceModifier) / 2 +
        centeredRandom(random, context.paceVariance),
    ),
    80,
    108,
  );
  const possessionSplit = clamp(
    Math.round(
      (context.homePaceModifier - context.awayPaceModifier) * 0.55 + centeredRandom(random, 2.2),
    ),
    -5,
    5,
  );
  const homePossessions = clamp(
    sharedPossessions + possessionSplit,
    78,
    112,
  );
  const awayPossessions = clamp(
    sharedPossessions - possessionSplit,
    78,
    112,
  );
  const homePointsPerPossession = clamp(
    context.homeEfficiency + context.homeExecutionModifier + centeredRandom(random, 0.085),
    0.85,
    1.33,
  );
  const awayPointsPerPossession = clamp(
    context.awayEfficiency + context.awayExecutionModifier + centeredRandom(random, 0.085),
    0.83,
    1.29,
  );

  const homeScore = clamp(
    Math.round(homePossessions * homePointsPerPossession + centeredRandom(random, 6.5)),
    58,
    138,
  );
  const awayScore = clamp(
    Math.round(awayPossessions * awayPointsPerPossession + centeredRandom(random, 6.5)),
    56,
    138,
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
      Math.round(context.basePossessions / 8 + (context.homePaceModifier + context.awayPaceModifier) / 4),
      8,
      16,
    );
    const homeOvertimeScore = clamp(
      Math.round(
        overtimePace *
          clamp(context.homeEfficiency + context.homeExecutionModifier, 0.88, 1.3) +
          centeredRandom(random, 3.25) +
          context.strengthDelta / 40,
      ),
      4,
      24,
    );
    const awayOvertimeScore = clamp(
      Math.round(
        overtimePace *
          clamp(context.awayEfficiency + context.awayExecutionModifier, 0.86, 1.28) +
          centeredRandom(random, 3.25) -
          context.strengthDelta / 40,
      ),
      4,
      24,
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

function buildTeamStatistics(score, possessions, teamProfile, opponentProfile, random) {
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
      possessions *
        (0.19 + teamProfile.athleticism / 1400 + centeredRandom(random, 0.025)),
    ),
    10,
    38,
  );
  const freeThrowsMade = clamp(
    Math.round(freeThrowsAttempted * freeThrowPercentage),
    8,
    freeThrowsAttempted,
  );
  const nonFreeThrowPoints = Math.max(0, score - freeThrowsMade);
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
    Math.round((nonFreeThrowPoints / 2.35) * threePointShare),
    4,
    Math.max(4, Math.floor(nonFreeThrowPoints / 3)),
  );
  const remainingTwoPointPoints = Math.max(0, nonFreeThrowPoints - threePointsMade * 3);
  const twoPointFieldGoalsMade = Math.max(0, Math.round(remainingTwoPointPoints / 2));
  const fieldGoalsMade = clamp(threePointsMade + twoPointFieldGoalsMade, 18, Math.max(24, score));

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

  return {
    possessions,
    fieldGoalsMade,
    fieldGoalsAttempted,
    threePointsMade,
    threePointsAttempted,
    freeThrowsMade,
    freeThrowsAttempted,
    assists: clamp(
      Math.round(fieldGoalsMade * (0.45 + teamProfile.passing / 230) + centeredRandom(random, 1.5)),
      10,
      fieldGoalsMade,
    ),
    rebounds: clamp(Math.round(28 + teamProfile.rebounding / 2.8 + random() * 8), 24, 62),
    turnovers,
    steals: clamp(Math.round(5 + teamProfile.defense / 20 + random() * 4), 3, 16),
    blocks: clamp(Math.round(2 + teamProfile.defense / 28 + random() * 3), 1, 11),
    fouls: clamp(Math.round(14 + opponentProfile.athleticism / 16 + random() * 6), 10, 30),
  };
}

export function simulateMatch(input) {
  const seed = input.seed ?? input.matchId;
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
  const homeStatistics = buildTeamStatistics(
    homeScore,
    regulationScore.homePossessions + overtimePossessions,
    homeProfile,
    awayProfile,
    random,
  );
  const awayStatistics = buildTeamStatistics(
    awayScore,
    regulationScore.awayPossessions + overtimePossessions,
    awayProfile,
    homeProfile,
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
      homeTeam: homeStatistics,
      awayTeam: awayStatistics,
    },
  };
}
