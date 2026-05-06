type EmptySectionPageProps = {
  caption: string;
  description: string;
  title: string;
  highlights: string[];
};

export function EmptySectionPage({
  caption,
  description,
  title,
  highlights,
}: EmptySectionPageProps) {
  return (
    <>
      <section className="panel section-intro">
        <p className="section-kicker">{caption}</p>
        <h2>{title}</h2>
        <p className="section-copy">{description}</p>
      </section>

      <section className="panel empty-state-panel">
        <div className="empty-state-card">
          <p className="empty-state-kicker">Empty page</p>
          <h3>Раздел подготовлен для дальнейшей реализации</h3>
          <p>
            Маршрут уже доступен в приложении, поэтому пользователь может перейти в этот
            раздел и вернуться обратно через основную навигацию MVP.
          </p>
        </div>
        <ul className="status-list">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
