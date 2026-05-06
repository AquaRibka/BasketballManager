export const apiEndpoints = {
  teams: {
    list: '/teams',
    create: '/teams',
    details: (teamId: string) => `/teams/${teamId}`,
    roster: (teamId: string) => `/teams/${teamId}/players`,
  },
  players: {
    create: '/players',
  },
  saves: {
    create: '/saves',
    details: (saveId: string) => `/saves/${saveId}`,
    nextSeason: (saveId: string) => `/saves/${saveId}/next-season`,
  },
  seasons: {
    create: '/seasons',
    current: '/seasons/current',
    details: (seasonId: string) => `/seasons/${seasonId}`,
    schedule: (seasonId: string) => `/seasons/${seasonId}/schedule`,
    standings: (seasonId: string) => `/seasons/${seasonId}/standings`,
    simulateCurrentRound: (seasonId: string) => `/seasons/${seasonId}/current-round/simulate`,
    simulateRemaining: (seasonId: string) => `/seasons/${seasonId}/simulate`,
    nextRound: (seasonId: string) => `/seasons/${seasonId}/next-round`,
    status: (seasonId: string) => `/seasons/${seasonId}/status`,
  },
} as const;
