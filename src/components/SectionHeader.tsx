interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
  id?: string;
}

export function SectionHeader({ eyebrow, title, lede, id }: SectionHeaderProps) {
  return (
    <div className="section-head" id={id}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {lede && <p className="section-lede">{lede}</p>}
    </div>
  );
}
