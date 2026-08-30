import type { LabNode } from '../data/types';
import { NodeIcon } from './NodeIcon';
import { Tag } from './Tag';

// A single row describing a device/segment in the lab. Hovering is handled by
// the parent so it can also highlight the matching SVG node.
export function NetworkNode({
  node,
  onHover,
}: {
  node: LabNode;
  onHover?: (id: string | null) => void;
}) {
  return (
    <div
      className="node-row"
      onMouseEnter={() => onHover?.(node.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="node-row__icon">
        <NodeIcon kind={node.kind} />
      </div>
      <div>
        <div className="node-row__label">{node.label}</div>
        <div className="node-row__detail">{node.detail}</div>
        <div className="node-row__meta">
          {node.meta.map((m) => (
            <Tag key={m} label={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
