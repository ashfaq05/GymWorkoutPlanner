import { useEffect } from 'react';

/**
 * Ensures the Android status bar and navigation bar safe areas are respected.
 * Handles both native CSS env(safe-area-inset-top) and fallback calculations
 * for Android standalone mode, PWAs, WebAPKs, and Capacitor apps.
 */
export function useAndroidSafeArea() {
  useEffect(() => {
    function updateSafeAreas() {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      const isAndroid = /Android/i.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true ||
        Boolean((window as any).Capacitor);

      // Measure computed env(safe-area-inset-top)
      const probe = document.createElement('div');
      probe.style.position = 'fixed';
      probe.style.top = '0';
      probe.style.left = '0';
      probe.style.width = '1px';
      probe.style.height = '1px';
      probe.style.paddingTop = 'env(safe-area-inset-top, 0px)';
      probe.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
      probe.style.visibility = 'hidden';
      probe.style.pointerEvents = 'none';
      document.body.appendChild(probe);

      const computed = window.getComputedStyle(probe);
      const computedSat = parseFloat(computed.paddingTop) || 0;
      const computedSab = parseFloat(computed.paddingBottom) || 0;
      document.body.removeChild(probe);

      let statusBarFallback = 0;
      let navBarFallback = 0;

      // If env(safe-area-inset-top) didn't return a value (> 0), but we are in standalone / installed mode on mobile/Android
      if (computedSat <= 0) {
        if (isStandalone || isAndroid) {
          // Check screen.availTop if available
          const availTop = window.screen && (window.screen as any).availTop;
          if (availTop && typeof availTop === 'number' && availTop > 0) {
            statusBarFallback = availTop;
          } else {
            // Standard Android status bar height in dp (24dp - 32dp depending on device pixel ratio)
            const dpr = window.devicePixelRatio || 1;
            statusBarFallback = dpr >= 2.5 ? 32 : 26;
          }
        }
      }

      if (computedSab <= 0 && isStandalone) {
        navBarFallback = 12;
      }

      document.documentElement.style.setProperty(
        '--android-status-bar-height',
        `${statusBarFallback}px`
      );
      document.documentElement.style.setProperty(
        '--android-nav-bar-height',
        `${navBarFallback}px`
      );
    }

    updateSafeAreas();

    window.addEventListener('resize', updateSafeAreas);
    window.addEventListener('orientationchange', updateSafeAreas);

    return () => {
      window.removeEventListener('resize', updateSafeAreas);
      window.removeEventListener('orientationchange', updateSafeAreas);
    };
  }, []);
}
