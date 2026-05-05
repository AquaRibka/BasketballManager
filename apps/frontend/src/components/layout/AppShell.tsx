import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">MVP-3 Frontend/Save</p>
        <h1>Basketball Manager</h1>
        <p className="hero-copy">
          React-приложение для управления карьерой, сезонами и симуляцией матчей.
        </p>
      </header>
      <main className="content-grid">{children}</main>
    </div>
  );
}
