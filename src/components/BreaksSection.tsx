import { Link } from 'react-router-dom';
import { breaks } from '../data/breaks';

export function BreaksSection() {
  return (
    <div className="breaks-grid">
      {breaks.map((b) => (
        <div key={b.id} className="card break-card">
          <span className="break-card__blast">▲ {b.blast}</span>
          <h3 className="break-card__title">{b.title}</h3>

          <div className="break-row">
            <b>what happened</b>
            <span>{b.what}</span>
          </div>
          <div className="break-row">
            <b>root cause</b>
            <span>{b.cause}</span>
          </div>
          <div className="break-row">
            <b>the fix</b>
            <span>{b.fix}</span>
          </div>

          <div className="break-card__lesson">
            <b>lesson · </b>
            {b.lesson}
            {b.relatedSlug && (
              <>
                {' '}
                <Link
                  to={`/experiments/${b.relatedSlug}`}
                  style={{ color: 'var(--wire-2)', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  related experiment →
                </Link>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
