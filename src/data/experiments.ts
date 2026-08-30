import type { Experiment } from './types';

// Each experiment follows the lab-notebook template. To add a new day, append a
// new object here and (optionally) mark hasExperiment: true in journey.ts.
export const experiments: Experiment[] = [
  {
    day: 1,
    slug: 'arp-who-has',
    title: 'ARP: Who Has 192.168.10.1? Tell Everyone.',
    concept: 'ARP',
    summary:
      'Watching a machine shout across the broadcast domain to find the MAC address behind an IP — and what happens when two hosts claim the same address.',
    status: 'complete',
    difficulty: 'core',
    tags: ['ARP', 'Layer 2', 'Ethernet', 'Wireshark'],
    date: '2025-01-06',
    sections: [
      {
        title: 'The Question',
        body: `IP addresses are how we *think* about the network, but a switch only understands MAC addresses. So when my laptop wants to talk to the router at \`192.168.10.1\`, how does it actually learn the router's MAC address?

I wanted to *see* that translation happen on the wire, not just read about it.`,
      },
      {
        title: 'The Setup',
        body: `- **Client:** Linux laptop, \`192.168.10.50\`, interface \`eth0\`
- **Gateway:** UDM-style router, \`192.168.10.1\`
- **Switch:** managed L2 switch, all ports in VLAN 10
- **Tooling:** \`arp\`, \`ip neigh\`, \`tcpdump\`, Wireshark

Everything lives in a single \`/24\` broadcast domain so ARP has somewhere to broadcast.`,
      },
      {
        title: 'The Hypothesis',
        body: `Before sending the first IP packet, the client has no idea what MAC address sits behind \`192.168.10.1\`. I expected:

1. A broadcast ARP **request** ("who has 192.168.10.1?") sent to \`ff:ff:ff:ff:ff:ff\`.
2. A unicast ARP **reply** from the router with its MAC.
3. The mapping cached so it never has to ask again (until the entry ages out).`,
      },
      {
        title: 'The Experiment',
        body: `First I flushed the neighbour cache so I'd be starting clean:

\`\`\`bash
# Wipe the ARP/neighbour cache for eth0
sudo ip neigh flush dev eth0
ip neigh show        # should be empty for the gateway
\`\`\`

Then I started a capture filtered to ARP and pinged the gateway once:

\`\`\`bash
sudo tcpdump -i eth0 -n arp &
ping -c 1 192.168.10.1
\`\`\``,
      },
      {
        title: 'The Packets',
        body: `The capture showed exactly the two-frame exchange I expected:

\`\`\`text
ARP, Request who-has 192.168.10.1 tell 192.168.10.50, length 28
ARP, Reply 192.168.10.1 is-at f4:92:bf:aa:11:02, length 46
\`\`\`

The request went to the broadcast MAC \`ff:ff:ff:ff:ff:ff\` — every device in VLAN 10 saw it. Only the gateway answered, and it answered **unicast** straight back to my laptop's MAC. The whole thing took under a millisecond.`,
      },
      {
        title: 'The Result',
        body: `The neighbour cache went from empty to a resolved entry immediately after the reply:

\`\`\`bash
ip neigh show
# 192.168.10.1 dev eth0 lladdr f4:92:bf:aa:11:02 REACHABLE
\`\`\`

Every subsequent ping skipped ARP entirely — the mapping was cached and the ICMP frames went straight to the router's MAC.`,
      },
      {
        title: 'What Broke',
        body: `To test conflict handling I temporarily configured a Raspberry Pi with the **same** IP as the gateway, \`192.168.10.1\`. Suddenly my laptop's ARP entry for the gateway started flapping between two different MAC addresses.

\`\`\`text
ARP, Reply 192.168.10.1 is-at f4:92:bf:aa:11:02   # real router
ARP, Reply 192.168.10.1 is-at b8:27:eb:9c:44:07   # the Pi, oops
\`\`\`

The kernel even logged it: \`arp: ... moved from f4:92:bf:aa:11:02 to b8:27:eb:9c:44:07\`. Connectivity to the gateway became intermittent because traffic was racing to whichever MAC last won the cache. This is precisely the mechanism behind ARP spoofing / poisoning — nothing authenticates an ARP reply.`,
      },
      {
        title: 'What I Learned',
        body: `- ARP is **trust-by-default**. Any host can claim any IP, and the last reply wins.
- The request is a broadcast; the reply is a unicast.
- A resolved entry is cached as \`REACHABLE\` and only re-validated when it ages out or traffic stops confirming it.
- Duplicate-IP problems show up first as a *flapping MAC*, not as a clean error message.`,
      },
      {
        title: 'Try It Yourself',
        body: `\`\`\`bash
# Watch ARP resolution live
sudo ip neigh flush dev eth0
sudo tcpdump -i eth0 -n arp &
ping -c 1 <your-gateway-ip>
ip neigh show

# See the full table
ip -s neigh show
\`\`\`

Try running \`arping <gateway-ip>\` from two hosts with the same address and watch the cache flap in real time.`,
      },
    ],
  },
  {
    day: 3,
    slug: 'vlan-tag-on-the-wire',
    title: 'VLANs: Finding the 802.1Q Tag on the Wire',
    concept: 'VLANs',
    summary:
      'One physical switch, two networks that cannot see each other — until I capture the trunk and watch the 4-byte tag that keeps them apart.',
    status: 'complete',
    difficulty: 'core',
    tags: ['VLAN', '802.1Q', 'Trunk', 'Layer 2', 'Isolation'],
    date: '2025-01-09',
    sections: [
      {
        title: 'The Question',
        body: `I have one managed switch but I want my IoT gear on a separate network from my trusted devices. VLANs promise exactly that — multiple isolated L2 domains on shared hardware. But what actually *makes* them isolated? Where does the separation physically live?`,
      },
      {
        title: 'The Setup',
        body: `- **VLAN 10 — trusted:** \`192.168.10.0/24\`
- **VLAN 20 — iot:** \`192.168.20.0/24\`
- **Switch:** access ports for each device, one **trunk** port to the router carrying both VLANs tagged.
- **Router-on-a-stick:** a single physical link to the router with two tagged sub-interfaces.
- **Tooling:** \`tcpdump\`, a mirror/SPAN port for capturing the trunk.`,
      },
      {
        title: 'The Hypothesis',
        body: `On an **access port**, frames are plain untagged Ethernet — the device has no idea a VLAN exists. On the **trunk**, frames must carry an 802.1Q tag so the router can tell VLAN 10 traffic from VLAN 20 traffic. Two devices in different VLANs should not be able to reach each other at Layer 2 at all, even if they share the same switch.`,
      },
      {
        title: 'The Experiment',
        body: `I mirrored the trunk port to a capture laptop and generated traffic from a device in each VLAN:

\`\`\`bash
# On the capture host watching the mirrored trunk
sudo tcpdump -i eth0 -e -n vlan

# From the trusted host (VLAN 10)
ping -c 1 192.168.10.1

# From the IoT host (VLAN 20)
ping -c 1 192.168.20.1
\`\`\`

Then I tried to ping directly across VLANs with no inter-VLAN routing rule permitting it.`,
      },
      {
        title: 'The Packets',
        body: `On the trunk, the tag was right there in the Ethernet header:

\`\`\`text
... 802.1Q, vlan 10, p 0, ethertype IPv4, 192.168.10.50 > 192.168.10.1: ICMP echo request
... 802.1Q, vlan 20, p 0, ethertype IPv4, 192.168.20.31 > 192.168.20.1: ICMP echo request
\`\`\`

Same physical wire, same switch, but each frame is stamped with its VLAN ID. The ethertype \`0x8100\` marks the frame as 802.1Q-tagged, and the 12-bit VLAN ID field carries the 10 or 20. On the **access** ports, the very same pings appeared with **no tag at all**.`,
      },
      {
        title: 'The Result',
        body: `Intra-VLAN pings worked perfectly. The cross-VLAN ping (VLAN 10 host → VLAN 20 host) got nothing back — the switch never forwards a frame out of a port in a different VLAN, and the router wasn't configured to route between them. Isolation confirmed, and I could point at the exact byte that enforced it.`,
      },
      {
        title: 'What Broke',
        body: `My first attempt captured **nothing** with VLAN tags — every frame looked untagged. The problem: the mirror was configured on an *access* port, not the trunk, so the switch had already stripped the tag before the frame reached my capture. I also learned some NICs strip the tag in hardware before \`tcpdump\` sees it; I had to disable VLAN offload:

\`\`\`bash
sudo ethtool -K eth0 rxvlan off
\`\`\`

After mirroring the actual trunk and disabling offload, the tags appeared.`,
      },
      {
        title: 'What I Learned',
        body: `- A VLAN is enforced by a **4-byte tag** (TPID \`0x8100\` + VLAN ID) that only exists on trunk links.
- Access ports are untagged; the device never knows its VLAN.
- Isolation is a *switch forwarding rule*, not encryption — inter-VLAN traffic only flows if a router/L3 device deliberately bridges them.
- NIC VLAN offload can hide tags from your capture. If tags are missing, suspect the capture point or offload before doubting the config.`,
      },
      {
        title: 'Try It Yourself',
        body: `\`\`\`bash
# Create a tagged sub-interface for VLAN 20 on Linux
sudo ip link add link eth0 name eth0.20 type vlan id 20
sudo ip addr add 192.168.20.2/24 dev eth0.20
sudo ip link set eth0.20 up

# Capture only tagged frames
sudo tcpdump -i eth0 -e -n vlan
\`\`\``,
      },
    ],
  },
  {
    day: 7,
    slug: 'dns-what-happens-when-i-type',
    title: 'DNS: What Actually Happens When I Type google.com',
    concept: 'DNS',
    summary:
      'Following a single name resolution from the stub resolver, through my local Pi-hole, out to the recursive path — and watching the cache change the story on the second try.',
    status: 'complete',
    difficulty: 'core',
    tags: ['DNS', 'Resolution', 'Caching', 'UDP', 'Wireshark'],
    date: '2025-01-13',
    sections: [
      {
        title: 'The Question',
        body: `"Just type the domain and it works" hides an enormous amount of machinery. I wanted to trace one real lookup — \`google.com\` — and see every query and response, then watch how caching completely changes what goes on the wire the second time.`,
      },
      {
        title: 'The Setup',
        body: `- **Client:** laptop using my local resolver at \`192.168.10.2\`
- **Resolver:** Pi-hole (dnsmasq) forwarding to an upstream recursive resolver
- **Tooling:** \`dig\`, \`tcpdump\`, and the Pi-hole query log

DNS mostly rides UDP/53, so captures are small and easy to read.`,
      },
      {
        title: 'The Hypothesis',
        body: `On a cold cache I expected my laptop to send one query to the local resolver, the resolver to do the recursive work upstream, and an answer to come back with a TTL. On a warm cache, the answer should come straight from the local resolver with a **decreasing TTL** and no upstream traffic at all.`,
      },
      {
        title: 'The Experiment',
        body: `\`\`\`bash
# Watch DNS to/from the local resolver
sudo tcpdump -i eth0 -n port 53 &

# Cold lookup
dig google.com

# Immediately repeat it
dig google.com
\`\`\`

I compared the \`Query time\` reported by \`dig\` and the TTL on each response.`,
      },
      {
        title: 'The Packets',
        body: `The exchange with my resolver was a clean request/response pair:

\`\`\`text
192.168.10.50.51423 > 192.168.10.2.53: A? google.com. (28)
192.168.10.2.53 > 192.168.10.50.51423: A google.com. 142.250.72.14 (44)
\`\`\`

First \`dig\` reported \`Query time: 24 msec\` with a TTL of \`242\`. The second \`dig\`, moments later, reported \`Query time: 0 msec\` and the TTL had dropped to \`188\` — proof it came from cache, counting down the remaining life of the record.`,
      },
      {
        title: 'The Result',
        body: `Cold: ~24 ms and upstream recursion visible in the Pi-hole log. Warm: 0 ms, served locally, no upstream query at all. The only visible difference on the wire was that the second answer never left my LAN — the TTL is literally the resolver telling me "you may reuse this for N more seconds."`,
      },
      {
        title: 'What Broke',
        body: `Halfway through I "fixed" something on the Pi-hole and every lookup started timing out:

\`\`\`text
;; connection timed out; no servers could be reached
\`\`\`

I'd pointed the client at the resolver but the resolver's own upstream was misconfigured, so it accepted queries and silently failed to recurse. \`dig @8.8.8.8 google.com\` worked instantly, which told me the client and network were fine and the fault was the resolver's upstream. Classic: the thing that answers isn't always the thing that resolves.`,
      },
      {
        title: 'What I Learned',
        body: `- The client only ever talks to its **stub → local resolver**; recursion happens behind the resolver.
- **TTL is the cache clock.** A counting-down TTL is the fingerprint of a cached answer.
- \`dig @<server>\` is the fastest way to bisect *where* resolution breaks (client vs resolver vs upstream).
- A resolver can be reachable and still be broken — reachability and resolution are different failures.`,
      },
      {
        title: 'Try It Yourself',
        body: `\`\`\`bash
# Full recursion path, one hop at a time
dig +trace google.com

# Ask a specific resolver directly (bypass local cache)
dig @1.1.1.1 google.com

# Watch the TTL count down on repeat lookups
dig google.com | grep -A1 "ANSWER SECTION"
\`\`\``,
      },
    ],
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}
