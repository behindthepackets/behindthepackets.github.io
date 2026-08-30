import { Link } from 'react-router-dom';
import type { JourneyEntry } from '../data/types';
import { Tag } from './Tag';
import { StatusPill, DifficultyTag } from './Pills';

export function ExperimentCard({ entry }: { entry: JourneyEntry }) {
  const inner = (
    <>
      <span className={`jcard__edge`} />
      <div className="jcard__foot" style={{ marginBottom: '0.2rem' }}>
        <span className="jcard__day">
          DAY {String(entry.day).padStart(2, '0')}
        </span>
        <StatusPill status={entry.status} />
      </div>

      <h3 className="jcard__concept">{entry.concept}</h3>
      <p className="jcard__summary">{entry.summary}</p>

      <div className="jcard__tags">
        {entry.tags.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>

      <hr className="divider" style={{ margin: '0.2rem 0' }} />

      <div className="jcard__foot">
        <DifficultyTag difficulty={entry.difficulty} />
        <span className="jcard__go">
          {entry.hasExperiment ? 'open experiment →' : 'logged soon'}
        </span>
      </div>
    </>
  );

  const cls = `card jcard jcard--${entry.status} ${
    entry.hasExperiment ? 'jcard--link' : 'jcard--soon'
  }`;

  if (entry.hasExperiment) {
    return (
      <Link to={`/experiments/${entry.slug}`} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
