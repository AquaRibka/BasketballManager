import {
  PLAYER_POSITIONS,
  PLAYER_RANGE_PRESETS,
  type PlayerBodyType,
  type PlayerDevelopmentFocus,
  type PlayerDominantHand,
  type PlayerPosition,
} from '@basketball-manager/shared';
import { calculatePlayerOverall } from './player-overall';

export const PLAYER_GENERATOR_ARCHETYPES = [
  'SNIPER',
  'PLAYMAKER',
  'THREE_AND_D',
  'DEFENSIVE_CENTER',
  'SCORER',
  'VERSATILE_FORWARD',
  'ROLE_PLAYER',
  'PROSPECT',
] as const;

export type PlayerGeneratorArchetype = (typeof PLAYER_GENERATOR_ARCHETYPES)[number];

interface PlayerArchetypeDefinition {
  label: string;
  description: string;
  attributeDeltas: Pick<GeneratedCoreAttributes, CoreAttributeKey>;
  developmentFocus: PlayerDevelopmentFocus;
}

export interface GeneratePlayerInput {
  position: PlayerPosition;
  age: number;
  heightCm: number;
  weightKg: number;
  potential: number;
  archetype?: PlayerGeneratorArchetype;
  seed?: string | number;
}

export interface GeneratedCoreAttributes {
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
  overall: number;
  potential: number;
}

export interface GeneratedTechnicalAttributes {
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  ballHandling: number;
  dribbling: number;
  midRangeShot: number;
  threePointShot: number;
  freeThrow: number;
  rimFinishing: number;
  dunking: number;
  postMoves: number;
  perimeterDefense: number;
  interiorDefense: number;
  offensiveRebound: number;
  defensiveRebound: number;
}

export interface GeneratedPhysicalProfile {
  heightCm: number;
  weightKg: number;
  wingspanCm: number;
  bodyType: PlayerBodyType;
  standingReachCm: number;
  speed: number;
  acceleration: number;
  strength: number;
  explosiveness: number;
  agility: number;
  balance: number;
  coordination: number;
  reaction: number;
  vertical: number;
  stamina: number;
  endurance: number;
  recovery: number;
  durability: number;
}

export interface GeneratedMentalAttributes {
  confidence: number;
  selfControl: number;
  concentration: number;
  composure: number;
  determination: number;
  workEthic: number;
  professionalism: number;
  leadership: number;
  aggressiveness: number;
  competitiveness: number;
  teamwork: number;
  teamOrientation: number;
  loyalty: number;
  ego: number;
  clutchFactor: number;
}

export interface GeneratedHiddenAttributes {
  consistency: number;
  injuryProneness: number;
  importantMatches: number;
  wantsToLeave: number;
  declineResistance: number;
  adaptability: number;
  discipline: number;
  ambition: number;
  resilience: number;
  pressureHandling: number;
  setbackResponse: number;
}

export interface GeneratedTacticalAttributes {
  basketballIQ: number;
  courtVision: number;
  defenseReading: number;
  offenseReading: number;
  decisionMaking: number;
  shotSelection: number;
  offBallMovement: number;
  spacing: number;
  pickAndRollOffense: number;
  pickAndRollDefense: number;
  helpDefense: number;
  discipline: number;
  helpDefenseAwareness: number;
  offBallAwareness: number;
  pickAndRollRead: number;
  spacingSense: number;
  playDiscipline: number;
  foulDiscipline: number;
  transitionInstincts: number;
}

export interface GeneratedHealthProfile {
  overallCondition: number;
  fatigue: number;
  postInjuryCondition: number;
  durability: number;
  recoveryRate: number;
  injuryRisk: number;
  fatigueBase: number;
  matchFitness: number;
  painTolerance: number;
  medicalOutlook: number;
}

export interface GeneratedPotentialProfile {
  potential: number;
  potentialAbility: number;
  currentAbility: number;
  growthRate: number;
  developmentFocus: PlayerDevelopmentFocus;
  peakStartAge: number;
  peakEndAge: number;
  declineStartAge: number;
  learningAbility: number;
  peakWindowStart: number;
  peakWindowEnd: number;
  ceilingTier: number;
  readiness: number;
}

export interface GeneratedPlayerProfile {
  position: PlayerPosition;
  age: number;
  archetype: PlayerGeneratorArchetype;
  archetypeLabel: string;
  dominantHand: PlayerDominantHand;
  secondaryPositions: PlayerPosition[];
  coreAttributes: GeneratedCoreAttributes;
  technicalAttributes: GeneratedTechnicalAttributes;
  physicalProfile: GeneratedPhysicalProfile;
  mentalAttributes: GeneratedMentalAttributes;
  hiddenAttributes: GeneratedHiddenAttributes;
  tacticalAttributes: GeneratedTacticalAttributes;
  healthProfile: GeneratedHealthProfile;
  potentialProfile: GeneratedPotentialProfile;
}

type CoreAttributeKey = keyof Omit<GeneratedCoreAttributes, 'overall' | 'potential'>;

const CORE_ATTRIBUTE_KEYS: CoreAttributeKey[] = [
  'shooting',
  'passing',
  'defense',
  'rebounding',
  'athleticism',
];

const POSITION_BASELINES: Record<
  PlayerPosition,
  Pick<GeneratedCoreAttributes, CoreAttributeKey>
> = {
  PG: { shooting: 2, passing: 8, defense: -1, rebounding: -12, athleticism: 3 },
  SG: { shooting: 8, passing: 2, defense: 1, rebounding: -7, athleticism: 4 },
  SF: { shooting: 4, passing: 1, defense: 4, rebounding: 1, athleticism: 5 },
  PF: { shooting: -2, passing: -2, defense: 6, rebounding: 8, athleticism: 2 },
  C: { shooting: -8, passing: -5, defense: 9, rebounding: 12, athleticism: -1 },
};

export const PLAYER_ARCHETYPE_CATALOG: Record<PlayerGeneratorArchetype, PlayerArchetypeDefinition> =
  {
    SNIPER: {
      label: 'Снайпер',
      description:
        'Периметральный бросок и штрафные выше среднего, меньше акцента на силовой игре.',
      attributeDeltas: { shooting: 12, passing: -1, defense: -2, rebounding: -5, athleticism: -1 },
      developmentFocus: 'SCORING',
    },
    PLAYMAKER: {
      label: 'Плеймейкер',
      description: 'Создание моментов, ведение и чтение пик-н-ролла, без бонуса к подбору.',
      attributeDeltas: { shooting: 1, passing: 12, defense: -1, rebounding: -5, athleticism: 1 },
      developmentFocus: 'PLAYMAKING',
    },
    THREE_AND_D: {
      label: '3&D',
      description: 'Бросок с дуги и защита по периметру, ограниченное созидание с мячом.',
      attributeDeltas: { shooting: 8, passing: -2, defense: 8, rebounding: -2, athleticism: 1 },
      developmentFocus: 'DEFENSE',
    },
    DEFENSIVE_CENTER: {
      label: 'Защитный центр',
      description: 'Защита кольца, подбор и габариты, слабее бросок и передача.',
      attributeDeltas: { shooting: -6, passing: -3, defense: 12, rebounding: 8, athleticism: 1 },
      developmentFocus: 'DEFENSE',
    },
    SCORER: {
      label: 'Скорер',
      description: 'Набор очков с мяча и через проход, защита и подбор вторичны.',
      attributeDeltas: { shooting: 9, passing: 1, defense: -3, rebounding: -4, athleticism: 4 },
      developmentFocus: 'SCORING',
    },
    VERSATILE_FORWARD: {
      label: 'Универсальный форвард',
      description: 'Баланс передачи, защиты, подбора и атлетизма для игры на нескольких позициях.',
      attributeDeltas: { shooting: 2, passing: 6, defense: 5, rebounding: 4, athleticism: 3 },
      developmentFocus: 'BALANCED',
    },
    ROLE_PLAYER: {
      label: 'Ролевик',
      description: 'Надежный низкорисковый профиль без ярких пиков, полезен в ротации.',
      attributeDeltas: { shooting: 1, passing: 0, defense: 3, rebounding: 1, athleticism: 0 },
      developmentFocus: 'BALANCED',
    },
    PROSPECT: {
      label: 'Проспект',
      description: 'Сырой, но атлетичный профиль с запасом роста; стартовые навыки ниже потолка.',
      attributeDeltas: { shooting: -2, passing: -1, defense: -1, rebounding: 0, athleticism: 7 },
      developmentFocus: 'ATHLETICISM',
    },
  };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(value);
}

function assertRange(name: string, value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }

  if (value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}`);
  }
}

function hashSeed(value: string | number) {
  const text = String(value);
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed?: string | number) {
  let state = seed === undefined ? Math.floor(Math.random() * 4294967296) >>> 0 : hashSeed(seed);

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function randomBetween(random: () => number, min: number, max: number) {
  return min + (max - min) * random();
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.round(randomBetween(random, min, max));
}

function resolveCurrentAbility(potential: number, age: number) {
  if (age <= 18) {
    return potential - 16;
  }

  if (age <= 20) {
    return potential - 12;
  }

  if (age <= 22) {
    return potential - 8;
  }

  if (age <= 25) {
    return potential - 4;
  }

  if (age <= 30) {
    return potential - 1;
  }

  if (age <= 33) {
    return potential - 3;
  }

  return potential - 6 - Math.floor((age - 34) / 2);
}

function resolveSecondaryPositions(
  position: PlayerPosition,
  archetype: PlayerGeneratorArchetype,
): PlayerPosition[] {
  if (archetype === 'VERSATILE_FORWARD') {
    return position === 'SF' ? ['SG', 'PF'] : ['SF'];
  }

  if (archetype === 'DEFENSIVE_CENTER') {
    return position === 'C' ? ['PF'] : ['C'];
  }

  switch (position) {
    case 'PG':
      return ['SG'];
    case 'SG':
      return ['PG', 'SF'];
    case 'SF':
      return ['SG', 'PF'];
    case 'PF':
      return ['SF', 'C'];
    case 'C':
      return ['PF'];
  }
}

function resolveBodyType(heightCm: number, weightKg: number): PlayerBodyType {
  const massIndex = weightKg / (heightCm / 100);

  if (massIndex >= 55) {
    return 'HEAVY';
  }

  if (massIndex >= 49) {
    return 'STRONG';
  }

  if (massIndex >= 44) {
    return 'ATHLETIC';
  }

  return 'SLIM';
}

function resolvePhysicalSizeModifiers(
  position: PlayerPosition,
  heightCm: number,
  weightKg: number,
) {
  const idealByPosition: Record<PlayerPosition, { heightCm: number; weightKg: number }> = {
    PG: { heightCm: 186, weightKg: 84 },
    SG: { heightCm: 193, weightKg: 90 },
    SF: { heightCm: 200, weightKg: 97 },
    PF: { heightCm: 206, weightKg: 106 },
    C: { heightCm: 212, weightKg: 114 },
  };
  const ideal = idealByPosition[position];
  const heightDelta = heightCm - ideal.heightCm;
  const weightDelta = weightKg - ideal.weightKg;

  return {
    speed: clamp(round(-heightDelta * 0.28 - Math.max(0, weightDelta) * 0.18), -10, 10),
    strength: clamp(round(weightDelta * 0.28 + heightDelta * 0.08), -10, 12),
    rebounding: clamp(round(heightDelta * 0.22 + weightDelta * 0.08), -8, 10),
    defense: clamp(round(heightDelta * 0.12 + weightDelta * 0.04), -6, 7),
  };
}

function buildCoreAttributes(input: Required<GeneratePlayerInput>, random: () => number) {
  const targetOverall = clamp(
    resolveCurrentAbility(input.potential, input.age) + randomInt(random, -2, 2),
    45,
    input.potential,
  );
  const positionBias = POSITION_BASELINES[input.position];
  const archetypeBias = PLAYER_ARCHETYPE_CATALOG[input.archetype].attributeDeltas;
  const sizeBias = resolvePhysicalSizeModifiers(input.position, input.heightCm, input.weightKg);

  let attributes = CORE_ATTRIBUTE_KEYS.reduce(
    (next, key) => {
      const sizeModifier =
        key === 'athleticism'
          ? sizeBias.speed
          : key === 'rebounding'
            ? sizeBias.rebounding
            : key === 'defense'
              ? sizeBias.defense
              : 0;

      next[key] = clamp(
        round(
          targetOverall +
            positionBias[key] +
            archetypeBias[key] +
            sizeModifier +
            randomInt(random, -4, 4),
        ),
        25,
        99,
      );

      return next;
    },
    {} as Pick<GeneratedCoreAttributes, CoreAttributeKey>,
  );

  for (let attempts = 0; attempts < 8; attempts += 1) {
    const overall = calculatePlayerOverall({ position: input.position, ...attributes });
    const delta = targetOverall - overall;

    if (Math.abs(delta) <= 1 && overall <= input.potential) {
      break;
    }

    const adjustment = clamp(delta, -4, 4);
    attributes = CORE_ATTRIBUTE_KEYS.reduce(
      (next, key) => {
        next[key] = clamp(attributes[key] + adjustment, 25, 99);
        return next;
      },
      {} as Pick<GeneratedCoreAttributes, CoreAttributeKey>,
    );
  }

  const overall = Math.min(
    input.potential,
    calculatePlayerOverall({ position: input.position, ...attributes }),
  );

  return {
    ...attributes,
    overall,
    potential: input.potential,
  };
}

function buildTechnicalAttributes(
  position: PlayerPosition,
  core: GeneratedCoreAttributes,
): GeneratedTechnicalAttributes {
  const isGuard = position === 'PG' || position === 'SG';
  const isWing = position === 'SF';
  const isBig = position === 'PF' || position === 'C';

  return {
    shooting: core.shooting,
    passing: core.passing,
    defense: core.defense,
    rebounding: core.rebounding,
    ballHandling: clamp(core.passing + (isGuard ? 5 : isBig ? -5 : 1), 1, 100),
    dribbling: clamp(core.passing + (isGuard ? 4 : isBig ? -7 : 1), 1, 100),
    midRangeShot: clamp(core.shooting + (isBig ? -1 : 2), 1, 100),
    threePointShot: clamp(core.shooting + (isGuard || isWing ? 3 : -7), 1, 100),
    freeThrow: clamp(core.shooting + 4, 1, 100),
    rimFinishing: clamp(round((core.shooting + core.athleticism) / 2) + (isBig ? 5 : 0), 1, 100),
    dunking: clamp(core.athleticism + (isBig ? 8 : isWing ? 3 : -6), 1, 100),
    postMoves: clamp(core.shooting + (isBig ? 7 : isWing ? -2 : -10), 1, 100),
    perimeterDefense: clamp(core.defense + (isBig ? -5 : 4), 1, 100),
    interiorDefense: clamp(core.defense + (isBig ? 7 : isGuard ? -8 : 0), 1, 100),
    offensiveRebound: clamp(core.rebounding + (isBig ? 4 : -3), 1, 100),
    defensiveRebound: clamp(core.rebounding + (isBig ? 5 : -1), 1, 100),
  };
}

function buildPhysicalProfile(
  input: Required<GeneratePlayerInput>,
  core: GeneratedCoreAttributes,
  random: () => number,
): GeneratedPhysicalProfile {
  const ageWear = Math.max(0, input.age - 31);
  const sizeBias = resolvePhysicalSizeModifiers(input.position, input.heightCm, input.weightKg);
  const wingspanCm = clamp(
    input.heightCm +
      randomInt(random, input.position === 'PG' ? 5 : 7, input.position === 'C' ? 14 : 12),
    PLAYER_RANGE_PRESETS.wingspanCm.min,
    PLAYER_RANGE_PRESETS.wingspanCm.max,
  );

  return {
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    wingspanCm,
    bodyType: resolveBodyType(input.heightCm, input.weightKg),
    standingReachCm: clamp(
      input.heightCm +
        randomInt(random, input.position === 'PG' ? 45 : 50, input.position === 'C' ? 61 : 57),
      PLAYER_RANGE_PRESETS.standingReachCm.min,
      PLAYER_RANGE_PRESETS.standingReachCm.max,
    ),
    speed: clamp(core.athleticism + sizeBias.speed + 2 - ageWear, 1, 100),
    acceleration: clamp(core.athleticism + sizeBias.speed + 3 - ageWear, 1, 100),
    strength: clamp(round((core.defense + core.rebounding) / 2) + sizeBias.strength, 1, 100),
    explosiveness: clamp(core.athleticism + 4 - ageWear, 1, 100),
    agility: clamp(core.athleticism + sizeBias.speed + 1 - ageWear, 1, 100),
    balance: clamp(core.athleticism + round(sizeBias.strength / 2), 1, 100),
    coordination: clamp(core.athleticism + 2, 1, 100),
    reaction: clamp(core.athleticism + 3, 1, 100),
    vertical: clamp(core.athleticism + 1 - ageWear, 1, 100),
    stamina: clamp(core.athleticism + 2 - Math.floor(ageWear / 2), 1, 100),
    endurance: clamp(core.athleticism + 1 - Math.floor(ageWear / 2), 1, 100),
    recovery: clamp(72 + Math.max(0, 27 - input.age) - ageWear, 1, 100),
    durability: clamp(70 + round(core.overall / 10) - ageWear, 1, 100),
  };
}

function buildMentalAttributes(
  input: Required<GeneratePlayerInput>,
  core: GeneratedCoreAttributes,
) {
  const veteranBonus = input.age >= 30 ? 5 : input.age <= 21 ? -2 : 1;
  const starBonus = core.overall >= 84 ? 5 : core.overall >= 76 ? 2 : 0;

  return {
    confidence: clamp(core.overall + starBonus, 1, 100),
    selfControl: clamp(66 + veteranBonus + round(core.defense / 12), 1, 100),
    concentration: clamp(66 + veteranBonus + round(core.overall / 8), 1, 100),
    composure: clamp(65 + veteranBonus + starBonus + round(core.overall / 10), 1, 100),
    determination: clamp(69 + starBonus + round(core.athleticism / 12), 1, 100),
    workEthic: clamp(71 + round((core.potential - core.overall) * 1.5), 1, 100),
    professionalism: clamp(67 + veteranBonus + round(core.overall / 10), 1, 100),
    leadership: clamp(54 + veteranBonus * 2 + starBonus + round(core.passing / 10), 1, 100),
    aggressiveness: clamp(58 + round(core.defense / 8), 1, 100),
    competitiveness: clamp(69 + starBonus + round(core.overall / 15), 1, 100),
    teamwork: clamp(68 + round(core.passing / 9), 1, 100),
    teamOrientation: clamp(68 + round(core.passing / 10), 1, 100),
    loyalty: clamp(62 + veteranBonus + (core.overall >= 85 ? -2 : 2), 1, 100),
    ego: clamp(43 + starBonus * 2 + round(core.shooting / 12), 1, 100),
    clutchFactor: clamp(61 + starBonus * 2 + round(core.shooting / 12), 1, 100),
  };
}

function buildHiddenAttributes(
  input: Required<GeneratePlayerInput>,
  core: GeneratedCoreAttributes,
) {
  const prospectBonus = input.age <= 22 ? 5 : 0;
  const ageWear = Math.max(0, input.age - 31);

  return {
    consistency: clamp(63 + round(core.overall / 8), 1, 100),
    injuryProneness: clamp(35 + ageWear + round((100 - core.athleticism) / 12), 1, 100),
    importantMatches: clamp(62 + round(core.overall / 7), 1, 100),
    wantsToLeave: clamp(22 + (core.overall >= 84 ? 8 : 0) - prospectBonus, 1, 100),
    declineResistance: clamp(60 + round(core.overall / 9) - ageWear, 1, 100),
    adaptability: clamp(66 + round(core.passing / 12) + prospectBonus, 1, 100),
    discipline: clamp(66 + round(core.defense / 12), 1, 100),
    ambition: clamp(70 + prospectBonus + round(core.potential - core.overall), 1, 100),
    resilience: clamp(67 + round(core.defense / 12), 1, 100),
    pressureHandling: clamp(62 + round(core.overall / 8), 1, 100),
    setbackResponse: clamp(66 + prospectBonus + round(core.overall / 10), 1, 100),
  };
}

function buildTacticalAttributes(
  position: PlayerPosition,
  core: GeneratedCoreAttributes,
): GeneratedTacticalAttributes {
  const isGuard = position === 'PG' || position === 'SG';
  const isBig = position === 'PF' || position === 'C';

  return {
    basketballIQ: clamp(64 + round(core.overall / 6) + round(core.passing / 15), 1, 100),
    courtVision: clamp(core.passing + (isGuard ? 5 : isBig ? -4 : 1), 1, 100),
    defenseReading: clamp(core.defense + round(core.overall / 18), 1, 100),
    offenseReading: clamp(round((core.shooting + core.passing) / 2) + 2, 1, 100),
    decisionMaking: clamp(round((core.passing + core.overall) / 2), 1, 100),
    shotSelection: clamp(round((core.shooting + core.overall) / 2), 1, 100),
    offBallMovement: clamp(core.shooting + (isGuard ? 2 : 0), 1, 100),
    spacing: clamp(core.shooting + (isBig ? -5 : 3), 1, 100),
    pickAndRollOffense: clamp(core.passing + (isGuard ? 4 : isBig ? 1 : 0), 1, 100),
    pickAndRollDefense: clamp(core.defense + (isBig ? 3 : 0), 1, 100),
    helpDefense: clamp(core.defense + (isBig ? 4 : 1), 1, 100),
    discipline: clamp(68 + round(core.defense / 11), 1, 100),
    helpDefenseAwareness: clamp(core.defense + (isBig ? 5 : 1), 1, 100),
    offBallAwareness: clamp(round((core.shooting + core.defense) / 2), 1, 100),
    pickAndRollRead: clamp(round((core.passing + core.defense) / 2) + (isGuard ? 4 : 0), 1, 100),
    spacingSense: clamp(core.shooting + (isBig ? -4 : 3), 1, 100),
    playDiscipline: clamp(69 + round(core.passing / 12), 1, 100),
    foulDiscipline: clamp(69 + round(core.defense / 12), 1, 100),
    transitionInstincts: clamp(round((core.athleticism + core.passing) / 2), 1, 100),
  };
}

function buildHealthProfile(input: Required<GeneratePlayerInput>, core: GeneratedCoreAttributes) {
  const ageRisk = Math.max(0, input.age - 32);

  return {
    overallCondition: clamp(80 + round(core.athleticism / 12) - ageRisk, 1, 100),
    fatigue: clamp(16 + Math.max(0, 30 - input.age) + ageRisk, 1, 100),
    postInjuryCondition: clamp(96 - ageRisk, 1, 100),
    durability: clamp(70 + round(core.athleticism / 9) - ageRisk, 1, 100),
    recoveryRate: clamp(74 + round(core.athleticism / 11) - ageRisk, 1, 100),
    injuryRisk: clamp(28 + round((100 - core.athleticism) / 7) + ageRisk, 1, 100),
    fatigueBase: clamp(18 + ageRisk, 1, 100),
    matchFitness: clamp(80 + round(core.athleticism / 13) - ageRisk, 1, 100),
    painTolerance: clamp(66 + round(core.defense / 10), 1, 100),
    medicalOutlook: clamp(72 + round((core.potential - core.overall) / 2) - ageRisk, 1, 100),
  };
}

function buildPotentialProfile(
  input: Required<GeneratePlayerInput>,
  core: GeneratedCoreAttributes,
): GeneratedPotentialProfile {
  return {
    potential: core.potential,
    potentialAbility: core.potential,
    currentAbility: core.overall,
    growthRate: clamp(
      68 + round((core.potential - core.overall) * 2) + (input.age <= 22 ? 5 : 0),
      1,
      100,
    ),
    developmentFocus: PLAYER_ARCHETYPE_CATALOG[input.archetype].developmentFocus,
    peakStartAge: clamp(input.age - 1, 20, 28),
    peakEndAge: clamp(input.age + 5, 24, 34),
    declineStartAge: clamp(input.age + 8, 27, 37),
    learningAbility: clamp(
      70 + round(core.potential - core.overall) + (input.age <= 23 ? 6 : 0),
      1,
      100,
    ),
    peakWindowStart: clamp(input.age - 1, 20, 28),
    peakWindowEnd: clamp(input.age + 5, 24, 34),
    ceilingTier: clamp(round((core.potential + core.overall) / 2), 1, 100),
    readiness: clamp(round(core.overall * 0.72 + core.potential * 0.28), 1, 100),
  };
}

function resolveDominantHand(random: () => number): PlayerDominantHand {
  const roll = random();

  if (roll < 0.09) {
    return 'LEFT';
  }

  if (roll < 0.11) {
    return 'AMBIDEXTROUS';
  }

  return 'RIGHT';
}

function validateInput(input: GeneratePlayerInput) {
  if (!PLAYER_POSITIONS.includes(input.position)) {
    throw new RangeError(`position must be one of: ${PLAYER_POSITIONS.join(', ')}`);
  }

  assertRange('age', input.age, PLAYER_RANGE_PRESETS.age.min, PLAYER_RANGE_PRESETS.age.max);
  assertRange(
    'heightCm',
    input.heightCm,
    PLAYER_RANGE_PRESETS.heightCm.min,
    PLAYER_RANGE_PRESETS.heightCm.max,
  );
  assertRange(
    'weightKg',
    input.weightKg,
    PLAYER_RANGE_PRESETS.weightKg.min,
    PLAYER_RANGE_PRESETS.weightKg.max,
  );
  assertRange(
    'potential',
    input.potential,
    PLAYER_RANGE_PRESETS.potential.min,
    PLAYER_RANGE_PRESETS.potential.max,
  );

  if (input.archetype && !PLAYER_GENERATOR_ARCHETYPES.includes(input.archetype)) {
    throw new RangeError(`archetype must be one of: ${PLAYER_GENERATOR_ARCHETYPES.join(', ')}`);
  }
}

export function generatePlayerProfile(input: GeneratePlayerInput): GeneratedPlayerProfile {
  validateInput(input);

  const resolvedInput: Required<GeneratePlayerInput> = {
    ...input,
    archetype: input.archetype ?? 'ROLE_PLAYER',
    seed:
      input.seed ??
      `${input.position}:${input.age}:${input.heightCm}:${input.weightKg}:${input.potential}:${input.archetype ?? 'ROLE_PLAYER'}:${Date.now()}`,
  };
  const random = createRandom(resolvedInput.seed);
  const coreAttributes = buildCoreAttributes(resolvedInput, random);

  return {
    position: resolvedInput.position,
    age: resolvedInput.age,
    archetype: resolvedInput.archetype,
    archetypeLabel: PLAYER_ARCHETYPE_CATALOG[resolvedInput.archetype].label,
    dominantHand: resolveDominantHand(random),
    secondaryPositions: resolveSecondaryPositions(resolvedInput.position, resolvedInput.archetype),
    coreAttributes,
    technicalAttributes: buildTechnicalAttributes(resolvedInput.position, coreAttributes),
    physicalProfile: buildPhysicalProfile(resolvedInput, coreAttributes, random),
    mentalAttributes: buildMentalAttributes(resolvedInput, coreAttributes),
    hiddenAttributes: buildHiddenAttributes(resolvedInput, coreAttributes),
    tacticalAttributes: buildTacticalAttributes(resolvedInput.position, coreAttributes),
    healthProfile: buildHealthProfile(resolvedInput, coreAttributes),
    potentialProfile: buildPotentialProfile(resolvedInput, coreAttributes),
  };
}
