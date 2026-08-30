interface TagProps {
  label: string;
  active?: boolean;
  onClick?: (label: string) => void;
}

export function Tag({ label, active, onClick }: TagProps) {
  if (onClick) {
    return (
      <button
        type="button"
        className={`tag tag--btn ${active ? 'tag--active' : ''}`}
        onClick={() => onClick(label)}
      >
        {label}
      </button>
    );
  }
  return <span className="tag">{label}</span>;
}
