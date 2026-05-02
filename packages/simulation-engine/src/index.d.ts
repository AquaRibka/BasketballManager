import type {
  MatchSimulationInput,
  MatchSimulationPlayerSnapshot,
  MatchSimulationResult,
  MatchSimulationTeamSnapshot,
} from '@basketball-manager/shared';

export type SimulateMatchPlayerInput = MatchSimulationPlayerSnapshot;
export type SimulateMatchTeamInput = MatchSimulationTeamSnapshot;
export type SimulateMatchInput = MatchSimulationInput;
export type SimulateMatchResult = MatchSimulationResult;

export function calculateTeamStrengthV1(
  team: MatchSimulationTeamSnapshot,
  options?: {
    randomValue?: number;
  },
): number;

export function simulateMatch(input: MatchSimulationInput): MatchSimulationResult;
