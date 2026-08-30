import type { Note } from './types';

// Short, searchable knowledge-base entries. Add as many as you like.
export const notes: Note[] = [
  {
    id: 'what-is-arp',
    question: 'What is ARP?',
    answer:
      'The Address Resolution Protocol maps a known IPv4 address to an unknown MAC address inside a single broadcast domain. A host broadcasts "who has this IP?" and the owner replies with its MAC. Nothing authenticates the reply, which is why ARP is trivially spoofable.',
    tags: ['ARP', 'Layer 2'],
  },
  {
    id: 'switch-mac-table',
    question: 'Why does a switch need a MAC address table?',
    answer:
      'A switch forwards frames by destination MAC. It learns which MAC lives behind which port by reading the source MAC of every frame it receives. Unknown destinations are flooded out all ports; once learned, frames are sent only out the correct port. The table ages entries out so moves are eventually relearned.',
    tags: ['Switching', 'Layer 2'],
  },
  {
    id: 'type-google',
    question: 'What actually happens when I type google.com?',
    answer:
      'The stub resolver asks your configured DNS server for the A/AAAA record. If uncached, a recursive resolver walks root → TLD → authoritative servers. Once an IP is returned (with a TTL), the browser opens a TCP connection, completes a TLS handshake, and sends an HTTP request. Caching at every layer means the second visit looks almost nothing like the first.',
    tags: ['DNS', 'TCP', 'TLS'],
  },
  {
    id: 'where-nat',
    question: 'Where does NAT happen?',
    answer:
      'Source NAT typically happens on the router/firewall at the edge of your network, right as a packet leaves toward the WAN. The device rewrites the private source IP (and often the source port) to its public address, records the translation in a state table, and reverses it for the return traffic. Hosts behind NAT never see their public address on the wire.',
    tags: ['NAT', 'Layer 3'],
  },
  {
    id: 'tcp-handshake',
    question: 'Why does TCP need a handshake?',
    answer:
      'The three-way handshake (SYN, SYN-ACK, ACK) lets both ends agree on initial sequence numbers and confirm the other side can both send and receive before any data flows. It establishes shared state that enables ordering, retransmission, and flow control — the guarantees UDP deliberately skips.',
    tags: ['TCP', 'Layer 4'],
  },
  {
    id: 'packet-crosses-router',
    question: 'What happens when a packet crosses a router?',
    answer:
      'The router strips the incoming L2 frame, looks up the destination IP in its routing table to pick a next hop, decrements the TTL (dropping the packet if it hits zero), then builds a brand-new L2 frame with its own source MAC and the next hop\'s destination MAC. The IP addresses stay the same; the MAC addresses change at every hop.',
    tags: ['Routing', 'Layer 3'],
  },
  {
    id: 'firewall-sees',
    question: 'What does a firewall actually see?',
    answer:
      'A stateless firewall sees individual packets: L3/L4 headers like source/destination IP, protocol, and ports. A stateful firewall additionally tracks connections, so it can allow return traffic for flows it already permitted. A next-gen/L7 firewall can inspect application data (SNI, HTTP host) but encryption limits how deep it can look without interception.',
    tags: ['Firewall', 'Security'],
  },
  {
    id: 'broadcast-domain',
    question: 'What is a broadcast domain and where does it end?',
    answer:
      'A broadcast domain is the set of devices that receive each other\'s Layer 2 broadcasts (like ARP). A switch extends a broadcast domain; a VLAN splits one switch into several. A router terminates a broadcast domain — broadcasts do not cross Layer 3, which is exactly why you need ARP on each side but not across the router.',
    tags: ['Layer 2', 'VLAN', 'Routing'],
  },
  {
    id: 'ttl-purpose',
    question: 'What is the IP TTL for, and how is it different from a DNS TTL?',
    answer:
      'The IP header TTL is a hop counter decremented by each router; it prevents packets from looping forever and powers traceroute. A DNS TTL is a time-in-seconds telling resolvers how long they may cache a record. Same name, completely different mechanisms operating at different layers.',
    tags: ['IPv4', 'DNS', 'Routing'],
  },
  {
    id: 'mtu-blackhole',
    question: 'Why do some connections hang instead of failing cleanly?',
    answer:
      'Often a path-MTU black hole: a large packet with the Don\'t-Fragment bit set is too big for some link, and the ICMP "fragmentation needed" message that should signal this gets filtered. The sender keeps retransmitting a packet that can never get through, so the connection stalls rather than erroring. Small packets work, large ones vanish — the classic MTU fingerprint.',
    tags: ['MTU', 'ICMP', 'Layer 3'],
  },
];
