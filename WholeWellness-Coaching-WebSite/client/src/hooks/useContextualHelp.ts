import { useState, useEffect, useCallback } from 'react';

interface HelpContext {
  context: string;
  trigger?: 'hover' | 'click' | 'auto';
  delay?: number;
  persistent?: boolean;
  condition?: () => boolean;
}

interface HelpHistory {
  context: string;
  timestamp: number;
  dismissed: boolean;
}

export function useContextualHelp() {
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [helpHistory, setHelpHistory] = useState<HelpHistory[]>(() => {
    const stored = localStorage.getItem('wellness-help-history');
    return stored ? JSON.parse(stored) : [];
  });

  // Save help history to localStorage
  useEffect(() => {
    localStorage.setItem('wellness-help-history', JSON.stringify(helpHistory));
  }, [helpHistory]);

  const showHelp = useCallback((context: string) => {
    const existingHelp = helpHistory.find(h => h.context === context);
    
    // Don't show if already dismissed recently (within 24 hours)
    if (existingHelp && existingHelp.dismissed) {
      const hoursSinceDismissed = (Date.now() - existingHelp.timestamp) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    setActiveHelp(context);
    
    // Update history
    setHelpHistory(prev => {
      const filtered = prev.filter(h => h.context !== context);
      return [...filtered, {
        context,
        timestamp: Date.now(),
        dismissed: false
      }];
    });
  }, [helpHistory]);

  const dismissHelp = useCallback((context: string) => {
    setActiveHelp(null);
    setHelpHistory(prev => 
      prev.map(h => 
        h.context === context 
          ? { ...h, dismissed: true, timestamp: Date.now() }
          : h
      )
    );
  }, []);

  const shouldShowHelp = useCallback((context: string): boolean => {
    const existingHelp = helpHistory.find(h => h.context === context);
    
    if (!existingHelp) return true;
    
    if (existingHelp.dismissed) {
      const hoursSinceDismissed = (Date.now() - existingHelp.timestamp) / (1000 * 60 * 60);
      return hoursSinceDismissed >= 24;
    }
    
    return true;
  }, [helpHistory]);

  const resetHelpHistory = useCallback(() => {
    setHelpHistory([]);
    localStorage.removeItem('wellness-help-history');
  }, []);

  return {
    activeHelp,
    showHelp,
    dismissHelp,
    shouldShowHelp,
    resetHelpHistory,
    helpHistory
  };
}

// Context-aware help trigger based on user behavior
export function useSmartHelp() {
  const { showHelp, shouldShowHelp } = useContextualHelp();
  const [userBehavior, setUserBehavior] = useState({
    pageViews: 0,
    timeOnPage: 0,
    scrollDepth: 0,
    clickCount: 0,
    lastActivity: Date.now()
  });

  useEffect(() => {
    const startTime = Date.now();
    
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setUserBehavior(prev => ({ ...prev, scrollDepth, lastActivity: Date.now() }));
    };

    const handleClick = () => {
      setUserBehavior(prev => ({ ...prev, clickCount: prev.clickCount + 1, lastActivity: Date.now() }));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setUserBehavior(prev => ({ ...prev, lastActivity: Date.now() }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const timeInterval = setInterval(() => {
      setUserBehavior(prev => ({
        ...prev,
        timeOnPage: Date.now() - startTime
      }));
    }, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(timeInterval);
    };
  }, []);

  const triggerSmartHelp = useCallback((context: string, conditions?: {
    minTimeOnPage?: number;
    minScrollDepth?: number;
    maxClickCount?: number;
    inactivityThreshold?: number;
  }) => {
    const {
      minTimeOnPage = 0,
      minScrollDepth = 0,
      maxClickCount = Infinity,
      inactivityThreshold = 30000 // 30 seconds
    } = conditions || {};

    const timeSinceLastActivity = Date.now() - userBehavior.lastActivity;
    
    const shouldTrigger = 
      shouldShowHelp(context) &&
      userBehavior.timeOnPage >= minTimeOnPage &&
      userBehavior.scrollDepth >= minScrollDepth &&
      userBehavior.clickCount <= maxClickCount &&
      timeSinceLastActivity >= inactivityThreshold;

    if (shouldTrigger) {
      showHelp(context);
    }
  }, [userBehavior, showHelp, shouldShowHelp]);

  return {
    triggerSmartHelp,
    userBehavior
  };
}