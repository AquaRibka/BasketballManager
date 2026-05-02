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
  if (!players || players.length === 0) {
    return 60;
  }

  const total = players.reduce((sum, player) => sum + player.overall, 0);
  return total / players.length;
}

function buildTeamStrength(team) {
  const rosterAverage = averageOverall(team.players);
  return team.rating * 0.45 + rosterAverage * 0.55;
}

export function simulateMatch(input) {
  const random = createRandom(stringToSeed(input.matchId));
  const homeStrength = buildTeamStrength(input.homeTeam);
  const awayStrength = buildTeamStrength(input.awayTeam);
  const strengthDelta = homeStrength - awayStrength;
  const homeBase = 72 + homeStrength * 0.22 + strengthDelta * 0.18;
  const awayBase = 72 + awayStrength * 0.22 - strengthDelta * 0.12;

  let homeScore = Math.round(homeBase + random() * 16 - 8);
  let awayScore = Math.round(awayBase + random() * 16 - 8);

  homeScore = Math.max(50, Math.min(130, homeScore));
  awayScore = Math.max(50, Math.min(130, awayScore));

  if (homeScore === awayScore) {
    if (random() >= 0.5) {
      homeScore += 1;
    } else {
      awayScore += 1;
    }
  }

  const winnerTeamId =
    homeScore > awayScore ? input.homeTeam.id : input.awayTeam.id;

  return {
    homeScore,
    awayScore,
    winnerTeamId,
  };
}
