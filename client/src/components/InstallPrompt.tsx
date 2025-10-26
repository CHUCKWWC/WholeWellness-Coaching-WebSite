import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 10 seconds to avoid being intrusive
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`[PWA] Install prompt outcome: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <Card className="border-2 border-teal-500 shadow-xl">
        <CardContent className="p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-3 min-h-[48px] min-w-[48px] rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center touch-target"
            aria-label="Dismiss install prompt"
            data-testid="button-dismiss-install"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex items-start gap-4 pr-6">
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full flex-shrink-0">
              <Download className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Install WholeWellness
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Get instant access from your home screen. Works offline and loads faster.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 h-12 min-h-[48px] touch-target"
                  data-testid="button-install-app"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="h-12 min-h-[48px] px-4 touch-target"
                  data-testid="button-not-now"
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
