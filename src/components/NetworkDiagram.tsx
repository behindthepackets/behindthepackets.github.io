// Interactive SVG topology of the home lab. Nodes highlight on hover, and the
// active node (driven by the node list) lights up its links. Swap this out for a
// real exported topology image by dropping one in /public and rendering it here.
interface DiagramNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

const NODES: DiagramNode[] = [
  { id: 'wan', x: 300, y: 40, label: 'WAN' },
  { id: 'firewall', x: 300, y: 110, label: 'Firewall' },
  { id: 'router', x: 300, y: 180, label: 'Router' },
  { id: 'switch', x: 300, y: 250, label: 'Switch' },
  { id: 'ap', x: 150, y: 250, label: 'Wi-Fi AP' },
  { id: 'server', x: 450, y: 250, label: 'Server' },
  { id: 'vlan-trusted', x: 90, y: 330, label: 'VLAN10' },
  { id: 'vlan-iot', x: 210, y: 330, label: 'VLAN20' },
  { id: 'vms', x: 400, y: 330, label: 'VMs' },
  { id: 'containers', x: 500, y: 330, label: 'Containers' },
];

const EDGES: [string, string][] = [
  ['wan', 'firewall'],
  ['firewall', 'router'],
  ['router', 'switch'],
  ['switch', 'ap'],
  ['switch', 'server'],
  ['ap', 'vlan-trusted'],
  ['ap', 'vlan-iot'],
  ['server', 'vms'],
  ['server', 'containers'],
];

const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));

export function NetworkDiagram({
  activeId,
  onHover,
}: {
  activeId?: string | null;
  onHover?: (id: string | null) => void;
}) {
  return (
    <svg
      viewBox="0 0 600 380"
      role="img"
      aria-label="Home network topology from WAN through firewall, router and switch down to VLANs, VMs and containers"
      style={{ width: '100%', height: 'auto' }}
    >
      {EDGES.map(([a, b], i) => {
        const hot = activeId === a || activeId === b;
        return (
          <path
            key={i}
            className={`topo-edge ${hot ? 'is-hot' : ''}`}
            d={`M ${pos[a].x} ${pos[a].y} L ${pos[b].x} ${pos[b].y}`}
          />
        );
      })}

      {NODES.map((n) => {
        const active = activeId === n.id;
        return (
          <g
            key={n.id}
            className={`topo-node ${active ? 'is-active' : ''}`}
            onMouseEnter={() => onHover?.(n.id)}
            onMouseLeave={() => onHover?.(null)}
          >
            <rect
              x={n.x - 42}
              y={n.y - 15}
              width="84"
              height="30"
              rx="6"
              fill="var(--panel-2)"
              stroke="var(--line)"
              strokeWidth="1.3"
            />
            <text x={n.x} y={n.y + 3.5} textAnchor="middle">
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
