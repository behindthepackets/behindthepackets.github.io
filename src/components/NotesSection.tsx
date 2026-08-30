import { useMemo, useState } from 'react';
import { notes } from '../data/notes';
import { Tag } from './Tag';

export function NotesSection() {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(notes[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.question.toLowerCase().includes(q) ||
        n.answer.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <>
      <label className="search">
        <span className="search__prompt">grep</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search the knowledge base… (arp, nat, dns, tcp)"
          aria-label="Search notes"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="empty">// no notes matched "{query}"</p>
      ) : (
        <div className="notes-list">
          {filtered.map((n) => {
            const open = openId === n.id;
            return (
              <div key={n.id} className={`note ${open ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="note__q"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : n.id)}
                >
                  <span>
                    <span className="note__q-prefix">?</span>
                    {n.question}
                  </span>
                  <span className="note__sign">+</span>
                </button>
                {open && (
                  <div className="note__a">
                    <p style={{ margin: 0 }}>{n.answer}</p>
                    <div className="note__tags">
                      {n.tags.map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
