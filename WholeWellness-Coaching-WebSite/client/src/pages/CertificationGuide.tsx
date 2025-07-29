import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Users, 
  Award, 
  Download, 
  Play,
  FileText,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Globe,
  Mail,
  RefreshCw
} from "lucide-react";

export default function CertificationGuide() {
  const steps = [
    {
      number: 1,
      title: "Go to the Website",
      description: "Open your web browser and type: wholewellnesscoaching.org",
      icon: Globe,
      details: [
        "Use Chrome, Safari, Firefox, or Edge",
        "Press Enter after typing the website address",
        "Wait for the page to load completely"
      ]
    },
    {
      number: 2,
      title: "Create Your Account",
      description: "Sign up for a new account or log in if you already have one",
      icon: Users,
      details: [
        "New users: Click 'Sign Up' and fill out the form",
        "Existing users: Click 'Login' and enter your email/password",
        "Check your email for confirmation if signing up"
      ]
    },
    {
      number: 3,
      title: "Find Certification Courses",
      description: "Click on your name in the top right corner, then select 'Certification Courses'",
      icon: BookOpen,
      details: [
        "Look for your profile picture or name",
        "Click to open the dropdown menu",
        "Select 'Certification Courses' from the list"
      ]
    },
    {
      number: 4,
      title: "Choose Your Course",
      description: "Browse available courses and read the descriptions",
      icon: Award,
      details: [
        "Advanced Wellness Coaching - Help people feel better overall",
        "Nutrition Coaching - Learn about healthy eating",
        "Relationship Counseling - Help with relationship problems",
        "Behavior Change - Help people change bad habits"
      ]
    },
    {
      number: 5,
      title: "Enroll in Course",
      description: "Click 'Enroll Now' and complete payment if required",
      icon: CheckCircle,
      details: [
        "Read course details carefully",
        "Check the price and course length",
        "Use a credit card for payment",
        "Wait for enrollment confirmation"
      ]
    },
    {
      number: 6,
      title: "Access Course Materials",
      description: "View your enrolled courses and start learning",
      icon: Play,
      details: [
        "Go to 'My Enrollments' tab",
        "Click 'Continue Learning' on your course",
        "Complete modules in order",
        "Track your progress as you go"
      ]
    },
    {
      number: 7,
      title: "View Course Files",
      description: "Access documents, videos, and worksheets in the 'Course Files' tab",
      icon: FileText,
      details: [
        "Click 'Course Files' tab",
        "Browse folders for different materials",
        "Download files to your computer",
        "Search for specific documents"
      ]
    },
    {
      number: 8,
      title: "Get Your Certificate",
      description: "Complete all modules to earn your certificate",
      icon: Download,
      details: [
        "Finish all course sections",
        "Go to 'My Certificates' tab",
        "Download your certificate",
        "Print it for your records"
      ]
    }
  ];

  const courses = [
    {
      title: "Advanced Wellness Coaching",
      description: "Learn how to help people feel better overall",
      duration: "40 hours",
      price: "$799",
      level: "Intermediate"
    },
    {
      title: "Nutrition Coaching",
      description: "Learn about healthy eating and meal planning",
      duration: "25 hours", 
      price: "$599",
      level: "Beginner"
    },
    {
      title: "Relationship Counseling",
      description: "Learn how to help people with relationship problems",
      duration: "60 hours",
      price: "$1,299",
      level: "Advanced"
    },
    {
      title: "Behavior Change",
      description: "Learn how to help people change bad habits",
      duration: "30 hours",
      price: "$699", 
      level: "Intermediate"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Access Certification Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Simple step-by-step instructions to help you get started with our online certification courses
          </p>
        </div>

        {/* What You Need Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              What You Need Before Starting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-1">Internet Connection</h3>
                <p className="text-sm text-gray-600">Computer, tablet, or phone with internet</p>
              </div>
              <div className="text-center p-4">
                <Mail className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold mb-1">Email Address</h3>
                <p className="text-sm text-gray-600">For account creation and updates</p>
              </div>
              <div className="text-center p-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold mb-1">Password</h3>
                <p className="text-sm text-gray-600">Something you can remember</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Instructions */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Step-by-Step Instructions
          </h2>
          
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <CardTitle className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                        {step.number}
                      </div>
                      <Icon className="h-6 w-6 text-blue-600" />
                      <span>{step.title}</span>
                    </CardTitle>
                    <CardDescription className="text-base ml-13">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-2 ml-13">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Available Courses */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Available Courses
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{course.duration}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                    <Badge className="bg-green-100 text-green-800">{course.price}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Help Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Email us at: <strong>hello@wholewellnesscoaching.org</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Include your email address and describe your problem clearly
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Technical Problems?</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Refresh the page (press F5)</li>
                  <li>• Try a different browser</li>
                  <li>• Check your internet connection</li>
                  <li>• Contact support if problems continue</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Important Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Remember:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Save your login information safely</li>
                  <li>• Complete modules in order</li>
                  <li>• Take your time learning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Course Files:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Materials are stored safely online</li>
                  <li>• You can search for specific documents</li>
                  <li>• Access files anytime, even after completion</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <a href="/coach-certifications">
              Start Your Certification Journey
            </a>
          </Button>
        </div>
        
      </div>
    </div>
  );
}