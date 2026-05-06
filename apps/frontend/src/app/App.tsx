import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useEffectEvent } from 'react';
import { AppShell } from '../components/layout/AppShell';
import {
  DEFAULT_ROUTE,
  NAV_ITEMS,
  type AppRoutePath,
  resolveAppRoute,
} from './routes';
import { SeasonPage } from '../pages/season/SeasonPage';
import { StandingsPage } from '../pages/standings/StandingsPage';
import { CalendarPage } from '../pages/calendar/CalendarPage';
import { TeamsPage } from '../pages/teams/TeamsPage';

const routeComponents: Record<AppRoutePath, ComponentType> = {
  '/teams': TeamsPage,
  '/calendar': CalendarPage,
  '/standings': StandingsPage,
  '/season': SeasonPage,
};

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const currentRoute = resolveAppRoute(pathname);
  const CurrentPage = routeComponents[currentRoute];

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
    if (pathname !== currentRoute) {
      window.history.replaceState({}, '', currentRoute);
      setPathname(currentRoute);
    }
  }, [currentRoute, pathname]);

  const navigateTo = useEffectEvent((route: AppRoutePath) => {
    if (route === pathname) {
      return;
    }

    window.history.pushState({}, '', route);
    setPathname(route);
  });

  return (
    <AppShell
      currentRoute={currentRoute}
      defaultRoute={DEFAULT_ROUTE}
      navigationItems={NAV_ITEMS}
      onNavigate={navigateTo}
    >
      <CurrentPage />
    </AppShell>
  );
}
