import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, Shield, Clock, Users, Zap } from "lucide-react";
import AICoachingChat from "@/components/AICoachingChat";
import CoachingTools from "@/components/CoachingTools";

export default function AICoaching() {
  const [showChat, setShowChat] = useState(false);

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Specialized AI Coaches",
      description: "Choose from expert AI coaches trained in finance, relationships, career, health, mindset, and life transitions."
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Personalized Conversations",
      description: "Engage in meaningful, contextual conversations tailored to your specific goals and challenges."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safe & Confidential",
      description: "All conversations are private and secure, with medical disclaimers ensuring responsible guidance."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Access coaching support whenever you need it, day or night, at your own pace."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Human Coaching Integration",
      description: "AI coaching complements our human coaching services for a comprehensive support system."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Insights",
      description: "Get immediate feedback, strategies, and actionable advice for your personal growth journey."
    }
  ];

  const coachingAreas = [
    {
      name: "Financial Wellness",
      description: "Budgeting, debt management, savings strategies, and building healthy money habits",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "Relationships",
      description: "Communication skills, conflict resolution, boundary setting, and building healthy connections",
      color: "bg-pink-100 text-pink-800"
    },
    {
      name: "Career Development",
      description: "Job search strategies, professional growth, career transitions, and workplace confidence",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Health & Wellness",
      description: "Nutrition guidance, exercise motivation, stress management, and healthy lifestyle habits",
      color: "bg-emerald-100 text-emerald-800"
    },
    {
      name: "Mindset & Mental Health",
      description: "Building resilience, overcoming limiting beliefs, emotional regulation, and personal growth",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Life Transitions",
      description: "Divorce recovery, grief support, career changes, and navigating major life shifts",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowChat(false)}
              className="mb-4"
            >
              ← Back to AI Coaching Overview
            </Button>
          </div>
          <AICoachingChat />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full">
              <Brain className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            AI Coaching Services
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Access personalized coaching support 24/7 with our specialized AI coaches. 
            Get instant guidance for your personal growth journey in areas that matter most to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setShowChat(true)}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Start AI Coaching Session
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Learn More About AI Coaching
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Coaching?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI coaching platform combines cutting-edge technology with proven coaching methodologies 
              to provide personalized support for your unique journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Areas Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Specialized Coaching Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI coaches are specially trained in different areas of personal development 
              to provide targeted support for your specific needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coachingAreas.map((area, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <Badge className={area.color}>
                      Specialized
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {area.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Disclaimer Section */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-amber-200 bg-white">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-xl text-amber-800">
                  Important Medical Disclaimer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our AI coaching services are designed for general wellness and personal development support. 
                <strong> These services are not a substitute for professional medical, mental health, or therapeutic care.</strong>
              </p>
              <div className="bg-amber-100 p-4 rounded-lg">
                <p className="text-amber-800 font-medium text-sm">
                  Before starting any coaching session, you will be required to read and accept our medical disclaimer. 
                  If you have specific health concerns, mental health needs, or are in crisis, please consult with 
                  qualified healthcare professionals.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Emergency: If you are in crisis or having thoughts of self-harm, please call 911 or 988 (Suicide & Crisis Lifeline) immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your AI Coaching Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Choose your specialized AI coach and begin personalized conversations 
            that support your growth and transformation.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowChat(true)}
            className="bg-white text-primary hover:bg-gray-100"
          >
            Start Your First Session
          </Button>
        </div>
      </section>
    </div>
  );
}