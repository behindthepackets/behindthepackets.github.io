import type { LabNode } from './types';

// The home lab as an evolving topology. Replace the SVG diagram in
// NetworkDiagram or drop a real topology image into /public and swap it in.
export const labNodes: LabNode[] = [
  {
    id: 'wan',
    label: 'Internet / WAN',
    kind: 'wan',
    detail: 'Upstream ISP handoff. Everything private hides behind one public IP.',
    meta: ['Public IPv4 + IPv6/PD', 'PPPoE / DHCP-WAN'],
  },
  {
    id: 'router',
    label: 'Edge Router',
    kind: 'router',
    detail: 'Routing, NAT, and DHCP for the home LAN — the edge between inside and out.',
    meta: ['NAT44 + NPTv6', 'DHCP + reservations', 'Static + policy routes'],
  },
  {
    id: 'firewall',
    label: 'Firewall',
    kind: 'firewall',
    detail: 'Stateful rules between zones. Default-deny between segments.',
    meta: ['Stateful inspection', 'Zone-based policy', 'Logging + flows'],
  },
  {
    id: 'switch',
    label: 'Core Switch',
    kind: 'switch',
    detail: 'Managed L2 switch linking the wired lab together.',
    meta: ['Gigabit switching', 'STP enabled', 'Port mirroring for captures'],
  },
  {
    id: 'ap',
    label: 'Wi-Fi AP',
    kind: 'ap',
    detail: 'Wi-Fi for laptops, phones, and IoT clients.',
    meta: ['WPA3', '802.11ax', 'Guest + main SSIDs'],
  },
  {
    id: 'server',
    label: 'pve0 · Proxmox Node',
    kind: 'server',
    detail: 'The bare-metal foundation. Proxmox VE hosting VMs, LXC, and a Docker stack.',
    meta: ['192.168.1.10 · pve0', 'Proxmox VE + Docker', 'Uptime Kuma · Portainer · AdGuard · NPM'],
  },
  {
    id: 'nas',
    label: 'NAS · Storage',
    kind: 'server',
    detail: 'The storage layer wiring network storage to Proxmox, VMs, containers, and Docker.',
    meta: ['NFS / SMB shares', 'Proxmox backup target', 'Bulk + VM disk storage'],
  },
  {
    id: 'clients',
    label: 'Clients',
    kind: 'client',
    detail: 'Laptops, phones, and workstations on the LAN.',
    meta: ['192.168.1.0/24', 'DHCP + static'],
  },
  {
    id: 'vms',
    label: 'Virtual Machines',
    kind: 'vm',
    detail: 'Throwaway routers and hosts for OSPF/BGP and namespace labs.',
    meta: ['GNS3 / containerlab', 'Snapshot + revert'],
  },
  {
    id: 'containers',
    label: 'Containers',
    kind: 'container',
    detail: 'veth pairs and bridges for container-networking experiments.',
    meta: ['Docker bridge', 'Custom netns'],
  },
];
