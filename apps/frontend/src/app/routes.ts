export type AppRoutePath = '/teams' | '/calendar' | '/standings' | '/season';

export type NavigationItem = {
  description: string;
  label: string;
  path: AppRoutePath;
};

export const DEFAULT_ROUTE: AppRoutePath = '/teams';

export const NAV_ITEMS: NavigationItem[] = [
  {
    path: '/teams',
    label: 'Команды',
    description: 'Составы, рейтинг и быстрый обзор клубов.',
  },
  {
    path: '/calendar',
    label: 'Календарь',
    description: 'Ближайшие матчи и игровая сетка сезона.',
  },
  {
    path: '/standings',
    label: 'Таблица',
    description: 'Позиции конференций и борьба за плей-офф.',
  },
  {
    path: '/season',
    label: 'Сезон',
    description: 'Статус симуляции и ключевые этапы карьеры.',
  },
];

export function resolveAppRoute(pathname: string): AppRoutePath {
  if (pathname === DEFAULT_ROUTE || pathname.startsWith(`${DEFAULT_ROUTE}/`)) {
    return DEFAULT_ROUTE;
  }

  if (pathname === '/calendar' || pathname.startsWith('/calendar/')) {
    return '/calendar';
  }

  const matchedItem = NAV_ITEMS.find((item) => item.path === pathname);
  return matchedItem?.path ?? DEFAULT_ROUTE;
}

export function getTeamIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith('/teams/')) {
    return null;
  }

  const teamId = pathname.slice('/teams/'.length).trim();
  return teamId.length > 0 ? teamId : null;
}

export function getCalendarMatchIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith('/calendar/matches/')) {
    return null;
  }

  const matchId = pathname.slice('/calendar/matches/'.length).trim();
  return matchId.length > 0 ? matchId : null;
}
