import type { Difficulty, Status } from '../data/types';

const statusLabel: Record<Status, string> = {
  planned: 'planned',
  'in-progress': 'in progress',
  complete: 'complete',
  broken: 'broke it',
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`pill pill--${status}`}>
      <span className="dot" />
      {statusLabel[status]}
    </span>
  );
}

const diffLabel: Record<Difficulty, string> = {
  intro: 'intro',
  core: 'core',
  deep: 'deep dive',
  advanced: 'advanced',
};

export function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className="diff">
      lvl · <b>{diffLabel[difficulty]}</b>
    </span>
  );
}
