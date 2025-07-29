import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Users, 
  Shield, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Home,
  MessageCircle,
  CreditCard,
  Calendar,
  BookOpen,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  icon: JSX.Element;
  color: string;
  stats?: {
    label: string;
    value: string;
  }[];
  interactive?: JSX.Element;
}

interface OnboardingWelcomeProps {
  isOpen: boolean;
  onComplete: () => void;
  userType?: 'new' | 'returning';
}

export default function OnboardingWelcome({ isOpen, onComplete, userType = 'new' }: OnboardingWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      title: "Welcome to Wholewellness Coaching",
      subtitle: "Empowering women through life's most challenging transitions",
      content: "Our mission is to provide comprehensive support, resources, and coaching to women navigating domestic violence recovery, divorce, widowhood, and other major life transitions.",
      icon: <Heart className="h-8 w-8" />,
      color: "from-pink-500 to-rose-500",
      stats: [
        { label: "Women Supported", value: "2,500+" },
        { label: "Success Stories", value: "1,800+" },
        { label: "Years of Service", value: "8+" }
      ]
    },
    {
      id: 2,
      title: "Safe Haven & Support",
      subtitle: "Creating a secure space for healing and growth",
      content: "We understand the unique challenges you face. Our platform provides trauma-informed care, confidential support, and resources specifically designed for women in crisis transitions.",
      icon: <Shield className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500",
      stats: [
        { label: "24/7 Crisis Support", value: "Available" },
        { label: "Confidential Services", value: "100%" },
        { label: "Trauma-Informed Care", value: "Always" }
      ]
    },
    {
      id: 3,
      title: "Community & Connection",
      subtitle: "You're not alone in this journey",
      content: "Join a supportive community of women who understand your experience. Connect with others, share your story, and find strength in sisterhood.",
      icon: <Users className="h-8 w-8" />,
      color: "from-purple-500 to-indigo-500",
      stats: [
        { label: "Active Members", value: "850+" },
        { label: "Support Groups", value: "12" },
        { label: "Peer Mentors", value: "45+" }
      ]
    },
    {
      id: 4,
      title: "Comprehensive Services",
      subtitle: "Everything you need in one place",
      content: "From AI coaching and financial planning to legal resources and wellness programs, we provide holistic support for every aspect of your journey to independence.",
      icon: <Sparkles className="h-8 w-8" />,
      color: "from-emerald-500 to-teal-500",
      stats: [
        { label: "Service Categories", value: "6" },
        { label: "AI Coaches Available", value: "6" },
        { label: "Resource Library Items", value: "200+" }
      ]
    }
  ];

  const platformFeatures = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "AI Coaching",
      description: "24/7 specialized coaching in finance, career, relationships, and more"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Donation Portal",
      description: "Support our mission and track your impact on the community"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Appointment Booking",
      description: "Schedule one-on-one sessions with our certified coaches"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Resource Library",
      description: "Access tools, worksheets, and educational materials"
    },
    {
      icon: <User className="h-6 w-6" />,
      title: "Member Portal",
      description: "Track your progress and access personalized content"
    },
    {
      icon: <Home className="h-6 w-6" />,
      title: "Community Hub",
      description: "Connect with other women on similar journeys"
    }
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFeatures(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!showFeatures ? (
            <motion.div
              key="steps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Progress Bar */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Welcome Journey</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{currentStep + 1} of {onboardingSteps.length}</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onComplete}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Skip Tour
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {/* Icon with animated background */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${onboardingSteps[currentStep].color} text-white mb-6 shadow-lg`}
                    >
                      {onboardingSteps[currentStep].icon}
                    </motion.div>

                    {/* Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {onboardingSteps[currentStep].title}
                      </h3>
                      <p className="text-xl text-gray-600 mb-6">
                        {onboardingSteps[currentStep].subtitle}
                      </p>
                      <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                        {onboardingSteps[currentStep].content}
                      </p>
                    </motion.div>

                    {/* Stats */}
                    {onboardingSteps[currentStep].stats && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-8"
                      >
                        {onboardingSteps[currentStep].stats!.map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="text-center"
                          >
                            <div className={`text-2xl font-bold bg-gradient-to-r ${onboardingSteps[currentStep].color} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-between"
                >
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex space-x-2">
                    {onboardingSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentStep
                            ? `bg-gradient-to-r ${onboardingSteps[currentStep].color}`
                            : index < currentStep
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={nextStep}
                    className={`bg-gradient-to-r ${onboardingSteps[currentStep].color} hover:opacity-90 text-white flex items-center gap-2`}
                  >
                    {currentStep === onboardingSteps.length - 1 ? 'Explore Features' : 'Next'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8"
            >
              <div className="text-center mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div></div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onComplete}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip Tour
                  </Button>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white mb-4"
                >
                  <Sparkles className="h-8 w-8" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Discover Our Platform
                </h3>
                <p className="text-xl text-gray-600 mb-6">
                  Explore the tools and resources designed just for you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {platformFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                            {feature.icon}
                          </div>
                          <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <Button
                  onClick={onComplete}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white px-8 py-3 text-lg"
                >
                  Start Your Journey
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  You can access this welcome tour anytime from your profile settings
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}