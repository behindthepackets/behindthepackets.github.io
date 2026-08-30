import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { experiments, getExperiment } from '../data/experiments';
import { Markdown } from '../components/Markdown';
import { Tag } from '../components/Tag';
import { StatusPill, DifficultyTag } from '../components/Pills';

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ExperimentPage() {
  const { slug } = useParams();
  const exp = slug ? getExperiment(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!exp) {
    return (
      <main className="container exp">
        <p className="empty">// experiment not found</p>
        <Link to="/" className="btn btn--ghost">
          ← back to the lab
        </Link>
      </main>
    );
  }

  const idx = experiments.findIndex((e) => e.slug === exp.slug);
  const next = experiments[idx + 1];
  const prev = experiments[idx - 1];

  return (
    <main className="container exp">
      <Link to="/#experiments" className="exp__back">
        ← all experiments
      </Link>

      <div className="exp__meta">
        <span>DAY {String(exp.day).padStart(2, '0')}</span>
        <span>·</span>
        <span>{exp.concept}</span>
        <span>·</span>
        <span>{exp.date}</span>
        <StatusPill status={exp.status} />
        <DifficultyTag difficulty={exp.difficulty} />
      </div>

      <h1 className="exp__title">{exp.title}</h1>
      <p className="exp__summary">{exp.summary}</p>

      <div className="exp__tags">
        {exp.tags.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>

      <div className="exp__layout">
        <nav className="exp__toc" aria-label="Sections">
          {exp.sections.map((s, i) => (
            <a key={s.title} href={`#${slugify(s.title)}`}>
              {String(i + 1).padStart(2, '0')} · {s.title}
            </a>
          ))}
        </nav>

        <article>
          {exp.sections.map((s, i) => (
            <section
              key={s.title}
              className="exp-section"
              id={slugify(s.title)}
            >
              <div className="exp-section__head">
                <span className="exp-section__idx">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="exp-section__title">{s.title}</h2>
              </div>
              <Markdown content={s.body} />
            </section>
          ))}

          <div className="exp__next">
            {prev ? (
              <Link to={`/experiments/${prev.slug}`} className="btn btn--ghost">
                ← {prev.concept}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link to={`/experiments/${next.slug}`} className="btn btn--primary">
                {next.concept} →
              </Link>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
