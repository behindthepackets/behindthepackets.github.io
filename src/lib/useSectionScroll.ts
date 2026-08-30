import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// With HashRouter the URL hash is owned by the router, so in-page section jumps
// are done imperatively: navigate home if needed, then scroll to the section.
export function useSectionScroll() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (id: string) => {
      if (pathname !== '/') {
        navigate('/');
        window.setTimeout(() => scrollToId(id), 70);
      } else {
        scrollToId(id);
      }
    },
    [navigate, pathname]
  );
}
