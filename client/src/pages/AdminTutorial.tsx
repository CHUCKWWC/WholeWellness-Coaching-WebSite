import { TutorialSlideshow } from "@/components/TutorialSlideshow";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Shield, Users, FileCheck } from "lucide-react";
import { adminTutorialSlides } from "@/data/tutorialSlides";

export default function AdminTutorial() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin")}
            className="mb-4"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Admin Training Guide
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Complete training materials for WholeWellness administrators
            </p>
          </div>

          {/* Resources */}
          <div className="flex justify-center gap-4 mb-8">
            <Button variant="outline" size="sm" data-testid="button-admin-docs">
              <Shield className="h-4 w-4 mr-2" />
              Admin Documentation
            </Button>
            <Button variant="outline" size="sm" data-testid="button-security-guide">
              <FileCheck className="h-4 w-4 mr-2" />
              Security Guide
            </Button>
            <Button variant="outline" size="sm" data-testid="button-moderation-manual">
              <Users className="h-4 w-4 mr-2" />
              Moderation Manual
            </Button>
          </div>
        </div>

        {/* Slideshow */}
        <TutorialSlideshow
          slides={adminTutorialSlides}
          title="Admin Training"
        />

        {/* Admin Best Practices */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Admin Best Practices
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">🔐</span>
                Security & Privacy
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Always verify identity before making account changes</li>
                <li>• Never share user data outside the platform</li>
                <li>• Use two-factor authentication</li>
                <li>• Review security logs regularly</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">⚡</span>
                Crisis Management
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Review crisis alerts immediately</li>
                <li>• Follow escalation protocol for severe cases</li>
                <li>• Document all crisis interventions</li>
                <li>• Coordinate with coach and user if needed</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">✅</span>
                Coach Approval Process
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Verify all certifications and licenses</li>
                <li>• Check professional references</li>
                <li>• Review specializations for platform fit</li>
                <li>• Approve within 2-3 days for best experience</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Platform Monitoring
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-2">
                <li>• Check dashboard metrics daily</li>
                <li>• Monitor user growth and engagement trends</li>
                <li>• Track coach-to-client ratio</li>
                <li>• Review payment processing status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-12 bg-red-50 dark:bg-gray-800 p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            Questions About Admin Features?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Contact the super admin team for technical support
          </p>
          <Button
            variant="outline"
            onClick={() => setLocation("/contact")}
            data-testid="button-contact-support"
          >
            Contact Super Admin Support
          </Button>
        </div>
      </div>
    </div>
  );
}
