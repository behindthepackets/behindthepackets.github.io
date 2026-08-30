import { Link } from 'react-router-dom';
import { siteConfig } from '../data/config';
import { journey } from '../data/journey';
import { PacketHeroViz } from './PacketHeroViz';
import { useSectionScroll } from '../lib/useSectionScroll';

export function Hero() {
  const complete = journey.filter((j) => j.status === 'complete').length;
  const experiments = journey.filter((j) => j.hasExperiment).length;
  const goTo = useSectionScroll();

  return (
    <header className="hero">
      <div className="container hero__grid">
        <div>
          <span className="hero__status">
            <span className="live" />
            lab online · {siteConfig.seriesTitle}
          </span>

          <h1 className="hero__title">
            One Packet
            <br />
            at a <span className="accent">Time.</span>
          </h1>

          <p className="hero__sub">{siteConfig.subheading}</p>

          <p className="hero__philosophy">{siteConfig.philosophy}</p>

          <div className="hero__cta">
            <button type="button" onClick={() => goTo('lab')} className="btn btn--primary">
              Explore the Lab →
            </button>
            <Link to="/experiments/proxmox-first-boot" className="btn btn--ghost">
              Start the Journey
            </Link>
          </div>

          <div className="hero__stats">
            <div>
              <div className="stat__num">{siteConfig.totalDays}</div>
              <div className="stat__label">days planned</div>
            </div>
            <div>
              <div className="stat__num">{complete}</div>
              <div className="stat__label">concepts logged</div>
            </div>
            <div>
              <div className="stat__num">{experiments}</div>
              <div className="stat__label">full experiments</div>
            </div>
          </div>
        </div>

        <div className="hero__viz-wrap">
          <PacketHeroViz />
        </div>
      </div>
    </header>
  );
}
