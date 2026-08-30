import { siteConfig } from '../data/config';
import { useSectionScroll } from '../lib/useSectionScroll';

export function Footer() {
  const goTo = useSectionScroll();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col">
          <div className="brand" style={{ marginBottom: '0.8rem' }}>
            <span>
              <span className="brand__prompt">~/</span>
              {siteConfig.handle}
            </span>
          </div>
          <p className="footer__mono">
            {siteConfig.philosophy}
            <br />A home networking laboratory documented one experiment at a time.
          </p>
        </div>

        <div className="footer__links">
          <button type="button" onClick={() => goTo('journey')}>the journey</button>
          <button type="button" onClick={() => goTo('lab')}>network lab</button>
          <button type="button" onClick={() => goTo('experiments')}>experiments</button>
          <button type="button" onClick={() => goTo('broke')}>things i broke</button>
          <button type="button" onClick={() => goTo('notes')}>knowledge base</button>
          <a href={siteConfig.githubUrl} target="_blank" rel="noreferrer">
            source ↗
          </a>
        </div>

        <div className="footer__mono">
          <span className="footer__prompt">$</span> uptime
          <br />
          lab up · {siteConfig.totalDays}-day series
          <br />
          <span className="footer__prompt">$</span> whoami
          <br />
          network engineer, still learning
        </div>
      </div>
    </footer>
  );
}
