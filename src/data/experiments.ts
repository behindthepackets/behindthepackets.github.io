import type { Experiment } from './types';

// Each experiment follows the lab-notebook template. To add a new day, append a
// new object here and (optionally) mark hasExperiment: true in journey.ts.
export const experiments: Experiment[] = [
  {
    day: 1,
    slug: 'proxmox-first-boot',
    title: 'Proxmox VE: From Bare Metal to First Boot',
    concept: 'Proxmox VE',
    summary:
      'Turning an old desktop into a type-1 hypervisor — installing Proxmox VE, understanding the vmbr0 bridge it builds, and reaching the web console that becomes mission control for the whole lab.',
    status: 'in-progress',
    difficulty: 'core',
    tags: ['Proxmox', 'Virtualization', 'Homelab', 'KVM', 'Linux'],
    date: '2025-01-02',
    sections: [
      {
        title: 'The Question',
        body: `Every homelab tutorial starts with "install Proxmox" and then hand-waves the rest. I wanted to actually understand what happens: what *is* a type-1 hypervisor, what does the installer put on the disk, and — the part I really cared about — how does one physical NIC end up shared by the host and a dozen future VMs? This is Day 1: the bare-metal foundation of the whole lab. I named the node **\`pve0\`** on purpose — a numbered hostname so the environment can grow into \`pve1\`, \`pve2\` and beyond — and documented **everything** it takes to go from a blank machine to a working Proxmox console.`,
      },
      {
        title: 'The Setup',
        body: `- **Hardware:** repurposed desktop — quad-core CPU with VT-x, 32 GB RAM, one 500 GB SSD, one onboard 1 GbE NIC
- **Installer:** Proxmox VE 8.x ISO written to a USB stick
- **Node identity:** hostname \`pve0\` — numbered so I can add \`pve1\`/\`pve2\` later
- **Network plan:** management IP \`192.168.1.10/24\`, gateway \`192.168.1.1\`, DNS \`192.168.1.1\` for now
- **Access:** headless after install — everything via the web UI on port **8006**

Two BIOS things matter before anything else: enable **VT-x/AMD-V** (hardware virtualization) and, if I want to pass through devices later, **VT-d/IOMMU**.`,
      },
      {
        title: 'The Hypothesis',
        body: `I expected Proxmox to install a fairly normal Debian system with the KVM hypervisor and its own web stack on top. My mental model going in:

1. The installer lays down Debian + the PVE kernel and packages.
2. It creates a Linux bridge, \`vmbr0\`, and moves my physical NIC's IP onto it.
3. From then on the host talks to the network *through* that bridge, and every VM will plug into the same bridge like ports on a virtual switch.

If that's right, \`pve0\` and every VM should end up as peers on \`192.168.1.0/24\`, all sharing one physical cable.`,
      },
      {
        title: 'The Experiment',
        body: `**1. Write the installer and boot it.**

\`\`\`bash
# From another machine, write the ISO to USB (macOS/Linux)
sudo dd if=proxmox-ve_8.iso of=/dev/sdX bs=4M status=progress conv=fsync
\`\`\`

**2. Run the graphical installer.** Pick the target SSD (it uses ext4/LVM by default), set country/timezone, a strong **root** password, and an admin email.

**3. Configure the management network** when prompted:

\`\`\`text
Hostname (FQDN):  pve0.lab.local
IP Address (CIDR): 192.168.1.10/24
Gateway:           192.168.1.1
DNS Server:        192.168.1.1
\`\`\`

**4. First boot + update.** After reboot the console prints the management URL. I removed the enterprise repo and enabled the no-subscription repo so updates work without a license:

\`\`\`bash
# Disable the enterprise repo, add the no-subscription one
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" \\
  > /etc/apt/sources.list.d/pve-no-subscription.list
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list
apt update && apt -y dist-upgrade
\`\`\`

**5. Open the console:** \`https://192.168.1.10:8006\` and log in as \`root\` with realm **Linux PAM**.`,
      },
      {
        title: 'The Packets',
        body: `The interesting part is the network config the installer generated in \`/etc/network/interfaces\`:

\`\`\`text
auto lo
iface lo inet loopback

iface enp3s0 inet manual          # the physical NIC — no IP of its own

auto vmbr0
iface vmbr0 inet static           # the bridge holds the host's IP
    address 192.168.1.10/24
    gateway 192.168.1.1
    bridge-ports enp3s0           # physical NIC is enslaved to the bridge
    bridge-stp off
    bridge-fd 0
\`\`\`

So my hypothesis was right: the physical NIC (\`enp3s0\`) has **no IP** — it's just a bridge port. \`vmbr0\` is a software switch, and the *host itself* is one station on it. I confirmed it live:

\`\`\`bash
ip -br addr show
# enp3s0   UP   (no address)
# vmbr0    UP   192.168.1.10/24

bridge link show                 # enp3s0 is a member of vmbr0
\`\`\`

A capture on \`vmbr0\` during a \`ping 192.168.1.1\` showed the ARP-then-ICMP exchange leaving through the bridge and out the single physical port — exactly like a real switch uplink.`,
      },
      {
        title: 'The Result',
        body: `Bare metal to hypervisor in about 20 minutes. The web console came up on :8006, \`pve0\` sat at \`192.168.1.10\`, and \`vmbr0\` was ready to accept virtual machines. Crucially, I now understood that adding a VM later just means giving it a virtual NIC plugged into \`vmbr0\` — it becomes another peer on \`192.168.1.0/24\` with no extra cabling. This one node is the base of the whole stack to come: **Hardware → Proxmox (\`pve0\`) → virtual networking → VMs/LXC → Docker → containers → apps → NAS → network**.`,
      },
      {
        title: 'What Broke',
        body: `Two things bit me:

1. **No VT-x.** My first VM creation failed with \`KVM virtualisation configured, but not available\`. Hardware virtualization was disabled in BIOS. Enabling **Intel VT-x** fixed it — Proxmox will fall back to slow emulation otherwise.
2. **Web UI unreachable at first.** I mistyped the CIDR as \`192.168.1.10/32\`, so the host had no route to its own subnet. \`ip route\` showed no LAN route. Fixing the mask to \`/24\` in \`/etc/network/interfaces\` and running \`ifreload -a\` brought the console straight back.`,
      },
      {
        title: 'What I Learned',
        body: `- Proxmox VE is **Debian + KVM/QEMU + LXC** with a management layer — not a mysterious appliance. Everything is inspectable from a normal shell.
- \`vmbr0\` is a **Linux bridge acting as a virtual switch**. The physical NIC becomes a port with no IP; the host and every VM are stations on that switch.
- The management interface lives on **TCP 8006** (HTTPS).
- Enable **VT-x/AMD-V** in BIOS *before* you start, and double-check your CIDR mask — a wrong prefix silently removes your own LAN route.`,
      },
      {
        title: 'Try It Yourself',
        body: `\`\`\`bash
# Verify hardware virtualization is available on the host
egrep -c '(vmx|svm)' /proc/cpuinfo     # >0 means VT-x/AMD-V is on

# Inspect the bridge Proxmox built
ip -br addr show
bridge link show
cat /etc/network/interfaces

# Watch traffic leave through the bridge
sudo tcpdump -i vmbr0 -n arp or icmp
\`\`\`

Reload networking without a reboot after editing the interfaces file:

\`\`\`bash
ifreload -a
\`\`\``,
      },
    ],
  },
  {
    day: 9,
    slug: 'adguard-dns-sinkhole',
    title: 'AdGuard Home: Running My Own DNS Sinkhole',
    concept: 'AdGuard Home',
    summary:
      'Standing up AdGuard Home in Docker, pointing the whole network at it, and watching an ad domain get answered with 0.0.0.0 while a real domain resolves normally — DNS as a control point.',
    status: 'planned',
    difficulty: 'core',
    tags: ['DNS', 'AdGuard', 'Docker', 'Security', 'Wireshark'],
    date: '2025-01-11',
    sections: [
      {
        title: 'The Question',
        body: `Once I had a Docker host, the first *networking* service I wanted was my own DNS. If every device asks my server for names, I control resolution for the whole house — I can block ad/tracker domains at the source and actually *see* what everything is querying. But what does "blocking a domain" look like on the wire? Is it a dropped packet, or a lie told confidently?`,
      },
      {
        title: 'The Setup',
        body: `- **Host:** Docker VM on \`pve0\`, \`192.168.1.20\`
- **Service:** AdGuard Home in a container, publishing **53/udp + 53/tcp** (DNS) and **3000/tcp** (admin)
- **Upstream:** \`1.1.1.1\` and \`9.9.9.9\`
- **Rollout:** set the DHCP server's DNS option to \`192.168.1.20\` so every client uses it

\`\`\`yaml
# docker-compose.yml
services:
  adguardhome:
    image: adguard/adguardhome
    container_name: adguardhome
    ports:
      - "53:53/udp"
      - "53:53/tcp"
      - "3000:3000/tcp"
    volumes:
      - ./work:/opt/adguardhome/work
      - ./conf:/opt/adguardhome/conf
    restart: unless-stopped
\`\`\``,
      },
      {
        title: 'The Hypothesis',
        body: `I expected a blocked domain and an allowed domain to look completely different at the DNS layer:

- **Allowed** (\`example.com\`): AdGuard forwards upstream, caches, and returns the real A record.
- **Blocked** (some tracker): AdGuard answers *itself* — either \`0.0.0.0\`/\`NXDOMAIN\` — without ever forwarding upstream. The block should be a fabricated answer, not a timeout.`,
      },
      {
        title: 'The Experiment',
        body: `After the setup wizard on :3000, I enabled the standard blocklists, then queried AdGuard directly and captured port 53:

\`\`\`bash
# Watch DNS to/from the AdGuard host
sudo tcpdump -i eth0 -n port 53 &

# A normal domain
dig @192.168.1.20 example.com

# A domain on the blocklist
dig @192.168.1.20 doubleclick.net
\`\`\``,
      },
      {
        title: 'The Packets',
        body: `The allowed lookup returned a real address and I could see the upstream query happen once, then get cached:

\`\`\`text
;; ANSWER SECTION:
example.com.   3600  IN  A  93.184.216.34
;; Query time: 21 msec
\`\`\`

The blocked lookup came back **instantly** with a sinkhole answer and *no* upstream traffic on the capture:

\`\`\`text
;; ANSWER SECTION:
doubleclick.net.  10  IN  A  0.0.0.0
;; Query time: 0 msec
\`\`\`

That's the whole trick: AdGuard forged an authoritative-looking answer pointing the client at \`0.0.0.0\`, so the connection never even starts. The AdGuard query log showed the request marked **Blocked by filter** with the matching list.`,
      },
      {
        title: 'The Result',
        body: `Every client that took the new DHCP DNS option started resolving through AdGuard. The dashboard lit up with real query volume, ad/tracker domains were sinkholed to \`0.0.0.0\`, and legitimate domains resolved with normal TTLs. I had turned DNS into a visible, controllable choke point for the entire network.`,
      },
      {
        title: 'What Broke',
        body: `AdGuard wouldn't start — the container kept crashing on bind:

\`\`\`text
listen udp 0.0.0.0:53: bind: address already in use
\`\`\`

The Ubuntu VM was running \`systemd-resolved\`, which already holds port 53 on \`127.0.0.53\`. AdGuard couldn't claim \`:53\`. I disabled the stub listener and freed the port:

\`\`\`bash
sudo sed -i 's/#DNSStubListener=yes/DNSStubListener=no/' /etc/systemd/resolved.conf
sudo systemctl restart systemd-resolved
sudo ss -ulpn 'sport = :53'   # confirm nothing else holds 53
\`\`\`

After that the container bound cleanly.`,
      },
      {
        title: 'What I Learned',
        body: `- **Blocking is a lie, not a drop.** A sinkholed domain gets a fabricated \`0.0.0.0\`/NXDOMAIN answer so the client never connects — much faster and cleaner than dropping packets.
- Running your own resolver makes the network **observable**: you can see exactly what every device asks for.
- **Port 53 conflicts** with \`systemd-resolved\` are the classic first failure. Free the port before bind.
- DNS is a genuine **control plane** — whoever answers :53 shapes where traffic can even begin to go.`,
      },
      {
        title: 'Try It Yourself',
        body: `\`\`\`bash
# Compare a blocked vs allowed domain against your resolver
dig @<adguard-ip> example.com
dig @<adguard-ip> doubleclick.net      # expect 0.0.0.0 / NXDOMAIN

# Prove nothing else is squatting on port 53
sudo ss -ulpn 'sport = :53'

# Point one client at it and watch the query log fill up
\`\`\``,
      },
    ],
  },
  {
    day: 10,
    slug: 'nginx-proxy-manager',
    title: 'Nginx Proxy Manager: One IP, Many Services',
    concept: 'Nginx Proxy Manager',
    summary:
      'Putting a reverse proxy in front of the homelab so a single IP serves every service by hostname — and capturing the HTTP Host header that decides which backend a request reaches.',
    status: 'planned',
    difficulty: 'core',
    tags: ['Reverse Proxy', 'Nginx', 'Layer 7', 'HTTP', 'TLS'],
    date: '2025-01-12',
    sections: [
      {
        title: 'The Question',
        body: `My services were sprawling across \`host:port\` combinations — Portainer on :9000, Uptime Kuma on :3001, AdGuard on :3000. Ugly and unmemorable. A reverse proxy promises one entry point that routes by *name* instead of port. But how does a single IP on port 443 know whether I want Portainer or Uptime Kuma? What in the request actually makes that decision?`,
      },
      {
        title: 'The Setup',
        body: `- **Proxy:** Nginx Proxy Manager (NPM) in Docker, \`192.168.1.30\`, publishing **80**, **443**, and **81** (admin UI)
- **Backends:** \`portainer:9000\`, \`uptime-kuma:3001\`, \`adguard:3000\`
- **Names:** wildcard local DNS in AdGuard so \`*.lab.local\` → \`192.168.1.30\`
- **Proxy hosts in NPM:**
  - \`portainer.lab.local\`  → \`192.168.1.20:9000\`
  - \`status.lab.local\`     → \`192.168.1.20:3001\``,
      },
      {
        title: 'The Hypothesis',
        body: `The proxy can't be deciding by IP or port — every request arrives at the same \`192.168.1.30:443\`. My bet was that it routes on the **HTTP \`Host\` header** (and TLS SNI for the encrypted case). Same socket, different \`Host:\` value, different backend. The client should never know a proxy was involved.`,
      },
      {
        title: 'The Experiment',
        body: `I created the two proxy hosts in NPM, then sent requests that differ *only* by hostname to the same proxy IP:

\`\`\`bash
# Same IP, same port — only the Host header changes
curl -H 'Host: portainer.lab.local' http://192.168.1.30/
curl -H 'Host: status.lab.local'    http://192.168.1.30/

# Capture the plaintext HTTP request to see what the proxy keys on
sudo tcpdump -i eth0 -A -n 'tcp port 80 and host 192.168.1.30'
\`\`\``,
      },
      {
        title: 'The Packets',
        body: `Both requests hit the identical destination \`192.168.1.30:80\`, and the only thing distinguishing them on the wire was one header line:

\`\`\`text
GET / HTTP/1.1
Host: portainer.lab.local        <-- routes to 192.168.1.20:9000
User-Agent: curl/8.4.0
\`\`\`

\`\`\`text
GET / HTTP/1.1
Host: status.lab.local           <-- routes to 192.168.1.20:3001
User-Agent: curl/8.4.0
\`\`\`

NPM matched the \`Host\` value against its proxy-host list and forwarded to the mapped backend, adding the usual \`X-Forwarded-For\`/\`X-Forwarded-Host\` headers so the backend still sees the original client. For HTTPS the same decision happens earlier, in the **TLS SNI** field of the ClientHello — visible even before the HTTP layer.`,
      },
      {
        title: 'The Result',
        body: `One IP now fronts the entire lab. \`https://portainer.lab.local\` and \`https://status.lab.local\` both resolve to \`192.168.1.30\`, and the proxy silently fans them out to the right container. Ports disappeared from my life, and NPM handled certificates so everything spoke HTTPS.`,
      },
      {
        title: 'What Broke',
        body: `Every proxied site threw **502 Bad Gateway**. The proxy was reachable but couldn't reach the backends. The cause: NPM was in its own Docker network and I'd used \`localhost\` as the forward host — inside a container \`localhost\` is the *container itself*, not the Docker host.

\`\`\`text
[error] connect() failed (111: Connection refused) while connecting to upstream
\`\`\`

I changed the forward hosts from \`localhost\` to the actual host IP \`192.168.1.20\` (and put the containers on a shared network), and the 502s turned into clean 200s.`,
      },
      {
        title: 'What I Learned',
        body: `- A reverse proxy routes on **Layer 7 identity** — the HTTP \`Host\` header (and **TLS SNI** for HTTPS) — not IP or port. Same socket, many sites.
- The backend sees the proxy as the client unless you forward \`X-Forwarded-For\` — which NPM does by default.
- \`localhost\` **inside a container** means the container, not the host. Cross-container references need a real IP or a shared Docker network + service name.
- Terminating TLS at the proxy centralises certificates: services behind it can stay plain HTTP on the trusted segment.`,
      },
      {
        title: 'Try It Yourself',
        body: `\`\`\`bash
# Prove routing is by Host header, not IP/port
curl -H 'Host: portainer.lab.local' http://<proxy-ip>/ -I
curl -H 'Host: status.lab.local'    http://<proxy-ip>/ -I

# See the Host header / SNI the proxy keys on
sudo tcpdump -i eth0 -A -n 'tcp port 80 and host <proxy-ip>'

# For HTTPS, watch the SNI in the TLS ClientHello
sudo tcpdump -i eth0 -n 'tcp port 443' -vvv | grep -i server_name
\`\`\``,
      },
    ],
  },
  {
    day: 12,
    slug: 'arp-who-has',
    title: 'ARP: Who Has 192.168.10.1? Tell Everyone.',
    concept: 'ARP',
    summary:
      'Watching a machine shout across the broadcast domain to find the MAC address behind an IP — and what happens when two hosts claim the same address.',
    status: 'planned',
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
    day: 14,
    slug: 'vlan-tag-on-the-wire',
    title: 'VLANs: Finding the 802.1Q Tag on the Wire',
    concept: 'VLANs',
    summary:
      'One physical switch, two networks that cannot see each other — until I capture the trunk and watch the 4-byte tag that keeps them apart.',
    status: 'planned',
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
    day: 20,
    slug: 'dns-what-happens-when-i-type',
    title: 'DNS: What Actually Happens When I Type google.com',
    concept: 'DNS',
    summary:
      'Following a single name resolution from the stub resolver, through my local Pi-hole, out to the recursive path — and watching the cache change the story on the second try.',
    status: 'planned',
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
