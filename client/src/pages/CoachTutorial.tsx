import { TutorialSlideshow } from "@/components/TutorialSlideshow";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Video, BookOpen, Award } from "lucide-react";
import { coachTutorialSlides } from "@/data/tutorialSlides";

export default function CoachTutorial() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/coach-dashboard")}
            className="mb-4"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Coach Training Guide
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Complete training materials for WholeWellness coaches
            </p>
          </div>

          {/* Resources */}
          <div className="flex justify-center gap-4 mb-8">
            <Button variant="outline" size="sm" data-testid="button-coach-video">
              <Video className="h-4 w-4 mr-2" />
              Training Video
            </Button>
            <Button variant="outline" size="sm" data-testid="button-coach-manual">
              <BookOpen className="h-4 w-4 mr-2" />
              Coach Manual
            </Button>
            <Button variant="outline" size="sm" data-testid="button-best-practices">
              <Award className="h-4 w-4 mr-2" />
              Best Practices
            </Button>
          </div>
        </div>

        {/* Slideshow */}
        <TutorialSlideshow
          slides={coachTutorialSlides}
          title="Coach Training"
        />

        {/* Best Practices */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Coach Best Practices
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">📅</span>
                Maintain Consistent Availability
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Update your calendar weekly</li>
                <li>• Set realistic time blocks with breaks</li>
                <li>• Use buffer time between sessions</li>
                <li>• Communicate schedule changes promptly</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">💻</span>
                Technical Preparation
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Test video/audio before sessions</li>
                <li>• Use stable internet connection</li>
                <li>• Ensure good lighting and quiet space</li>
                <li>• Familiarize yourself with session controls</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">🎓</span>
                Continuous Learning
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Complete certification courses regularly</li>
                <li>• Stay updated on best practices</li>
                <li>• Participate in coach community</li>
                <li>• Seek supervision when needed</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">❤️</span>
                Client Care
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Practice trauma-informed approach</li>
                <li>• Maintain professional boundaries</li>
                <li>• Document session notes promptly</li>
                <li>• Recognize crisis situations and escalate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-12 bg-purple-50 dark:bg-gray-800 p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Our coach support team is here to assist you
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation("/contact")}
            data-testid="button-contact-support"
          >
            Contact Coach Support
          </Button>
        </div>
      </div>
    </div>
  );
}

