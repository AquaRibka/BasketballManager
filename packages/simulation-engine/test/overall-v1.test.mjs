import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOverallV1 } from '../src/index.mjs';

test('calculateOverallV1 is deterministic for the same PG input', () => {
  const player = {
    position: 'PG',
    shooting: 80,
    passing: 90,
    defense: 74,
    rebounding: 52,
    stamina: 84,
  };

  assert.equal(calculateOverallV1(player), 82);
  assert.equal(calculateOverallV1(player), 82);
});

test('calculateOverallV1 matches the documented PG case', () => {
  const pointGuard = {
    position: 'PG',
    shooting: 80,
    passing: 90,
    defense: 74,
    rebounding: 52,
    stamina: 84,
  };

  assert.equal(calculateOverallV1(pointGuard), 82);
});

test('calculateOverallV1 rewards center strengths in the C case', () => {
  const center = {
    position: 'C',
    shooting: 60,
    passing: 55,
    defense: 85,
    rebounding: 90,
    stamina: 75,
  };

  assert.equal(calculateOverallV1(center), 79);
});

test('calculateOverallV1 applies position weights differently for PG and C', () => {
  const hybridPlayer = {
    shooting: 82,
    passing: 86,
    defense: 72,
    rebounding: 58,
    stamina: 80,
  };

  const guardOverall = calculateOverallV1({ ...hybridPlayer, position: 'PG' });
  const centerOverall = calculateOverallV1({ ...hybridPlayer, position: 'C' });

  assert.equal(guardOverall, 80);
  assert.equal(centerOverall, 72);
  assert.ok(guardOverall > centerOverall);
});

test('calculateOverallV1 supports athleticism as a temporary stamina alias', () => {
  const player = {
    position: 'SF',
    shooting: 78,
    passing: 74,
    defense: 80,
    rebounding: 76,
    athleticism: 82,
  };

  assert.equal(calculateOverallV1(player), 78);
});

test('calculateOverallV1 keeps output in the 1-100 range', () => {
  const elitePlayer = {
    position: 'C',
    shooting: 100,
    passing: 100,
    defense: 100,
    rebounding: 100,
    stamina: 100,
  };

  assert.equal(calculateOverallV1(elitePlayer), 100);
});

test('calculateOverallV1 clamps minimum attributes to the 1-100 overall range', () => {
  const rawProspect = {
    position: 'PG',
    shooting: 0,
    passing: 0,
    defense: 0,
    rebounding: 0,
    stamina: 0,
  };

  assert.equal(calculateOverallV1(rawProspect), 1);
});

test('calculateOverallV1 returns a stable value across repeated min and max calculations', () => {
  const minimumPlayer = {
    position: 'SF',
    shooting: 0,
    passing: 0,
    defense: 0,
    rebounding: 0,
    stamina: 0,
  };
  const maximumPlayer = {
    position: 'PF',
    shooting: 100,
    passing: 100,
    defense: 100,
    rebounding: 100,
    stamina: 100,
  };

  assert.deepEqual(
    [calculateOverallV1(minimumPlayer), calculateOverallV1(minimumPlayer)],
    [1, 1],
  );
  assert.deepEqual(
    [calculateOverallV1(maximumPlayer), calculateOverallV1(maximumPlayer)],
    [100, 100],
  );
});

test('calculateOverallV1 rejects unknown positions', () => {
  assert.throws(
    () =>
      calculateOverallV1({
        position: 'QB',
        shooting: 80,
        passing: 80,
        defense: 80,
        rebounding: 80,
        stamina: 80,
      }),
    /position must be one of/,
  );
});

test('calculateOverallV1 rejects attributes outside the supported range', () => {
  assert.throws(
    () =>
      calculateOverallV1({
        position: 'PF',
        shooting: 101,
        passing: 80,
        defense: 80,
        rebounding: 80,
        stamina: 80,
      }),
    /shooting must be between 0 and 100/,
  );
});
