import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingProvider } from './onboarding/OnboardingContext';
import CoachOnboardingFlow from './onboarding/CoachOnboardingFlow';
import ClientOnboardingFlow from './onboarding/ClientOnboardingFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Users, ArrowRight, CheckCircle } from 'lucide-react';

type OnboardingType = 'client' | 'coach';

interface SmartOnboardingProps {
  userType?: OnboardingType;
  onComplete?: () => void;
}

/**
 * SmartOnboarding - Unified onboarding component that adapts to user type
 * 
 * Features:
 * - Automatically detects user role (member/coach) from auth or URL params
 * - Loads appropriate onboarding flow (client or coach)
 * - Provides unified progress tracking
 * - Allows manual type selection if role is unknown
 */
export default function SmartOnboarding({ userType, onComplete }: SmartOnboardingProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<OnboardingType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Determine onboarding type
  useEffect(() => {
    // Priority 1: Props override
    if (userType) {
      setSelectedType(userType);
      return;
    }

    // Priority 2: User's actual role if authenticated
    if (isAuthenticated && user?.role) {
      const normalizedRole = user.role === 'member' ? 'client' : user.role;
      if (normalizedRole === 'coach') {
        setSelectedType('coach');
      } else {
        setSelectedType('client');
      }
      return;
    }

    // Priority 3: Show type selector if no role detected
    setShowTypeSelector(true);
  }, [userType, user, isAuthenticated]);

  const handleTypeSelection = (type: OnboardingType) => {
    setSelectedType(type);
    setShowTypeSelector(false);
  };

  const handleOnboardingComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Default: redirect to dashboard
      setLocation('/dashboard');
    }
  };

  // Type selector UI (shown when role is unknown)
  if (showTypeSelector && !selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-4xl w-full shadow-2xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold mb-2">Welcome to WholeWellness</CardTitle>
            <CardDescription className="text-lg">
              Let's personalize your experience. Are you here as a client or a coach?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Client Option */}
              <button
                onClick={() => handleTypeSelection('client')}
                className="group relative p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg transition-all duration-200 text-left"
                data-testid="button-select-client"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <UserCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      I'm a Client
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Looking for support, guidance, and wellness coaching
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Access AI coaching and professional coaches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Personalized wellness journey and assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Book sessions and track your progress</span>
                  </li>
                </ul>

                <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:gap-2 transition-all">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </button>

              {/* Coach Option */}
              <button
                onClick={() => handleTypeSelection('coach')}
                className="group relative p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left"
                data-testid="button-select-coach"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                      I'm a Coach
                      <Badge variant="outline" className="text-xs">Professional</Badge>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      Join our team and help clients achieve wellness
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Manage clients and sessions professionally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Access certification and training programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Earn income helping others transform</span>
                  </li>
                </ul>

                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-2 transition-all">
                  Apply to Coach
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <a href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                Log in here
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while determining type
  if (!selectedType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your personalized experience...</p>
        </div>
      </div>
    );
  }

  // Render appropriate onboarding flow
  return (
    <OnboardingProvider onboardingType={selectedType}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
        {selectedType === 'coach' ? (
          <CoachOnboardingFlow />
        ) : (
          <ClientOnboardingFlow />
        )}
      </div>
    </OnboardingProvider>
  );
}
