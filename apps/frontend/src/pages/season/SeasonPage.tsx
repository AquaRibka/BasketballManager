import { EmptySectionPage } from '../shared/EmptySectionPage';

export function SeasonPage() {
  return (
    <EmptySectionPage
      caption="Сезон"
      title="Управление ходом сезона"
      description="Здесь появятся статус сезона, симуляция следующего тура и ключевые действия карьерного режима."
      highlights={[
        'Маршрут `/season` доступен как основной раздел MVP.',
        'Страница показывает готовый layout для экранов управления.',
        'Empty state оставляет место под controls и season summary.',
      ]}
    />
  );
}
