import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingProvider } from './onboarding/OnboardingContext';
import CoachOnboardingFlow from './onboarding/CoachOnboardingFlow';
import ClientOnboardingFlow from './onboarding/ClientOnboardingFlow';
import OnboardingHero from './onboarding/OnboardingHero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Users, ArrowRight, CheckCircle, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

type OnboardingType = 'client' | 'coach';

interface SmartOnboardingProps {
  userType?: OnboardingType;
  onComplete?: () => void;
}

export default function SmartOnboarding({ userType, onComplete }: SmartOnboardingProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<OnboardingType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    if (userType) {
      setSelectedType(userType);
      return;
    }

    if (isAuthenticated && user?.role) {
      const normalizedRole = user.role === 'member' ? 'client' : user.role;
      if (normalizedRole === 'coach') {
        setSelectedType('coach');
      } else {
        setSelectedType('client');
      }
      return;
    }

    setShowTypeSelector(true);
  }, [userType, user, isAuthenticated]);

  const handleTypeSelection = (type: OnboardingType) => {
    setSelectedType(type);
    setShowTypeSelector(false);
    setShowHero(true);
  };

  const handleStartOnboarding = () => {
    setShowHero(false);
  };

  const handleOnboardingComplete = () => {
    sessionStorage.setItem('onboardingComplete', 'true');
    
    if (onComplete) {
      onComplete();
    } else {
      setLocation('/');
    }
  };

  if (showTypeSelector && !selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-4xl w-full shadow-2xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 rounded-full mx-auto mb-4"
              >
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Start Your Journey
                </span>
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-2">Welcome to WholeWellness</CardTitle>
              <CardDescription className="text-lg">
                Let's personalize your experience. Are you here as a client or a coach?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelection('client')}
                  className="group relative p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-xl transition-all duration-200 text-left"
                  data-testid="button-select-client"
                >
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      Recommended
                    </Badge>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <UserCircle className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    I'm Looking for Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Find a compassionate coach to guide your wellness journey
                  </p>
                  
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Access AI coaching and professional coaches</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Personalized wellness journey and assessments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Book sessions and track your progress</span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>~5 minutes</span>
                    </div>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-3 transition-all">
                      Get Started
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTypeSelection('coach')}
                  className="group relative p-8 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-200 text-left"
                  data-testid="button-select-coach"
                >
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="text-xs">
                      Professional
                    </Badge>
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                      <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    I Want to Coach
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Join our team and help clients achieve wellness
                  </p>
                  
                  <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Manage clients and sessions professionally</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Access certification and training programs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>Earn income helping others transform</span>
                    </li>
                  </ul>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>~15 minutes</span>
                    </div>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-3 transition-all">
                      Apply Now
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </div>
                  </div>
                </motion.button>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                Already have an account?{' '}
                <a href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                  Log in here
                </a>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!selectedType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading your personalized experience...</p>
        </div>
      </div>
    );
  }

  if (showHero) {
    return (
      <OnboardingHero 
        type={selectedType} 
        onStart={handleStartOnboarding} 
      />
    );
  }

  return (
    <OnboardingProvider onboardingType={selectedType}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
        {selectedType === 'coach' ? (
          <CoachOnboardingFlow />
        ) : (
          <ClientOnboardingFlow />
        )}
      </div>
    </OnboardingProvider>
  );
}
