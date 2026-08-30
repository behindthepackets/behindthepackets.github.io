import { Hero } from '../components/Hero';
import { SectionHeader } from '../components/SectionHeader';
import { Timeline } from '../components/Timeline';
import { LabSection } from '../components/LabSection';
import { BreaksSection } from '../components/BreaksSection';
import { NotesSection } from '../components/NotesSection';
import { PacketAnimation } from '../components/PacketAnimation';
import { ExperimentCard } from '../components/ExperimentCard';
import { journey } from '../data/journey';
import { siteConfig } from '../data/config';

export function Home() {
  const featured = journey.filter((j) => j.hasExperiment);

  return (
    <main>
      <Hero />

      {/* ABOUT THE LAB */}
      <section className="section section--tight" id="about">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">// about the lab</span>
            <h2 className="section-title" style={{ maxWidth: '18ch' }}>
              This is a real network, not a slide deck.
            </h2>
            <p className="section-lede">
              It started with a single Proxmox box. I began exploring
              virtualization — VMs and Linux containers — then moved to Docker,
              running Uptime Kuma, Portainer, AdGuard, and Nginx Proxy Manager, and
              gradually wired everything into a complete home infrastructure. Along
              the way I went deeper into routing, VLANs, firewalls, DNS, reverse
              proxies, backups, and network segmentation. What began as a simple
              Proxmox setup became a full homelab — and a hands-on journey to
              understand what really happens behind the packets.
            </p>
          </div>
        </div>
      </section>

      {/* THE JOURNEY */}
      <section className="section" id="journey">
        <div className="container">
          <SectionHeader
            eyebrow="// the journey"
            title={siteConfig.seriesTitle}
            lede="One core networking concept explored deeply each day. Filter by topic, and open the ones with a full write-up."
          />
          <Timeline />
        </div>
      </section>

      {/* NETWORK LAB */}
      <section className="section" id="lab">
        <div className="container">
          <SectionHeader
            eyebrow="// network lab"
            title="The lab as an evolving topology"
            lede="WAN to firewall to router to switch, then out to VLANs, servers, VMs and containers. Hover a device to trace how it connects."
          />
          <LabSection />
        </div>
      </section>

      {/* EXPERIMENTS */}
      <section className="section" id="experiments">
        <div className="container">
          <SectionHeader
            eyebrow="// experiments"
            title="Full write-ups"
            lede="Each experiment follows the same lab-notebook structure: the question, setup, hypothesis, what I did, the packets, the result, what broke, and what I learned."
          />
          <div className="journey-grid">
            {featured.map((entry) => (
              <ExperimentCard key={entry.day} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      {/* PACKET VIEW */}
      <section className="section" id="packets">
        <div className="container">
          <SectionHeader
            eyebrow="// packet view"
            title="Client → Switch → Router → Firewall → Internet"
            lede="Every experiment eventually comes down to this: a packet leaving a host and crossing each device on its way out — and the reply finding its way back."
          />
          <PacketAnimation />
        </div>
      </section>

      {/* THINGS I BROKE */}
      <section className="section" id="broke">
        <div className="container">
          <SectionHeader
            eyebrow="// things i broke"
            title="Failures, honestly documented"
            lede="The best learning came from the outages. Here is what went wrong, why, and the lesson that stuck."
          />
          <BreaksSection />
        </div>
      </section>

      {/* NOTES */}
      <section className="section" id="notes">
        <div className="container">
          <SectionHeader
            eyebrow="// knowledge base"
            title="Short notes, searchable"
            lede="Quick answers to the questions I kept re-asking myself while building the lab."
          />
          <NotesSection />
        </div>
      </section>
    </main>
  );
}
