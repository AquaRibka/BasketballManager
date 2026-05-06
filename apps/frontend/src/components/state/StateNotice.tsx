type StateNoticeProps = {
  actionLabel?: string;
  actionDisabled?: boolean;
  description: string;
  onAction?: () => void;
  title: string;
  tone?: 'default' | 'error';
};

export function StateNotice({
  actionDisabled = false,
  actionLabel,
  description,
  onAction,
  title,
  tone = 'default',
}: StateNoticeProps) {
  return (
    <div className={`state-notice${tone === 'error' ? ' is-error' : ''}`}>
      <strong>{title}</strong>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button
          className="ghost-button state-notice-action"
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
