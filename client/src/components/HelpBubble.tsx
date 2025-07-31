import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Heart, MessageCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface HelpBubbleProps {
  context: string;
  trigger?: 'hover' | 'click' | 'auto';
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  persistent?: boolean;
  onClose?: () => void;
  className?: string;
}

interface HelpContent {
  title: string;
  message: string;
  tone: 'supportive' | 'encouraging' | 'informative' | 'celebratory';
  actionSuggestions?: string[];
  relatedTopics?: Array<{name: string; link: string}>;
  icon: React.ReactNode;
}

const contextualHelp: Record<string, HelpContent> = {
  'registration-welcome': {
    title: 'Welcome to Your Wellness Journey',
    message: "Taking the first step toward wellness shows incredible courage. You're joining a supportive community that believes in your strength and potential.",
    tone: 'supportive',
    actionSuggestions: ['Complete your profile to get personalized recommendations', 'Explore our coaching specialties'],
    relatedTopics: [
      {name: 'Getting Started', link: '/digital-onboarding'},
      {name: 'Finding Your Coach', link: '/coach-signup'}
    ],
    icon: <Heart className="w-5 h-5 text-pink-500" />
  },
  'donation-first-time': {
    title: 'Your Generosity Makes a Difference',
    message: "Every contribution, no matter the size, helps create a world where wellness support is accessible to everyone. Your kindness is deeply appreciated.",
    tone: 'encouraging',
    actionSuggestions: ['Choose a donation amount that feels right for you', 'Learn about our impact stories'],
    relatedTopics: [
      {name: 'Our Mission', link: '/about'},
      {name: 'Community Impact', link: '/impact'}
    ],
    icon: <Heart className="w-5 h-5 text-green-500" />
  },
  'coaching-selection': {
    title: 'Finding Your Perfect Match',
    message: "Choosing the right coaching specialty is about honoring where you are right now. Trust your instincts - you know what feels right for your journey.",
    tone: 'supportive',
    actionSuggestions: ['Take our specialty quiz', 'Read coach profiles', 'Start with what feels most urgent'],
    relatedTopics: [
      {name: 'Coaching Specialties', link: '/ai-coaching'},
      {name: 'Getting Started', link: '/digital-onboarding'}
    ],
    icon: <Lightbulb className="w-5 h-5 text-blue-500" />
  },
  'first-session-booking': {
    title: 'Ready for Your First Session?',
    message: "Booking your first session is a brave step. Remember, our coaches are here to support you without judgment. You're in a safe space to grow and heal.",
    tone: 'encouraging',
    actionSuggestions: ['Prepare a few questions for your coach', 'Choose a comfortable, private space'],
    relatedTopics: [
      {name: 'What to Expect', link: '/resources'},
      {name: 'Session Preparation', link: '/wix-booking'}
    ],
    icon: <MessageCircle className="w-5 h-5 text-purple-500" />
  },
  'progress-tracking': {
    title: 'Celebrating Your Progress',
    message: "Every small step forward is worth celebrating. Healing and growth aren't linear - be patient and kind with yourself as you navigate this journey.",
    tone: 'celebratory',
    actionSuggestions: ['Review your recent achievements', 'Set a small, achievable goal'],
    relatedTopics: [
      {name: 'Progress Tracking', link: '/wellness-journey'},
      {name: 'Self-Care Tips', link: '/mental-wellness'}
    ],
    icon: <ArrowRight className="w-5 h-5 text-orange-500" />
  },
  'difficult-moment': {
    title: 'You Are Not Alone',
    message: "Difficult moments are part of the healing process. Your strength has brought you this far, and you have the support you need to continue forward.",
    tone: 'supportive',
    actionSuggestions: ['Reach out to your coach', 'Practice a breathing exercise', 'Connect with our community'],
    relatedTopics: [
      {name: 'Crisis Support', link: '/contact'},
      {name: 'Coping Strategies', link: '/mental-wellness'}
    ],
    icon: <Heart className="w-5 h-5 text-red-500" />
  },
  'membership-benefits': {
    title: 'Unlock Your Full Potential',
    message: "Membership isn't just about access - it's about investing in your wellbeing and joining a community that truly cares about your success.",
    tone: 'informative',
    actionSuggestions: ['Explore membership benefits', 'See what other members say'],
    relatedTopics: [
      {name: 'Membership Tiers', link: '/subscribe'},
      {name: 'Community Benefits', link: '/about'}
    ],
    icon: <Lightbulb className="w-5 h-5 text-indigo-500" />
  },
  'onboarding-overwhelmed': {
    title: 'Take It One Step at a Time',
    message: "Feeling overwhelmed is completely normal. You don't have to do everything at once. Focus on one small step, and we'll be here to guide you through the rest.",
    tone: 'supportive',
    actionSuggestions: ['Start with just one specialty', 'Take breaks when needed'],
    relatedTopics: [
      {name: 'Getting Started', link: '/digital-onboarding'},
      {name: 'Self-Paced Learning', link: '/resources'}
    ],
    icon: <Heart className="w-5 h-5 text-teal-500" />
  }
};

export function HelpBubble({ 
  context, 
  trigger = 'hover',
  position = 'top',
  delay = 0,
  persistent = false,
  onClose,
  className = ''
}: HelpBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const helpContent = contextualHelp[context];

  useEffect(() => {
    if (trigger === 'auto' && !hasBeenShown && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasBeenShown(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, delay, hasBeenShown, isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onClose?.();
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'supportive': return 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800';
      case 'encouraging': return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'informative': return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'celebratory': return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  if (!helpContent || isDismissed) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {trigger === 'hover' && (
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => !persistent && setIsVisible(false)}
          className="cursor-help"
        >
          <MessageCircle className="w-5 h-5 text-blue-500 hover:text-blue-600" />
        </div>
      )}

      {trigger === 'click' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="p-1 h-auto"
        >
          <MessageCircle className="w-5 h-5 text-blue-500" />
        </Button>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 w-80 ${
              position === 'top' ? 'bottom-full mb-2' : 
              position === 'bottom' ? 'top-full mt-2' :
              position === 'left' ? 'right-full mr-2' :
              'left-full ml-2'
            }`}
          >
            <Card className={`shadow-lg ${getToneColor(helpContent.tone)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {helpContent.icon}
                    <CardTitle className="text-sm font-medium">
                      {helpContent.title}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="p-1 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {helpContent.message}
                </p>

                {helpContent.actionSuggestions && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Suggested Actions:
                    </p>
                    <ul className="space-y-1">
                      {helpContent.actionSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {helpContent.relatedTopics && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Related Topics:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {helpContent.relatedTopics.map((topic, index) => (
                        <Link key={index} href={topic.link}>
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors"
                          >
                            {topic.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HelpBubble;