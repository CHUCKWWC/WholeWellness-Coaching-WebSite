import { useEffect, useState } from 'react';

interface PWAState {
  isInstallable: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
}

interface PWAActions {
  promptInstall: () => Promise<void>;
  updateApp: () => void;
}

export function usePWA(): PWAState & PWAActions {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('[PWA] Service Worker registered:', registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
              console.log('[PWA] New version available');
            }
          });
        }
      });

      // Listen for controlling service worker changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  const promptInstall = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] App installation accepted');
        setIsInstallable(false);
      } else {
        console.log('[PWA] App installation declined');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Installation prompt failed:', error);
    }
  };

  const updateApp = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
  };

  return {
    isInstallable,
    isOffline,
    isUpdateAvailable,
    canInstall: !!deferredPrompt,
    promptInstall,
    updateApp
  };
}