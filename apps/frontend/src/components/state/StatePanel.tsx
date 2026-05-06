type StatePanelProps = {
  actionLabel?: string;
  actionDisabled?: boolean;
  description: string;
  eyebrow: string;
  onAction?: () => void;
  title: string;
};

export function StatePanel({
  actionDisabled = false,
  actionLabel,
  description,
  eyebrow,
  onAction,
  title,
}: StatePanelProps) {
  return (
    <section className="panel state-panel">
      <div className="state-panel-body">
        <p className="empty-state-kicker">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="section-copy">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <div className="action-row">
          <button
            className="hero-home-link schedule-action-button"
            type="button"
            disabled={actionDisabled}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
