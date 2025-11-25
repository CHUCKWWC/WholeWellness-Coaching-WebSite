import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, Users, Star, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingHeroProps {
  type: 'client' | 'coach';
  onStart: () => void;
}

export default function OnboardingHero({ type, onStart }: OnboardingHeroProps) {
  const isClient = type === 'client';

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <motion.div
          className="text-center"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-6"
          >
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {isClient ? 'Your Wellness Journey Starts Here' : 'Join Our Team of Wellness Professionals'}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {isClient ? 'Find Your Perfect Coach' : 'Make a Difference'}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8"
          >
            {isClient 
              ? "We'll match you with a compassionate coach who understands your unique journey and can help you achieve lasting wellness."
              : "Help women rebuild their lives with strength and purpose. Join our community of certified wellness coaches."
            }
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              size="lg"
              onClick={onStart}
              className="group px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
              data-testid="button-start-onboarding"
            >
              {isClient ? 'Begin Your Journey' : 'Start Your Application'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{isClient ? '5-7 minutes' : '10-15 minutes'}</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {(isClient ? clientFeatures : coachFeatures).map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.bgColor}`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Trusted by hundreds of {isClient ? 'clients' : 'coaches'} on their wellness journey
          </p>
          <div className="flex justify-center items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">4.9/5</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const clientFeatures = [
  {
    icon: Heart,
    title: 'Personalized Match',
    description: 'Get matched with a coach who truly understands your needs',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    icon: Shield,
    title: '100% Confidential',
    description: 'Your privacy is protected with enterprise-grade security',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: Users,
    title: 'Expert Coaches',
    description: 'All coaches are certified and thoroughly vetted',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    icon: Sparkles,
    title: 'AI + Human Support',
    description: 'Get 24/7 AI coaching plus live professional sessions',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];

const coachFeatures = [
  {
    icon: Heart,
    title: 'Meaningful Work',
    description: 'Help women rebuild their lives with purpose and strength',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    icon: Users,
    title: 'Supportive Community',
    description: 'Join a network of passionate wellness professionals',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: Sparkles,
    title: 'Flexible Schedule',
    description: 'Work on your own terms with flexible availability',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    icon: Shield,
    title: 'Professional Growth',
    description: 'Access training, certification, and ongoing support',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];
