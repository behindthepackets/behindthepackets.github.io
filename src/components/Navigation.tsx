import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteConfig } from '../data/config';
import { useSectionScroll } from '../lib/useSectionScroll';

const sections = [
  { id: 'journey', label: 'journey' },
  { id: 'lab', label: 'lab' },
  { id: 'experiments', label: 'experiments' },
  { id: 'packets', label: 'packets' },
  { id: 'broke', label: 'broke' },
  { id: 'notes', label: 'notes' },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const goTo = useSectionScroll();

  const handle = (id: string) => {
    setOpen(false);
    goTo(id);
  };

  return (
    <nav className="nav">
      <div className="container nav__inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
            <g stroke="var(--wire)" strokeWidth="1.6" fill="none">
              <circle cx="8" cy="8" r="2.4" fill="var(--wire)" />
              <circle cx="24" cy="8" r="2.4" />
              <circle cx="8" cy="24" r="2.4" />
              <circle cx="24" cy="24" r="2.4" fill="var(--wire)" />
              <circle cx="16" cy="16" r="2.8" fill="var(--wire-2)" />
              <line x1="8" y1="8" x2="16" y2="16" />
              <line x1="24" y1="8" x2="16" y2="16" />
              <line x1="8" y1="24" x2="16" y2="16" />
              <line x1="24" y1="24" x2="16" y2="16" />
            </g>
          </svg>
          <span>
            <span className="brand__prompt">~/</span>
            {siteConfig.handle}
            <span className="brand__caret">_</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav__toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '≡'}
        </button>

        <div className={`nav__links ${open ? 'is-open' : ''}`}>
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className="nav__link"
              onClick={() => handle(s.id)}
            >
              {s.label}
            </button>
          ))}
          <Link
            to="/experiments/proxmox-first-boot"
            className={`nav__link ${pathname.startsWith('/experiments') ? 'is-active' : ''}`}
            onClick={() => setOpen(false)}
          >
            → start
          </Link>
        </div>
      </div>
    </nav>
  );
}
