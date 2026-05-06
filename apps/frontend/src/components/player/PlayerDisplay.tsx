import type { TeamPlayer } from '../../shared/api/client';

type PlayerDisplayVariant = 'inline' | 'card';

type PlayerDisplayProps = {
  player: TeamPlayer;
  teamShortName?: string;
  variant?: PlayerDisplayVariant;
};

const attributeItems = [
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'defense', label: 'Defense' },
  { key: 'rebounding', label: 'Rebounding' },
  { key: 'athleticism', label: 'Athleticism' },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    TeamPlayer,
    'shooting' | 'passing' | 'defense' | 'rebounding' | 'athleticism'
  >;
  label: string;
}>;

export function PlayerDisplay({
  player,
  teamShortName,
  variant = 'card',
}: PlayerDisplayProps) {
  if (variant === 'inline') {
    return (
      <div className="player-inline">
        <div className="player-inline-copy">
          <strong>{player.name}</strong>
          <span>
            {player.position} · {player.age} года
          </span>
        </div>
        <span className="player-inline-overall">OVR {player.overall}</span>
      </div>
    );
  }

  return (
    <div className="player-display-card">
      <div className="player-detail-main">
        <div className="player-identity">
          <strong>{player.name}</strong>
          <span>
            {player.position} · {player.age} года
          </span>
        </div>
        <div className="player-pill-row">
          <span className="player-pill">Overall {player.overall}</span>
          <span className="player-pill">Potential {player.potential}</span>
          {teamShortName ? <span className="player-pill">Team {teamShortName}</span> : null}
        </div>
      </div>

      <div className="attributes-grid">
        {attributeItems.map((attribute) => (
          <article className="attribute-card" key={attribute.key}>
            <span>{attribute.label}</span>
            <strong>{player[attribute.key]}</strong>
          </article>
        ))}
      </div>
    </div>
  );
}
