import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useContextualHelp, useSmartHelp } from '@/hooks/useContextualHelp';
import HelpBubble from './HelpBubble';

export function HelpSystem() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showHelp, shouldShowHelp } = useContextualHelp();
  const { triggerSmartHelp } = useSmartHelp();

  // Auto-trigger help based on page context and user state
  useEffect(() => {
    if (!isAuthenticated) return;

    const triggerPageHelp = () => {
      switch (location) {
        case '/':
          // Show welcome help for new users
          if (user && !user.hasCompletedOnboarding) {
            setTimeout(() => showHelp('registration-welcome'), 2000);
          }
          break;

        case '/register':
          // Show registration help
          setTimeout(() => showHelp('registration-welcome'), 1000);
          break;

        case '/donate':
          // Show donation help for first-time donors
          if (user && (!user.donationTotal || user.donationTotal === '0')) {
            setTimeout(() => showHelp('donation-first-time'), 1500);
          }
          break;

        case '/ai-coaching':
          // Show coaching selection help
          setTimeout(() => showHelp('coaching-selection'), 1000);
          break;

        case '/onboarding':
          // Show overwhelmed help if user has been on page for a while
          triggerSmartHelp('onboarding-overwhelmed', {
            minTimeOnPage: 45000, // 45 seconds
            inactivityThreshold: 20000 // 20 seconds of inactivity
          });
          break;

        case '/member-portal':
          // Show progress tracking help
          if (user && user.membershipLevel !== 'free') {
            setTimeout(() => showHelp('progress-tracking'), 2000);
          }
          // Show membership benefits for free users
          else if (user && user.membershipLevel === 'free') {
            triggerSmartHelp('membership-benefits', {
              minTimeOnPage: 30000, // 30 seconds
              minScrollDepth: 50 // 50% scroll
            });
          }
          break;

        case '/book-session':
          // Show first session help
          setTimeout(() => showHelp('first-session-booking'), 1000);
          break;
      }
    };

    triggerPageHelp();
  }, [location, user, isAuthenticated, showHelp, triggerSmartHelp]);

  // Trigger help based on user behavior patterns
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Show difficult moment help if user returns frequently but doesn't engage
    const checkForDifficultMoment = () => {
      const recentSessions = user.recentSessions || [];
      const hasLowEngagement = recentSessions.length > 3 && 
        recentSessions.every(session => session.duration < 5);
      
      if (hasLowEngagement && shouldShowHelp('difficult-moment')) {
        showHelp('difficult-moment');
      }
    };

    // Check after user has been on site for 2 minutes
    const timer = setTimeout(checkForDifficultMoment, 120000);
    return () => clearTimeout(timer);
  }, [user, isAuthenticated, showHelp, shouldShowHelp]);

  return null; // This component doesn't render anything visible
}

// Helper component for embedding help bubbles in specific contexts
export function ContextualHelpTrigger({ 
  context, 
  children, 
  trigger = 'hover',
  position = 'top',
  className = ''
}: {
  context: string;
  children: React.ReactNode;
  trigger?: 'hover' | 'click' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) {
  const { shouldShowHelp } = useContextualHelp();

  if (!shouldShowHelp(context)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      <HelpBubble
        context={context}
        trigger={trigger}
        position={position}
        className="absolute -top-2 -right-2"
      />
    </div>
  );
}

export default HelpSystem;