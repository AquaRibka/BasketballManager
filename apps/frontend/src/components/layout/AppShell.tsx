import type { PropsWithChildren } from 'react';
import type { AppRoutePath, NavigationItem } from '../../app/routes';

type AppShellProps = PropsWithChildren<{
  currentRoute: AppRoutePath;
  defaultRoute: AppRoutePath;
  navigationItems: NavigationItem[];
  onNavigate: (route: AppRoutePath) => void;
}>;

export function AppShell({
  children,
  currentRoute,
  defaultRoute,
  navigationItems,
  onNavigate,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-topline">
          <div>
            <p className="eyebrow">MVP-3 Frontend/Save</p>
            <h1>Basketball Manager</h1>
            <p className="hero-copy">
              Базовый layout и навигация между ключевыми разделами карьерного режима.
            </p>
          </div>
          <a
            className="hero-home-link"
            href={defaultRoute}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(defaultRoute);
            }}
          >
            MVP Navigation
          </a>
        </div>
        <nav aria-label="Основные разделы" className="top-navigation">
          {navigationItems.map((item) => {
            const isActive = item.path === currentRoute;

            return (
              <a
                key={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`top-navigation-link${isActive ? ' is-active' : ''}`}
                href={item.path}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.path);
                }}
              >
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </header>
      <div className="layout-grid">
        <aside className="sidebar panel">
          <div className="sidebar-copy">
            <p className="sidebar-label">Разделы MVP</p>
            <h2>Переходы между основными экранами</h2>
            <p>
              Боковое меню повторяет маршруты сверху и показывает, какой раздел сейчас открыт.
            </p>
          </div>
          <nav aria-label="Боковое меню" className="sidebar-nav">
            {navigationItems.map((item) => {
              const isActive = item.path === currentRoute;

              return (
                <a
                  key={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`sidebar-link${isActive ? ' is-active' : ''}`}
                  href={item.path}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(item.path);
                  }}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </a>
              );
            })}
          </nav>
        </aside>
        <main className="content-grid">{children}</main>
      </div>
    </div>
  );
}
