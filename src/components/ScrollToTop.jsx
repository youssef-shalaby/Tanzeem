import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.querySelector('main')?.scrollTo(0, 0);
  }, [pathname]);

  return null;
}