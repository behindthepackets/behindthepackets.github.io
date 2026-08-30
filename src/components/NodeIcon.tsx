import type { LabNode } from '../data/types';

// Minimal line icons per node kind. Inherit currentColor so CSS controls tint.
export function NodeIcon({ kind }: { kind: LabNode['kind'] }) {
  const s = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (kind) {
    case 'wan':
      return (
        <svg {...s}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>
      );
    case 'router':
      return (
        <svg {...s}><rect x="3" y="13" width="18" height="7" rx="1.5" /><path d="M7 17h.01M11 17h.01M16 6l3-3m0 0h-3m3 0v3M8 6l-3-3m0 0v3m0-3h3" /></svg>
      );
    case 'firewall':
      return (
        <svg {...s}><path d="M4 4h16v16H4z" /><path d="M4 9h16M4 14h16M9 4v5m6 0V4m-9 5v5m12-5v5M9 14v6m6-6v6" /></svg>
      );
    case 'switch':
      return (
        <svg {...s}><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7 12h.01M10 12h.01M13 12h.01M16 12h.01" /></svg>
      );
    case 'ap':
      return (
        <svg {...s}><path d="M5 12a10 10 0 0114 0M8 15a6 6 0 018 0" /><circle cx="12" cy="19" r="1.4" fill="currentColor" /></svg>
      );
    case 'server':
      return (
        <svg {...s}><rect x="4" y="4" width="16" height="7" rx="1.4" /><rect x="4" y="13" width="16" height="7" rx="1.4" /><path d="M8 7.5h.01M8 16.5h.01" /></svg>
      );
    case 'vm':
      return (
        <svg {...s}><rect x="3" y="4" width="18" height="13" rx="1.6" /><path d="M8 21h8M12 17v4" /></svg>
      );
    case 'container':
      return (
        <svg {...s}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></svg>
      );
    default:
      return (
        <svg {...s}><rect x="5" y="4" width="14" height="16" rx="1.6" /><path d="M9 20h6" /></svg>
      );
  }
}
