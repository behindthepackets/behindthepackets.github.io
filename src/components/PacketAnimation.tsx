// Packet-view section: a horizontal path with packets continuously travelling
// across the hops. Subtle, CSS-driven, and honours prefers-reduced-motion.
const HOPS = [
  { label: 'client', icon: 'M4 6h16v10H4z M8 20h8' },
  { label: 'switch', icon: 'M3 9h18v6H3z M7 12h.01M11 12h.01M15 12h.01' },
  { label: 'router', icon: 'M3 12h18M6 8l-3 4 3 4M18 8l3 4-3 4' },
  { label: 'firewall', icon: 'M4 4h16v16H4z M4 9h16M4 15h16' },
  { label: 'internet', icon: 'M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18' },
];

export function PacketAnimation() {
  return (
    <div className="packetview">
      <div className="pv-track">
        <div className="pv-line-wrap">
          <div className="pv-line" />
          <span className="pv-packet" />
          <span className="pv-packet pv-packet--2" />
          <span className="pv-packet pv-packet--3" />
        </div>

        {HOPS.map((h) => (
          <div className="pv-hop" key={h.label}>
            <div className="pv-hop__box">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={h.icon} />
              </svg>
            </div>
            <span className="pv-hop__label">{h.label}</span>
          </div>
        ))}
      </div>

      <div className="pv-legend">
        <span>
          <i style={{ background: 'var(--wire)' }} /> egress request
        </span>
        <span>
          <i style={{ background: 'var(--wire-2)' }} /> return traffic
        </span>
        <span>
          <i style={{ background: 'var(--amber)' }} /> retransmit / anomaly
        </span>
      </div>
    </div>
  );
}
