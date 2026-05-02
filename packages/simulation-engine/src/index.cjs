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

function averageBy(players, getValue, fallback = 60) {
  if (players.length === 0) {
    return fallback;
  }

  const total = players.reduce((sum, player) => sum + getValue(player), 0);
  return total / players.length;
}

function resolveStamina(player) {
  if (typeof player.stamina === 'number') {
    return player.stamina;
  }

  if (typeof player.athleticism === 'number') {
    return player.athleticism;
  }

  return 60;
}

function buildPlayerRoleScore(player) {
  const stamina = resolveStamina(player);
  const positionWeights = {
    PG: { shooting: 0.28, passing: 0.32, defense: 0.14, rebounding: 0.06, stamina: 0.2 },
    SG: { shooting: 0.31, passing: 0.2, defense: 0.15, rebounding: 0.1, stamina: 0.24 },
    SF: { shooting: 0.22, passing: 0.16, defense: 0.2, rebounding: 0.16, stamina: 0.26 },
    PF: { shooting: 0.14, passing: 0.11, defense: 0.24, rebounding: 0.24, stamina: 0.27 },
    C: { shooting: 0.08, passing: 0.08, defense: 0.28, rebounding: 0.31, stamina: 0.25 },
  };
  const weights = positionWeights[player.position];

  if (!weights) {
    return player.overall;
  }

  return (
    player.shooting * weights.shooting +
    player.passing * weights.passing +
    player.defense * weights.defense +
    player.rebounding * weights.rebounding +
    stamina * weights.stamina
  );
}

function buildPositionStrength(players, averageOverall) {
  const lineupWeights = {
    PG: 0.19,
    SG: 0.19,
    SF: 0.2,
    PF: 0.2,
    C: 0.22,
  };
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];

  return positions.reduce((sum, position) => {
    const candidates = players.filter((player) => player.position === position);
    const bestPlayerScore =
      candidates.length > 0
        ? Math.max(...candidates.map((player) => buildPlayerRoleScore(player)))
        : averageOverall * 0.9;

    return sum + bestPlayerScore * lineupWeights[position];
  }, 0);
}

function buildAttributeStrength(players) {
  const shooting = averageBy(players, (player) => player.shooting);
  const passing = averageBy(players, (player) => player.passing);
  const defense = averageBy(players, (player) => player.defense);
  const rebounding = averageBy(players, (player) => player.rebounding);
  const athleticism = averageBy(players, (player) => player.athleticism ?? resolveStamina(player));

  return shooting * 0.26 + passing * 0.18 + defense * 0.24 + rebounding * 0.16 + athleticism * 0.16;
}

function buildStaminaFactor(players) {
  const averageStamina = averageBy(players, (player) => resolveStamina(player));
  const depthStamina = averageBy(
    [...players].sort((left, right) => right.overall - left.overall).slice(0, 8),
    (player) => resolveStamina(player),
    averageStamina,
  );

  return averageStamina * 0.65 + depthStamina * 0.35;
}

function calculateTeamStrengthV1(team, options = {}) {
  if (!team || typeof team !== 'object') {
    throw new TypeError('team must be an object');
  }

  const players = team.players ?? [];
  const averageOverall = averageBy(players, (player) => player.overall);
  const positionStrength = buildPositionStrength(players, averageOverall);
  const attributeStrength = buildAttributeStrength(players);
  const staminaFactor = buildStaminaFactor(players);
  const randomValue =
    typeof options.randomValue === 'number' && Number.isFinite(options.randomValue)
      ? clamp(options.randomValue, 0, 1)
      : 0.5;
  const randomFactor = (randomValue - 0.5) * 5;

  const rawStrength =
    team.rating * 0.24 +
    averageOverall * 0.34 +
    positionStrength * 0.22 +
    attributeStrength * 0.12 +
    staminaFactor * 0.08 +
    randomFactor;

  return clamp(Number(rawStrength.toFixed(2)), 1, 100);
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

function buildGameContext(homeProfile, awayProfile, homeStrength, awayStrength) {
  const paceBase =
    91 +
    (homeProfile.athleticism + awayProfile.athleticism) / 12 +
    (homeProfile.passing + awayProfile.passing) / 18;
  const pace = clamp(Math.round(paceBase), 84, 108);
  const strengthDelta = homeStrength - awayStrength;

  return {
    pace,
    strengthDelta,
    homeEfficiency: clamp(
      0.97 +
        homeStrength / 210 +
        (homeProfile.shooting - awayProfile.defense) / 300 +
        strengthDelta / 240,
      0.88,
      1.28,
    ),
    awayEfficiency: clamp(
      0.95 +
        awayStrength / 210 +
        (awayProfile.shooting - homeProfile.defense) / 300 -
        strengthDelta / 260,
      0.86,
      1.24,
    ),
  };
}

function generateRegulationScore(context, random) {
  const paceSwing = 7;
  const scoringSwing = 9;
  const homePossessions = clamp(
    Math.round(context.pace + random() * paceSwing * 2 - paceSwing + 1),
    82,
    112,
  );
  const awayPossessions = clamp(
    Math.round(context.pace + random() * paceSwing * 2 - paceSwing - 1),
    82,
    112,
  );

  const homeScore = clamp(
    Math.round(
      homePossessions * context.homeEfficiency + (random() * scoringSwing * 2 - scoringSwing),
    ),
    55,
    138,
  );
  const awayScore = clamp(
    Math.round(
      awayPossessions * context.awayEfficiency + (random() * scoringSwing * 2 - scoringSwing),
    ),
    55,
    138,
  );

  return {
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

    const overtimePace = clamp(Math.round(context.pace / 5), 8, 16);
    const homeOvertimeScore = clamp(
      Math.round(
        overtimePace * context.homeEfficiency + (random() * 6 - 2.5) + context.strengthDelta / 40,
      ),
      4,
      24,
    );
    const awayOvertimeScore = clamp(
      Math.round(
        overtimePace * context.awayEfficiency + (random() * 6 - 2.5) - context.strengthDelta / 40,
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

function buildTeamStatistics(score, teamProfile, opponentProfile, random) {
  const freeThrowsMade = clamp(
    Math.round(score * (0.14 + teamProfile.athleticism / 900) + random() * 3),
    8,
    Math.max(12, score - 12),
  );
  const fieldGoalsMade = clamp(
    Math.round((score - freeThrowsMade) / 2.35),
    18,
    Math.max(24, score),
  );
  const threePointsMade = clamp(
    Math.round(fieldGoalsMade * (0.22 + teamProfile.shooting / 500)),
    4,
    fieldGoalsMade,
  );
  const fieldGoalPercentage = clamp(
    0.41 + (teamProfile.shooting - opponentProfile.defense) / 300,
    0.38,
    0.58,
  );
  const threePointPercentage = clamp(
    0.28 + (teamProfile.shooting - opponentProfile.defense) / 400,
    0.24,
    0.47,
  );
  const freeThrowPercentage = clamp(0.68 + teamProfile.shooting / 500, 0.68, 0.92);

  const threePointsAttempted = clamp(
    Math.round(threePointsMade / threePointPercentage),
    threePointsMade,
    fieldGoalsMade + 18,
  );
  const fieldGoalsAttempted = clamp(
    Math.round(fieldGoalsMade / fieldGoalPercentage),
    fieldGoalsMade,
    fieldGoalsMade + 35,
  );
  const freeThrowsAttempted = clamp(
    Math.round(freeThrowsMade / freeThrowPercentage),
    freeThrowsMade,
    freeThrowsMade + 10,
  );

  return {
    possessions: clamp(
      Math.round(
        fieldGoalsAttempted +
          freeThrowsAttempted * 0.44 +
          11 +
          random() * 8 +
          teamProfile.athleticism / 18,
      ),
      68,
      108,
    ),
    fieldGoalsMade,
    fieldGoalsAttempted,
    threePointsMade,
    threePointsAttempted,
    freeThrowsMade,
    freeThrowsAttempted,
    assists: clamp(
      Math.round(fieldGoalsMade * (0.46 + teamProfile.passing / 220)),
      10,
      fieldGoalsMade,
    ),
    rebounds: clamp(Math.round(28 + teamProfile.rebounding / 2.8 + random() * 8), 24, 62),
    turnovers: clamp(Math.round(18 - teamProfile.passing / 12 + random() * 5), 7, 22),
    steals: clamp(Math.round(5 + teamProfile.defense / 20 + random() * 4), 3, 16),
    blocks: clamp(Math.round(2 + teamProfile.defense / 28 + random() * 3), 1, 11),
    fouls: clamp(Math.round(14 + opponentProfile.athleticism / 16 + random() * 6), 10, 30),
  };
}

function simulateMatch(input) {
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
      homeTeam: buildTeamStatistics(homeScore, homeProfile, awayProfile, random),
      awayTeam: buildTeamStatistics(awayScore, awayProfile, homeProfile, random),
    },
  };
}

module.exports = {
  calculateTeamStrengthV1,
  simulateMatch,
  workspaceName: 'simulation-engine',
};
