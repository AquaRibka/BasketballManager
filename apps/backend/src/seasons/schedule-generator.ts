export type SchedulePairing = {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
};

type ScheduleGeneratorOptions = {
  cycles?: number;
};

function assertValidTeamIds(teamIds: string[]) {
  if (teamIds.length < 2) {
    throw new RangeError('At least two teams are required to generate schedule');
  }

  const uniqueIds = new Set(teamIds);

  if (uniqueIds.size !== teamIds.length) {
    throw new RangeError('Team ids must be unique');
  }

  for (const teamId of teamIds) {
    if (typeof teamId !== 'string' || teamId.trim() === '') {
      throw new TypeError('Each team id must be a non-empty string');
    }
  }
}

function rotateTeams(teamIds: Array<string | null>) {
  if (teamIds.length <= 2) {
    return [...teamIds];
  }

  const [fixed, ...rest] = teamIds;
  const last = rest.pop();

  return [fixed, last ?? null, ...rest];
}

function buildRoundDate(seasonStartDate: Date, round: number, matchIndex: number) {
  const scheduledDate = new Date(seasonStartDate);
  scheduledDate.setUTCDate(scheduledDate.getUTCDate() + (round - 1) * 7);
  scheduledDate.setUTCHours(18 + matchIndex * 2, 0, 0, 0);

  return scheduledDate;
}

function validatePairings(pairings: SchedulePairing[]) {
  const roundPairKeys = new Set<string>();

  for (const pairing of pairings) {
    if (pairing.homeTeamId === pairing.awayTeamId) {
      throw new Error('Round-robin generator produced a self-match');
    }

    const normalizedPair = [pairing.homeTeamId, pairing.awayTeamId].sort().join(':');
    const roundPairKey = `${pairing.round}:${normalizedPair}`;

    if (roundPairKeys.has(roundPairKey)) {
      throw new Error('Round-robin generator produced a duplicate pairing in the same round');
    }

    roundPairKeys.add(roundPairKey);
  }
}

export function createRoundRobinSchedule(
  teamIds: string[],
  seasonStartDate: Date,
  options: ScheduleGeneratorOptions = {},
) {
  assertValidTeamIds(teamIds);

  const cycles = options.cycles ?? 4;

  if (!Number.isInteger(cycles) || cycles < 1) {
    throw new RangeError('cycles must be a positive integer');
  }

  const normalizedTeamIds = teamIds.length % 2 === 0 ? [...teamIds] : [...teamIds, null];
  const roundsPerCycle = normalizedTeamIds.length - 1;
  const matchesPerRound = normalizedTeamIds.length / 2;
  const pairings: SchedulePairing[] = [];
  let rotation = [...normalizedTeamIds];

  for (let cycleIndex = 0; cycleIndex < cycles; cycleIndex += 1) {
    for (let roundIndex = 0; roundIndex < roundsPerCycle; roundIndex += 1) {
      const globalRound = cycleIndex * roundsPerCycle + roundIndex + 1;

      for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex += 1) {
        const leftTeamId = rotation[matchIndex];
        const rightTeamId = rotation[rotation.length - 1 - matchIndex];

        if (!leftTeamId || !rightTeamId) {
          continue;
        }

        const shouldFlipHomeAway = (cycleIndex + roundIndex + matchIndex) % 2 === 1;

        pairings.push({
          round: globalRound,
          homeTeamId: shouldFlipHomeAway ? rightTeamId : leftTeamId,
          awayTeamId: shouldFlipHomeAway ? leftTeamId : rightTeamId,
          date: buildRoundDate(seasonStartDate, globalRound, matchIndex),
        });
      }

      rotation = rotateTeams(rotation);
    }
  }

  validatePairings(pairings);

  return pairings;
}
