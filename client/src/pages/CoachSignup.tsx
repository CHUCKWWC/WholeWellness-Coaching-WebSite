import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Heart, Users, Calendar, DollarSign, Award, Globe } from "lucide-react";

export default function CoachSignup() {
  const [, setLocation] = useLocation();

  const benefits = [
    {
      icon: Heart,
      title: "Make a Difference",
      description: "Support underserved women through life's challenges and transitions"
    },
    {
      icon: DollarSign,
      title: "Competitive Compensation",
      description: "Earn $50-100 per session with flexible payment options"
    },
    {
      icon: Calendar,
      title: "Set Your Schedule",
      description: "Work the hours that fit your lifestyle and commitments"
    },
    {
      icon: Globe,
      title: "Work Remotely",
      description: "Coach clients from anywhere through our secure video platform"
    },
    {
      icon: Users,
      title: "Join a Community",
      description: "Connect with like-minded coaches dedicated to wellness"
    },
    {
      icon: Award,
      title: "Professional Growth",
      description: "Access training, resources, and continuing education opportunities"
    }
  ];

  const requirements = [
    "Certified life coach, therapist, counselor, or related credential",
    "Minimum 2 years of coaching or counseling experience",
    "Experience working with women and trauma-informed care",
    "Reliable internet connection for video sessions",
    "Commitment to our mission of serving underserved communities",
    "Pass background check and reference verification"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Become a Whole Wellness Coach
            </h1>
            <p className="text-xl mb-8 opacity-95">
              Join our team of compassionate professionals making a real difference 
              in the lives of women who need it most.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setLocation('/coach-onboarding')}
              className="text-lg px-8 py-6"
            >
              Start Your Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Coach with Whole Wellness?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <benefit.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              What We're Looking For
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Coach Requirements</CardTitle>
                <CardDescription>
                  We maintain high standards to ensure quality support for our clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-2 w-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Simple Application Process
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Complete Online Application</h3>
                  <p className="text-gray-600">Fill out our comprehensive application form with your qualifications and experience</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Interview & Assessment</h3>
                  <p className="text-gray-600">Participate in a video interview and coaching skills assessment</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Background Verification</h3>
                  <p className="text-gray-600">Complete background check and credential verification</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Onboarding & Training</h3>
                  <p className="text-gray-600">Complete our orientation program and start accepting clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl mb-8 opacity-95">
              Join our mission to provide accessible wellness coaching to women who need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setLocation('/coach-onboarding')}
                className="text-lg px-8 py-6"
              >
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/10 text-white border-white hover:bg-white hover:text-purple-600"
                >
                  Have Questions?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}