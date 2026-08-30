// Animated SVG network graph used in the hero. Nodes pulse and packets travel
// along the links. Pure SVG + SMIL/CSS so it stays lightweight and performant.
export function PacketHeroViz() {
  // node coordinates in a 340x260 viewBox
  const nodes = [
    { id: 'client', x: 40, y: 130, label: 'client', accent: false },
    { id: 'switch', x: 130, y: 60, label: 'switch', accent: false },
    { id: 'router', x: 130, y: 200, label: 'router', accent: false },
    { id: 'fw', x: 230, y: 130, label: 'firewall', accent: true },
    { id: 'wan', x: 310, y: 130, label: 'wan', accent: false },
  ];
  const links = [
    ['client', 'switch'],
    ['client', 'router'],
    ['switch', 'fw'],
    ['router', 'fw'],
    ['fw', 'wan'],
  ];
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      className="hero__viz"
      viewBox="0 0 340 260"
      role="img"
      aria-label="Animated diagram of packets flowing from a client through a switch, router and firewall to the WAN"
    >
      {/* links */}
      {links.map(([a, b], i) => (
        <line
          key={i}
          className="viz-link"
          x1={pos[a].x}
          y1={pos[a].y}
          x2={pos[b].x}
          y2={pos[b].y}
        />
      ))}

      {/* travelling packets */}
      {links.map(([a, b], i) => {
        const path = `M ${pos[a].x} ${pos[a].y} L ${pos[b].x} ${pos[b].y}`;
        const isBlue = i % 2 === 1;
        return (
          <circle key={`p${i}`} r="3.2" className={isBlue ? 'packet-dot--blue' : 'packet-dot'}>
            <animateMotion
              dur={`${2.4 + i * 0.4}s`}
              repeatCount="indefinite"
              begin={`${i * 0.5}s`}
              path={path}
            />
          </circle>
        );
      })}

      {/* nodes */}
      {nodes.map((n) => (
        <g className="viz-node" key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={n.accent ? 8 : 6.5}
            fill={n.accent ? 'var(--wire-2)' : 'var(--panel-2)'}
            stroke={n.accent ? 'var(--wire-2)' : 'var(--wire)'}
            strokeWidth="1.4"
          >
            <animate
              attributeName="opacity"
              values="0.55;1;0.55"
              dur="3s"
              begin={`${n.x / 120}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text className="viz-label" x={n.x} y={n.y + 20} textAnchor="middle">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
