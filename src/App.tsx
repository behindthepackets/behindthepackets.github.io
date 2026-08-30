import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ExperimentPage } from './pages/ExperimentPage';

// Keep focus/scroll sane on route changes to experiment pages.
function useRouteReset() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/experiments')) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
}

export default function App() {
  useRouteReset();
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiments/:slug" element={<ExperimentPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}
