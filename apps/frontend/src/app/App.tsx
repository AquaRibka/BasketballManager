import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useEffectEvent } from 'react';
import { AppShell } from '../components/layout/AppShell';
import {
  DEFAULT_ROUTE,
  getCalendarMatchIdFromPath,
  getTeamIdFromPath,
  NAV_ITEMS,
  type AppRoutePath,
  resolveAppRoute,
} from './routes';
import { SeasonPage } from '../pages/season/SeasonPage';
import { StandingsPage } from '../pages/standings/StandingsPage';
import { CalendarPage } from '../pages/calendar/CalendarPage';
import { TeamsPage } from '../pages/teams/TeamsPage';
import { TeamDetailPage } from '../pages/teams/TeamDetailPage';

type StaticRoutePath = Exclude<AppRoutePath, '/teams' | '/calendar'>;

const routeComponents: Record<StaticRoutePath, ComponentType> = {
  '/standings': StandingsPage,
  '/season': SeasonPage,
};

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const currentRoute = resolveAppRoute(pathname);
  const teamId = getTeamIdFromPath(pathname);
  const matchId = getCalendarMatchIdFromPath(pathname);
  const CurrentSectionPage =
    currentRoute === '/teams' || currentRoute === '/calendar'
      ? null
      : routeComponents[currentRoute as StaticRoutePath];

  useEffect(() => {
    function syncPathname() {
      setPathname(window.location.pathname);
    }

    window.addEventListener('popstate', syncPathname);

    return () => {
      window.removeEventListener('popstate', syncPathname);
    };
  }, []);

  useEffect(() => {
    const isKnownTeamsDetailRoute = teamId !== null;
    const isKnownCalendarDetailRoute = matchId !== null;

    if (pathname !== currentRoute && !isKnownTeamsDetailRoute && !isKnownCalendarDetailRoute) {
      window.history.replaceState({}, '', currentRoute);
      setPathname(currentRoute);
    }
  }, [currentRoute, pathname, teamId, matchId]);

  const navigateTo = useEffectEvent((nextPath: string) => {
    if (nextPath === pathname) {
      return;
    }

    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
  });

  const teamsPage = teamId ? (
    <TeamDetailPage teamId={teamId} onNavigate={navigateTo} />
  ) : (
    <TeamsPage onNavigate={navigateTo} />
  );

  const calendarPage = <CalendarPage matchId={matchId} onNavigate={navigateTo} />;

  return (
    <AppShell
      currentRoute={currentRoute}
      defaultRoute={DEFAULT_ROUTE}
      navigationItems={NAV_ITEMS}
      onNavigate={navigateTo}
    >
      {currentRoute === '/teams'
        ? teamsPage
        : currentRoute === '/calendar'
          ? calendarPage
          : CurrentSectionPage
            ? <CurrentSectionPage />
            : null}
    </AppShell>
  );
}
