import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { X, Sparkles, PartyPopper, TrendingUp } from 'lucide-react';

export default function AuthenticatedWelcome() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const firstLogin = sessionStorage.getItem('firstLogin');
    const onboardingComplete = sessionStorage.getItem('onboardingComplete');
    const hasDismissedWelcome = sessionStorage.getItem(`welcomeDismissed_${user.id}`);

    if (hasDismissedWelcome) {
      return;
    }

    if (onboardingComplete) {
      setWelcomeMessage('🎉 Onboarding Complete! Your wellness journey begins now.');
      setIsVisible(true);
      // Clear the flag
      sessionStorage.removeItem('onboardingComplete');
    } else if (firstLogin) {
      setWelcomeMessage('✨ Welcome to WholeWellness! We\'re thrilled to have you here.');
      setIsVisible(true);
      // Clear the flag
      sessionStorage.removeItem('firstLogin');
    } else {
      // Returning user
      const currentHour = new Date().getHours();
      let greeting = 'Welcome back';
      if (currentHour < 12) greeting = 'Good morning';
      else if (currentHour < 18) greeting = 'Good afternoon';
      else greeting = 'Good evening';

      setWelcomeMessage(`${greeting}, ${user.firstName}! Ready to continue your wellness journey?`);
      setIsVisible(true);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (user) {
      sessionStorage.setItem(`welcomeDismissed_${user.id}`, 'true');
    }
  };

  if (!isVisible || !user) {
    return null;
  }

  const getIcon = () => {
    if (sessionStorage.getItem('onboardingComplete')) {
      return <PartyPopper className="h-6 w-6 text-purple-600" />;
    } else if (sessionStorage.getItem('firstLogin')) {
      return <Sparkles className="h-6 w-6 text-purple-600" />;
    }
    return <TrendingUp className="h-6 w-6 text-purple-600" />;
  };

  return (
    <Card className="border-l-4 border-l-purple-600 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-md mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {welcomeMessage}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="hover:bg-purple-100 dark:hover:bg-purple-900/20"
            aria-label="Dismiss welcome message"
            data-testid="button-dismiss-welcome"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
