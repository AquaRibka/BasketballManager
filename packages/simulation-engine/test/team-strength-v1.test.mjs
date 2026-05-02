import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTeamStrengthV1, simulateMatch } from '../src/index.mjs';

const balancedTeam = {
  id: 'team_balanced',
  name: 'Balanced Team',
  shortName: 'BAL',
  rating: 80,
  players: [
    {
      id: 'pg_1',
      name: 'Floor General',
      position: 'PG',
      overall: 80,
      shooting: 78,
      passing: 86,
      defense: 72,
      rebounding: 54,
      athleticism: 81,
    },
    {
      id: 'sg_1',
      name: 'Shot Maker',
      position: 'SG',
      overall: 81,
      shooting: 84,
      passing: 74,
      defense: 71,
      rebounding: 56,
      athleticism: 80,
    },
    {
      id: 'sf_1',
      name: 'Wing Stopper',
      position: 'SF',
      overall: 80,
      shooting: 76,
      passing: 72,
      defense: 80,
      rebounding: 69,
      athleticism: 79,
    },
    {
      id: 'pf_1',
      name: 'Glass Cleaner',
      position: 'PF',
      overall: 79,
      shooting: 70,
      passing: 66,
      defense: 79,
      rebounding: 80,
      athleticism: 77,
    },
    {
      id: 'c_1',
      name: 'Rim Protector',
      position: 'C',
      overall: 82,
      shooting: 68,
      passing: 64,
      defense: 84,
      rebounding: 85,
      athleticism: 78,
    },
  ],
};

test('calculateTeamStrengthV1 is reproducible for the same team and random input', () => {
  const first = calculateTeamStrengthV1(balancedTeam, { randomValue: 0.5 });
  const second = calculateTeamStrengthV1(balancedTeam, { randomValue: 0.5 });

  assert.equal(first, second);
});

test('calculateTeamStrengthV1 rewards better average overall and lineup balance', () => {
  const weakerTeam = {
    ...balancedTeam,
    id: 'team_weaker',
    rating: 74,
    players: balancedTeam.players.map((player) => ({
      ...player,
      overall: player.overall - 8,
      shooting: player.shooting - 8,
      passing: player.passing - 8,
      defense: player.defense - 8,
      rebounding: player.rebounding - 8,
      athleticism: player.athleticism - 8,
    })),
  };

  const balancedStrength = calculateTeamStrengthV1(balancedTeam, { randomValue: 0.5 });
  const weakerStrength = calculateTeamStrengthV1(weakerTeam, { randomValue: 0.5 });

  assert.ok(balancedStrength > weakerStrength);
});

test('calculateTeamStrengthV1 uses stamina factor through athleticism', () => {
  const tiredTeam = {
    ...balancedTeam,
    id: 'team_tired',
    players: balancedTeam.players.map((player) => ({
      ...player,
      athleticism: player.athleticism - 20,
    })),
  };

  const freshStrength = calculateTeamStrengthV1(balancedTeam, { randomValue: 0.5 });
  const tiredStrength = calculateTeamStrengthV1(tiredTeam, { randomValue: 0.5 });

  assert.ok(freshStrength > tiredStrength);
});

test('calculateTeamStrengthV1 applies a bounded random factor', () => {
  const lowRoll = calculateTeamStrengthV1(balancedTeam, { randomValue: 0 });
  const midRoll = calculateTeamStrengthV1(balancedTeam, { randomValue: 0.5 });
  const highRoll = calculateTeamStrengthV1(balancedTeam, { randomValue: 1 });

  assert.ok(lowRoll < midRoll);
  assert.ok(midRoll < highRoll);
  assert.ok(highRoll - lowRoll <= 5);
});

test('stronger team statistically beats weaker team more often, with randomness preserved', () => {
  const strongTeam = {
    ...balancedTeam,
    id: 'team_strong',
    name: 'Strong Team',
    shortName: 'STR',
    rating: 88,
    players: balancedTeam.players.map((player) => ({
      ...player,
      overall: player.overall + 6,
      shooting: player.shooting + 5,
      passing: player.passing + 5,
      defense: player.defense + 5,
      rebounding: player.rebounding + 5,
      athleticism: player.athleticism + 5,
    })),
  };
  const weakTeam = {
    ...balancedTeam,
    id: 'team_weak',
    name: 'Weak Team',
    shortName: 'WEAK',
    rating: 72,
    players: balancedTeam.players.map((player) => ({
      ...player,
      overall: player.overall - 7,
      shooting: player.shooting - 6,
      passing: player.passing - 6,
      defense: player.defense - 6,
      rebounding: player.rebounding - 6,
      athleticism: player.athleticism - 6,
    })),
  };

  let strongWins = 0;
  let weakWins = 0;

  for (let index = 0; index < 200; index += 1) {
    const result = simulateMatch({
      matchId: `strength_series_${index}`,
      seed: `strength_series_${index}`,
      homeTeam: strongTeam,
      awayTeam: weakTeam,
    });

    if (result.winnerTeamId === strongTeam.id) {
      strongWins += 1;
    } else {
      weakWins += 1;
    }
  }

  assert.ok(strongWins > weakWins);
  assert.ok(strongWins >= 120);
  assert.ok(weakWins > 0);
});
