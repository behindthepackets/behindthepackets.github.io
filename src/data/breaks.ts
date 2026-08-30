import type { BrokenThing } from './types';

// The honest section: failed experiments and mistakes. These are first-class.
export const breaks: BrokenThing[] = [
  {
    id: 'broke-dns',
    title: 'How I accidentally broke DNS for the whole house',
    blast: 'All name resolution down · ~15 min',
    what: 'Every device showed "server not found" while raw IPs still worked. Ping to 8.8.8.8 was fine; ping to google.com failed everywhere.',
    cause:
      'I restarted the Pi-hole to apply a change and its upstream resolver setting was blank after the edit. The resolver accepted queries on :53 but had nowhere to forward them, so it silently failed to recurse.',
    fix: 'Restored the upstream (1.1.1.1) in the config and restarted. Verified with dig @192.168.10.2 google.com before trusting it again.',
    lesson:
      'Reachable is not the same as working. A DNS server can answer on port 53 and still resolve nothing. dig @server is the fastest way to prove which hop is actually broken.',
    relatedSlug: 'dns-what-happens-when-i-type',
  },
  {
    id: 'mtu-mystery',
    title: 'The mysterious MTU problem',
    blast: 'SSH fine, file copies hang · 2 days intermittent',
    what: 'Interactive SSH felt perfect, but large transfers and some HTTPS pages froze partway and never recovered.',
    cause:
      'A tunnel added encapsulation overhead, dropping the effective path MTU. Large DF-set packets were silently discarded and the ICMP "fragmentation needed" replies were being filtered — a textbook path-MTU black hole.',
    fix: 'Lowered the interface MTU / enabled MSS clamping on the tunnel so TCP negotiated a segment size that fit. Confirmed with ping -M do -s to find the real ceiling.',
    lesson:
      'Small packets working while large ones vanish is the signature of an MTU issue, not a bandwidth or DNS one. Never blanket-block ICMP — PMTUD depends on it.',
  },
  {
    id: 'route-never-used',
    title: 'Why was this route never being used?',
    blast: 'Traffic ignored a new path · ~30 min',
    what: 'I added a static route to steer a subnet down a faster link, but traffic stubbornly kept taking the old path.',
    cause:
      'A more specific route already existed with a longer prefix. Longest-prefix match always wins, so my broader route was never consulted, regardless of metric.',
    fix: 'Made the intended route as specific as (or more specific than) the competing entry, then confirmed the next hop with ip route get <dest>.',
    lesson:
      'The routing table is not first-match or lowest-metric-first — it is longest-prefix-match first. Always verify the actual decision with ip route get instead of assuming.',
  },
];
