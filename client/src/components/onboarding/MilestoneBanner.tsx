import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Heart, Rocket, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MilestoneBannerProps {
  milestone: number;
  totalSteps: number;
  userName?: string;
  onContinue: () => void;
  onboardingType: 'client' | 'coach';
}

const milestones: Record<number, {
  icon: any;
  title: string;
  clientMessage: string;
  coachMessage: string;
  encouragement: string;
  color: string;
}> = {
  2: {
    icon: Star,
    title: 'Great Start!',
    clientMessage: "You're doing amazing! We're learning about your unique needs.",
    coachMessage: "Excellent progress! Your experience is valuable to our community.",
    encouragement: "Keep going - you're building the foundation for transformation!",
    color: 'from-yellow-400 to-orange-500'
  },
  4: {
    icon: Heart,
    title: 'Halfway There!',
    clientMessage: "You're halfway to finding your perfect coach match.",
    coachMessage: "Halfway done! Your expertise will help so many women.",
    encouragement: "The best is yet to come. Your dedication is inspiring!",
    color: 'from-pink-500 to-rose-500'
  },
  6: {
    icon: Rocket,
    title: 'Almost Done!',
    clientMessage: "Just a few more steps and we'll match you with your coach.",
    coachMessage: "Almost there! Soon you'll be making a real difference.",
    encouragement: "You're so close to starting this incredible journey!",
    color: 'from-purple-500 to-indigo-500'
  }
};

export default function MilestoneBanner({ 
  milestone, 
  totalSteps, 
  userName, 
  onContinue,
  onboardingType 
}: MilestoneBannerProps) {
  const milestoneData = milestones[milestone];
  
  if (!milestoneData) return null;

  const Icon = milestoneData.icon;
  const message = onboardingType === 'client' 
    ? milestoneData.clientMessage 
    : milestoneData.coachMessage;

  const progress = Math.round((milestone / totalSteps) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className={`h-2 bg-gradient-to-r ${milestoneData.color}`} />
        
        <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${milestoneData.color} opacity-10`}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.2 }}
            className={`inline-flex p-4 rounded-full bg-gradient-to-r ${milestoneData.color} mb-6`}
          >
            <Icon className="h-10 w-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {userName ? `${milestoneData.title}, ${userName}!` : `${milestoneData.title}`}
            </h2>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {progress}%
              </div>
              <span className="text-gray-500 dark:text-gray-400">Complete</span>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {message}
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {milestoneData.encouragement}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex flex-col gap-3"
          >
            <Button
              onClick={onContinue}
              className={`w-full py-6 bg-gradient-to-r ${milestoneData.color} hover:opacity-90 text-white font-semibold`}
              data-testid="button-continue-milestone"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Keep Going!
            </Button>
          </motion.div>

          <motion.div
            className="mt-6 flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i < milestone 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
