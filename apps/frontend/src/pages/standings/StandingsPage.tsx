import { EmptySectionPage } from '../shared/EmptySectionPage';

export function StandingsPage() {
  return (
    <EmptySectionPage
      caption="Таблица"
      title="Турнирная таблица и позиции команд"
      description="Раздел зарезервирован под конференции, победы/поражения и борьбу за плей-офф."
      highlights={[
        'Маршрут `/standings` подключён к общей навигации.',
        'Активное состояние видно в верхнем и боковом меню.',
        'Пустая страница готова для будущего standings view.',
      ]}
    />
  );
}
