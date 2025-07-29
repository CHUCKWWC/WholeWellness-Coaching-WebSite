import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Brain, Sparkles } from "lucide-react";
import DiscoveryQuiz from '@/components/DiscoveryQuiz';

export default function DigitalOnboarding() {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return <DiscoveryQuiz />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Badge className="bg-purple-100 text-purple-800 mb-4">
              🌟 Your Journey Begins Here
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              WholeWellness Discovery Experience
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you arrive unsure or clear about your goals, our personalized roadmap 
              ensures you find the right coaching approach for your unique journey.
            </p>
          </div>
        </div>

        {/* What to Expect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Identify Your Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Select up to 3 key areas where you'd like support from our comprehensive list of life challenges and goals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Get Personalized Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our smart matching system recommends the perfect combination of coaches, AI tools, and support based on your responses.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Choose Your Path</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Select from AI Coaching ($299), Live Coaching ($599), or Combined packages ($799) based on your preferences and readiness.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Coaching Options Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Our Coaching Approaches</CardTitle>
            <CardDescription className="text-center">
              We'll help you choose the perfect fit based on your quiz results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-2 text-blue-900">🤖 AI Coaching</h3>
                <p className="text-sm text-blue-800 mb-3">24/7 availability, personalized guidance, 6 sessions for $299</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Immediate responses</li>
                  <li>• Privacy and comfort</li>
                  <li>• Self-paced exploration</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-green-900">👥 Live Coaching</h3>
                  <Badge className="bg-green-200 text-green-800 text-xs">Popular</Badge>
                </div>
                <p className="text-sm text-green-800 mb-3">Human connection, certified coaches, 6 sessions for $599</p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Personal relationship</li>
                  <li>• Real-time interaction</li>
                  <li>• Professional expertise</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                <h3 className="font-semibold mb-2 text-purple-900">🔄 Combined Approach</h3>
                <p className="text-sm text-purple-800 mb-3">Best of both worlds, 12 total sessions for $799</p>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Maximum flexibility</li>
                  <li>• Comprehensive support</li>
                  <li>• $99 savings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
            onClick={() => setShowQuiz(true)}
          >
            Start Your Discovery Quiz
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              Takes 3-5 minutes • Personalized recommendations • No commitment required
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-gray-600"
            >
              Skip Discovery Quiz
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">Trusted by women on their healing journey</p>
          <div className="flex justify-center space-x-8 text-xs text-gray-500">
            <span>✓ HIPAA Compliant</span>
            <span>✓ Trauma-Informed</span>
            <span>✓ Licensed Professionals</span>
            <span>✓ 24/7 Crisis Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}