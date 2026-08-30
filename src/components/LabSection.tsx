import { useState } from 'react';
import { labNodes } from '../data/lab';
import { NetworkDiagram } from './NetworkDiagram';
import { NetworkNode } from './NetworkNode';

export function LabSection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="lab-layout">
      <div className="card topo">
        <div className="topo__frame">
          <NetworkDiagram activeId={active} onHover={setActive} />
        </div>
        <p className="topo__note">
          {/* Replace this SVG with a real exported topology by dropping an image
             in /public and rendering it here. */}
          topology.svg · hover a device to trace its links · evolving lab, subject to change
        </p>
      </div>

      <div className="node-list">
        {labNodes.map((node) => (
          <NetworkNode key={node.id} node={node} onHover={setActive} />
        ))}
      </div>
    </div>
  );
}
