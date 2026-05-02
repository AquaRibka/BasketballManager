import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateMatch } from '../src/index.mjs';

const homeTeam = {
  id: 'team_home',
  rating: 84,
  players: [{ overall: 84 }, { overall: 82 }, { overall: 80 }],
};

const awayTeam = {
  id: 'team_away',
  rating: 79,
  players: [{ overall: 78 }, { overall: 77 }, { overall: 76 }],
};

test('simulateMatch is deterministic for the same match id', () => {
  const first = simulateMatch({
    matchId: 'match_1',
    homeTeam,
    awayTeam,
  });
  const second = simulateMatch({
    matchId: 'match_1',
    homeTeam,
    awayTeam,
  });

  assert.deepEqual(first, second);
});

test('simulateMatch always returns a winner and no draws', () => {
  const result = simulateMatch({
    matchId: 'match_2',
    homeTeam,
    awayTeam,
  });

  assert.notEqual(result.homeScore, result.awayScore);
  assert.ok(
    result.winnerTeamId === homeTeam.id || result.winnerTeamId === awayTeam.id,
  );
});
