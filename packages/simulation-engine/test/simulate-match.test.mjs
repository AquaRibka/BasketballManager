import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateMatch } from '../src/index.mjs';

const homeTeam = {
  id: 'team_home',
  name: 'Home Team',
  shortName: 'HOME',
  rating: 84,
  players: [
    {
      id: 'home_pg',
      name: 'Home PG',
      position: 'PG',
      overall: 84,
      shooting: 81,
      passing: 85,
      defense: 76,
      rebounding: 60,
      athleticism: 82,
    },
    {
      id: 'home_sg',
      name: 'Home SG',
      position: 'SG',
      overall: 82,
      shooting: 84,
      passing: 77,
      defense: 73,
      rebounding: 58,
      athleticism: 80,
    },
    {
      id: 'home_c',
      name: 'Home C',
      position: 'C',
      overall: 80,
      shooting: 68,
      passing: 65,
      defense: 82,
      rebounding: 84,
      athleticism: 76,
    },
  ],
};

const awayTeam = {
  id: 'team_away',
  name: 'Away Team',
  shortName: 'AWAY',
  rating: 79,
  players: [
    {
      id: 'away_pg',
      name: 'Away PG',
      position: 'PG',
      overall: 78,
      shooting: 76,
      passing: 79,
      defense: 70,
      rebounding: 55,
      athleticism: 77,
    },
    {
      id: 'away_sf',
      name: 'Away SF',
      position: 'SF',
      overall: 77,
      shooting: 75,
      passing: 72,
      defense: 74,
      rebounding: 69,
      athleticism: 78,
    },
    {
      id: 'away_c',
      name: 'Away C',
      position: 'C',
      overall: 76,
      shooting: 66,
      passing: 61,
      defense: 78,
      rebounding: 81,
      athleticism: 73,
    },
  ],
};

const fastHomeTeam = {
  ...homeTeam,
  id: 'fast_home',
  players: homeTeam.players.map((player) => ({
    ...player,
    passing: Math.min(99, player.passing + 10),
    athleticism: Math.min(99, player.athleticism + 12),
    rebounding: Math.min(99, player.rebounding + 6),
  })),
};

const slowAwayTeam = {
  ...awayTeam,
  id: 'slow_away',
  players: awayTeam.players.map((player) => ({
    ...player,
    passing: Math.max(45, player.passing - 12),
    athleticism: Math.max(45, player.athleticism - 14),
    rebounding: Math.max(45, player.rebounding - 6),
  })),
};

test('simulateMatch is deterministic for the same match id', () => {
  const first = simulateMatch({
    matchId: 'match_1',
    seed: 'match_1',
    homeTeam,
    awayTeam,
  });
  const second = simulateMatch({
    matchId: 'match_1',
    seed: 'match_1',
    homeTeam,
    awayTeam,
  });

  assert.deepEqual(first, second);
});

test('simulateMatch always returns a winner and no draws', () => {
  const result = simulateMatch({
    matchId: 'match_2',
    seed: 'match_2',
    homeTeam,
    awayTeam,
  });

  assert.notEqual(result.homeScore, result.awayScore);
  assert.equal(Number.isInteger(result.overtimeCount), true);
  assert.equal(result.overtimeCount >= 0, true);
  assert.ok(result.winnerTeamId === homeTeam.id || result.winnerTeamId === awayTeam.id);
});

test('simulateMatch returns score and statistics consistent with the result', () => {
  const result = simulateMatch({
    matchId: 'match_3',
    seed: 'match_3',
    homeTeam,
    awayTeam,
  });

  assert.equal(result.score.home, result.homeScore);
  assert.equal(result.score.away, result.awayScore);
  assert.equal(result.statistics.homeTeam.points, result.homeScore);
  assert.equal(result.statistics.awayTeam.points, result.awayScore);
  assert.equal(result.homeScore >= 55, true);
  assert.equal(result.awayScore >= 55, true);
  assert.equal(result.homeScore <= 138 + result.overtimeCount * 24, true);
  assert.equal(result.awayScore <= 138 + result.overtimeCount * 24, true);
  assert.equal(
    result.statistics.homeTeam.fieldGoalsMade <= result.statistics.homeTeam.fieldGoalsAttempted,
    true,
  );
  assert.equal(
    result.statistics.awayTeam.fieldGoalsMade <= result.statistics.awayTeam.fieldGoalsAttempted,
    true,
  );
  assert.equal(
    result.statistics.homeTeam.threePointsMade <= result.statistics.homeTeam.threePointsAttempted,
    true,
  );
  assert.equal(
    result.statistics.awayTeam.threePointsMade <= result.statistics.awayTeam.threePointsAttempted,
    true,
  );
  assert.equal(result.statistics.homeTeam.fieldGoalPercentage >= 0.35, true);
  assert.equal(result.statistics.homeTeam.fieldGoalPercentage <= 0.65, true);
  assert.equal(result.statistics.awayTeam.fieldGoalPercentage >= 0.35, true);
  assert.equal(result.statistics.awayTeam.fieldGoalPercentage <= 0.65, true);
  assert.equal(
    result.statistics.homeTeam.fieldGoalPercentage,
    Number(
      (
        result.statistics.homeTeam.fieldGoalsMade /
        result.statistics.homeTeam.fieldGoalsAttempted
      ).toFixed(3),
    ),
  );
  assert.equal(
    result.statistics.awayTeam.fieldGoalPercentage,
    Number(
      (
        result.statistics.awayTeam.fieldGoalsMade /
        result.statistics.awayTeam.fieldGoalsAttempted
      ).toFixed(3),
    ),
  );
  assert.equal(result.statistics.homeTeam.assists <= result.statistics.homeTeam.fieldGoalsMade, true);
  assert.equal(result.statistics.awayTeam.assists <= result.statistics.awayTeam.fieldGoalsMade, true);
  assert.equal(result.statistics.homeTeam.rebounds >= 20, true);
  assert.equal(result.statistics.awayTeam.rebounds >= 20, true);
});

test('simulateMatch generates team-level box score stats that stay tied to score and shot profile', () => {
  const result = simulateMatch({
    matchId: 'match_stats_linked',
    seed: 'match_stats_linked',
    homeTeam,
    awayTeam,
  });

  const homeTwoPointMade =
    result.statistics.homeTeam.fieldGoalsMade - result.statistics.homeTeam.threePointsMade;
  const awayTwoPointMade =
    result.statistics.awayTeam.fieldGoalsMade - result.statistics.awayTeam.threePointsMade;
  const reconstructedHomePoints =
    homeTwoPointMade * 2 +
    result.statistics.homeTeam.threePointsMade * 3 +
    result.statistics.homeTeam.freeThrowsMade;
  const reconstructedAwayPoints =
    awayTwoPointMade * 2 +
    result.statistics.awayTeam.threePointsMade * 3 +
    result.statistics.awayTeam.freeThrowsMade;

  assert.equal(reconstructedHomePoints, result.statistics.homeTeam.points);
  assert.equal(reconstructedAwayPoints, result.statistics.awayTeam.points);
  assert.equal(Math.abs(result.statistics.homeTeam.rebounds - result.statistics.awayTeam.rebounds) <= 20, true);
  assert.equal(result.statistics.homeTeam.assists >= 10, true);
  assert.equal(result.statistics.awayTeam.assists >= 10, true);
});

test('simulateMatch resolves ties through overtime instead of a direct +1 adjustment', () => {
  const balancedHomeTeam = {
    ...homeTeam,
    id: 'balanced_home',
    rating: 80,
    players: awayTeam.players,
  };
  const balancedAwayTeam = {
    ...awayTeam,
    id: 'balanced_away',
    rating: 80,
    players: awayTeam.players,
  };

  let overtimeResult = null;

  for (let index = 0; index < 500; index += 1) {
    const result = simulateMatch({
      matchId: `overtime_search_${index}`,
      seed: `overtime_search_${index}`,
      homeTeam: balancedHomeTeam,
      awayTeam: balancedAwayTeam,
    });

    if (result.overtimeCount > 0) {
      overtimeResult = result;
      break;
    }
  }

  assert.notEqual(overtimeResult, null);
  assert.equal(overtimeResult.homeScore === overtimeResult.awayScore, false);
  assert.equal(overtimeResult.overtimeCount > 0, true);
  assert.equal(Math.abs(overtimeResult.homeScore - overtimeResult.awayScore) >= 1, true);
});

test('simulateMatch applies pace modifiers so faster teams create more possessions on average', () => {
  let fastPacePossessions = 0;
  let slowPacePossessions = 0;

  for (let index = 0; index < 40; index += 1) {
    const fastResult = simulateMatch({
      matchId: `fast_match_${index}`,
      seed: `fast_match_${index}`,
      homeTeam: fastHomeTeam,
      awayTeam,
    });
    const slowResult = simulateMatch({
      matchId: `slow_match_${index}`,
      seed: `slow_match_${index}`,
      homeTeam,
      awayTeam: slowAwayTeam,
    });

    fastPacePossessions +=
      fastResult.statistics.homeTeam.possessions + fastResult.statistics.awayTeam.possessions;
    slowPacePossessions +=
      slowResult.statistics.homeTeam.possessions + slowResult.statistics.awayTeam.possessions;
  }

  const fastAveragePossessions = fastPacePossessions / 80;
  const slowAveragePossessions = slowPacePossessions / 80;

  assert.equal(fastAveragePossessions > slowAveragePossessions + 3, true);
});

test('simulateMatch uses seed-driven variance so possessions and score are not locked to one outcome', () => {
  const results = Array.from({ length: 8 }, (_, index) =>
    simulateMatch({
      matchId: `variance_match_${index}`,
      seed: `variance_match_${index}`,
      homeTeam,
      awayTeam,
    }),
  );

  const uniqueScores = new Set(results.map((result) => `${result.homeScore}:${result.awayScore}`));
  const uniquePossessionPairs = new Set(
    results.map(
      (result) =>
        `${result.statistics.homeTeam.possessions}:${result.statistics.awayTeam.possessions}`,
    ),
  );

  assert.equal(uniqueScores.size > 1, true);
  assert.equal(uniquePossessionPairs.size > 1, true);
});
