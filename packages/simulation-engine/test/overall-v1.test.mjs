import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOverallV1 } from '../src/index.mjs';

test('calculateOverallV1 is reproducible for the same player input', () => {
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

test('calculateOverallV1 uses position weights', () => {
  const perimeterPlayer = {
    shooting: 82,
    passing: 86,
    defense: 72,
    rebounding: 58,
    stamina: 80,
  };

  const guardOverall = calculateOverallV1({
    ...perimeterPlayer,
    position: 'PG',
  });
  const centerOverall = calculateOverallV1({
    ...perimeterPlayer,
    position: 'C',
  });

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
