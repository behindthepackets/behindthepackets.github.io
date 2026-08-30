import { useMemo, useState } from 'react';
import { journey } from '../data/journey';
import { ExperimentCard } from './ExperimentCard';
import { Tag } from './Tag';

// The journey grid with tag filtering. Reads straight from journey.ts, so new
// days appear here automatically.
export function Timeline() {
  const [active, setActive] = useState<string>('all');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    journey.forEach((j) => j.tags.forEach((t) => set.add(t)));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(
    () =>
      active === 'all'
        ? journey
        : journey.filter((j) => j.tags.includes(active)),
    [active]
  );

  return (
    <>
      <div className="filters">
        {allTags.map((t) => (
          <Tag
            key={t}
            label={t}
            active={active === t}
            onClick={() => setActive(t)}
          />
        ))}
      </div>

      <div className="journey-grid">
        {filtered.map((entry) => (
          <ExperimentCard key={entry.day} entry={entry} />
        ))}
      </div>
    </>
  );
}
