import { EmptySectionPage } from '../shared/EmptySectionPage';

export function CalendarPage() {
  return (
    <EmptySectionPage
      caption="Календарь"
      title="Игровой календарь сезона"
      description="Здесь будет отображаться сетка матчей, ближайшие игры и переход между турами."
      highlights={[
        'Маршрут `/calendar` доступен через меню.',
        'Раздел имеет отдельный empty state для MVP.',
        'Структура готова для подключения расписания из backend API.',
      ]}
    />
  );
}
