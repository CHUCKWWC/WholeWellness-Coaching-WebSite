import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Heart, Users, Award, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeExplanationStepProps {
  onValidChange: (isValid: boolean) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Shield,
    title: '100% Confidential',
    description: 'Everything you share is protected by our strict confidentiality standards. Your information is secure.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    icon: Users,
    title: 'Personalized Matching',
    description: 'We carefully review your responses to match you with a coach who specializes in your areas of focus.',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    icon: Award,
    title: 'Qualified Professionals',
    description: 'All our coaches are thoroughly vetted professionals with proven experience in helping individuals thrive.',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    icon: Heart,
    title: 'Your Success Matters',
    description: "We're committed to your growth. If you're not satisfied with your match, we'll work with you to find a better fit.",
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30'
  }
];

const steps = [
  { number: 1, text: 'Answer questions about your needs and preferences' },
  { number: 2, text: 'We review your profile to understand your unique situation' },
  { number: 3, text: "You'll be matched with a coach within 24-48 hours" },
  { number: 4, text: 'Start your journey with messaging, voice, or video sessions' }
];

export default function WelcomeExplanationStep({ onValidChange }: WelcomeExplanationStepProps) {
  useEffect(() => {
    onValidChange(true);
  }, [onValidChange]);

  return (
    <motion.div 
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div 
        className="text-center"
        variants={fadeInUp}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-4">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Your Journey Starts Here
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to WholeWellnessCoaching.org
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          We're here to help you find the perfect coach for your personal growth journey.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp}>
        <Alert className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800">
          <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-800 dark:text-purple-200 text-base">
            Your journey to wellness begins with finding the right support. We'll guide you through a personalized process to match you with a coach who understands your unique needs.
          </AlertDescription>
        </Alert>
      </motion.div>

      <motion.div 
        className="grid gap-4 sm:grid-cols-2"
        variants={staggerContainer}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 rounded-lg ${feature.bg}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <span className="text-gray-900 dark:text-white">{feature.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={fadeInUp}
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 sm:p-8"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          How it works
        </h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {step.number}
              </div>
              <p className="text-gray-700 dark:text-gray-300 pt-1">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        variants={fadeInUp}
        className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-green-800 dark:text-green-300">Ready to Begin</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-400">
          Please answer all questions honestly and completely. This helps us provide the best possible support for your journey.
        </p>
      </motion.div>
    </motion.div>
  );
}
