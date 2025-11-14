import { TutorialSlideshow } from "@/components/TutorialSlideshow";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Video, FileText } from "lucide-react";

// Import tutorial slides
import welcomeSlide from "@assets/generated_images/User_welcome_onboarding_slide_7621eb92.png";
import aiCoachingSlide from "@assets/generated_images/AI_coaching_features_slide_d96192ac.png";
import bookingSlide from "@assets/generated_images/Booking_session_tutorial_slide_6fcc6be2.png";
import assessmentsSlide from "@assets/generated_images/Assessments_overview_slide_c8bf4b77.png";
import journeySlide from "@assets/generated_images/User_journey_timeline_slide_5045127f.png";

const userSlides = [
  {
    image: welcomeSlide,
    alt: "Welcome to WholeWellness",
    title: "Welcome to WholeWellness",
    description: "Get started with your wellness journey in three simple steps: Create your account, choose between AI coaching or professional coaches, and begin your transformation."
  },
  {
    image: aiCoachingSlide,
    alt: "AI Coaching Features",
    title: "AI Coaching - $19.99/month",
    description: "Access 6 specialized AI coaches covering nutrition, fitness, mental wellness, relationships, career, and financial health. Unlimited messaging with instant responses 24/7."
  },
  {
    image: bookingSlide,
    alt: "Book Professional Coach",
    title: "Book Sessions with Professional Coaches",
    description: "Browse our verified wellness coaches, select a convenient time, and join secure HD video sessions directly from your browser or mobile device."
  },
  {
    image: assessmentsSlide,
    alt: "Wellness Assessments",
    title: "Track Your Progress with Assessments",
    description: "Complete mental health screenings, wellness assessments, and goal-setting exercises. No account required - take assessments anonymously anytime."
  },
  {
    image: journeySlide,
    alt: "Your Wellness Journey",
    title: "Your Personalized Wellness Path",
    description: "Follow your guided journey: Sign up, complete your initial assessment, choose your coaching package, start sessions, and track your progress over time."
  }
];

export default function UserTutorial() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              How to Use WholeWellness
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A complete guide for users to get started with our wellness coaching platform
            </p>
          </div>

          {/* Additional Resources */}
          <div className="flex justify-center gap-4 mb-8">
            <Button variant="outline" size="sm" data-testid="button-video-tutorial">
              <Video className="h-4 w-4 mr-2" />
              Watch Video Tutorial
            </Button>
            <Button variant="outline" size="sm" data-testid="button-download-guide">
              <FileText className="h-4 w-4 mr-2" />
              Download PDF Guide
            </Button>
          </div>
        </div>

        {/* Slideshow */}
        <TutorialSlideshow
          slides={userSlides}
          title="User Guide"
        />

        {/* Quick Start Tips */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Quick Start
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Sign up takes less than 2 minutes. No credit card required to browse coaches or try assessments.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              24/7 AI Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Get instant guidance from AI coaches anytime. Perfect for immediate support between professional sessions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Safe & Private
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Your conversations are encrypted and confidential. Take assessments anonymously without creating an account.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button
            size="lg"
            onClick={() => setLocation("/signup")}
            data-testid="button-get-started"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Get Started Now
          </Button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Ready to begin your wellness journey?
          </p>
        </div>
      </div>
    </div>
  );
}
