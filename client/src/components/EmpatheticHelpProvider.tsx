import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useContextualHelp } from '@/hooks/useContextualHelp';

interface EmpatheticHelpContextType {
  showHelpFor: (context: string, delay?: number) => void;
  dismissHelp: (context: string) => void;
  isHelpActive: (context: string) => boolean;
}

const EmpatheticHelpContext = createContext<EmpatheticHelpContextType | undefined>(undefined);

export function EmpatheticHelpProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const { showHelp, dismissHelp, shouldShowHelp } = useContextualHelp();

  const showHelpFor = (context: string, delay: number = 0) => {
    if (shouldShowHelp(context)) {
      setTimeout(() => showHelp(context), delay);
    }
  };

  const isHelpActive = (context: string) => {
    return shouldShowHelp(context);
  };

  // Auto-trigger empathetic help based on user context
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const triggerContextualHelp = () => {
      // Help for users who might be struggling
      if (user.lastLoginDate) {
        const daysSinceLogin = (Date.now() - new Date(user.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLogin > 7) {
          showHelpFor('difficult-moment', 2000);
        }
      }

      // Help for users who haven't completed onboarding
      if (!user.hasCompletedOnboarding && location === '/') {
        showHelpFor('onboarding-overwhelmed', 5000);
      }

      // Help for free users on pages that might encourage upgrade
      if (user.membershipLevel === 'free' && location === '/member-portal') {
        showHelpFor('membership-benefits', 10000);
      }

      // Help for users who might be new to coaching
      if (!user.hasBookedSession && location === '/ai-coaching') {
        showHelpFor('coaching-selection', 3000);
      }

      // Help for users considering first session
      if (!user.hasBookedSession && location === '/book-session') {
        showHelpFor('first-session-booking', 1000);
      }

      // Help for users tracking progress
      if (user.hasCompletedSessions && location === '/member-portal') {
        showHelpFor('progress-tracking', 4000);
      }
    };

    // Delay initial help to allow page to load
    const timer = setTimeout(triggerContextualHelp, 1000);
    return () => clearTimeout(timer);
  }, [location, user, isAuthenticated, showHelp, shouldShowHelp]);

  return (
    <EmpatheticHelpContext.Provider value={{ showHelpFor, dismissHelp, isHelpActive }}>
      {children}
    </EmpatheticHelpContext.Provider>
  );
}

export function useEmpatheticHelp() {
  const context = useContext(EmpatheticHelpContext);
  if (!context) {
    throw new Error('useEmpatheticHelp must be used within an EmpatheticHelpProvider');
  }
  return context;
}

// Quick helper component for adding help to any element
export function WithEmpatheticHelp({
  children,
  helpContext,
  trigger = 'hover',
  position = 'top',
  showCondition = true,
  className = ''
}: {
  children: React.ReactNode;
  helpContext: string;
  trigger?: 'hover' | 'click' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right';
  showCondition?: boolean;
  className?: string;
}) {
  const { isHelpActive } = useEmpatheticHelp();

  if (!showCondition || !isHelpActive(helpContext)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      {trigger === 'hover' && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export default EmpatheticHelpProvider;