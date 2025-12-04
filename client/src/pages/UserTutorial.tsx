import { TutorialSlideshow } from "@/components/TutorialSlideshow";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Video, FileText, Sparkles } from "lucide-react";
import { userTutorialSlides } from "@/data/tutorialSlides";
import { motion } from "framer-motion";

export default function UserTutorial() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center mb-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 dark:bg-teal-900/40 rounded-full mb-4"
            >
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                Step-by-Step Guide
              </span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              How to Use <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">WholeWellness</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A complete guide to get started with our wellness coaching platform
            </p>
          </div>

          {/* Additional Resources */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-8">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:text-teal-600"
              data-testid="button-video-tutorial"
            >
              <Video className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Watch Video</span>
              <span className="sm:hidden">Video</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:text-teal-600"
              data-testid="button-download-guide"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </motion.div>

        {/* Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TutorialSlideshow
            slides={userTutorialSlides}
            title="User Guide"
          />
        </motion.div>

        {/* Quick Start Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid md:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Quick Start
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Sign up takes less than 2 minutes. No credit card required to browse coaches or try assessments.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              24/7 AI Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Get instant guidance from AI coaches anytime. Perfect for immediate support between professional sessions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Safe & Private
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Your conversations are encrypted and confidential. Take assessments anonymously without creating an account.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button
            size="lg"
            onClick={() => setLocation("/register")}
            data-testid="button-get-started"
            className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all px-8"
          >
            Get Started Now
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Ready to begin your wellness journey?
          </p>
        </motion.div>
      </div>
    </div>
  );
}
