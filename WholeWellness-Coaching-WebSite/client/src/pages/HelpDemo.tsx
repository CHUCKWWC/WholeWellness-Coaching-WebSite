import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Lightbulb, ArrowRight, Users, BookOpen, Gift } from 'lucide-react';
import HelpBubble from '@/components/HelpBubble';
import { ContextualHelpTrigger } from '@/components/HelpSystem';
import { useEmpatheticHelp } from '@/components/EmpatheticHelpProvider';

export default function HelpDemo() {
  const { showHelpFor } = useEmpatheticHelp();
  const [demoStep, setDemoStep] = useState(0);

  const demoScenarios = [
    {
      title: "New User Welcome",
      description: "Show supportive guidance for first-time users",
      context: "registration-welcome",
      trigger: () => showHelpFor("registration-welcome")
    },
    {
      title: "Donation Encouragement",
      description: "Gentle guidance for first-time donors",
      context: "donation-first-time",
      trigger: () => showHelpFor("donation-first-time")
    },
    {
      title: "Coaching Selection Help",
      description: "Supportive guidance for choosing coaching specialties",
      context: "coaching-selection",
      trigger: () => showHelpFor("coaching-selection")
    },
    {
      title: "Session Booking Support",
      description: "Encouraging help for booking first session",
      context: "first-session-booking",
      trigger: () => showHelpFor("first-session-booking")
    },
    {
      title: "Progress Celebration",
      description: "Celebratory guidance for tracking progress",
      context: "progress-tracking",
      trigger: () => showHelpFor("progress-tracking")
    },
    {
      title: "Difficult Moment Support",
      description: "Empathetic support during challenging times",
      context: "difficult-moment",
      trigger: () => showHelpFor("difficult-moment")
    },
    {
      title: "Overwhelmed User Help",
      description: "Gentle guidance for overwhelmed users",
      context: "onboarding-overwhelmed",
      trigger: () => showHelpFor("onboarding-overwhelmed")
    },
    {
      title: "Membership Benefits",
      description: "Informative guidance about membership perks",
      context: "membership-benefits",
      trigger: () => showHelpFor("membership-benefits")
    }
  ];

  const helpFeatures = [
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      title: "Empathetic Tone",
      description: "Help messages are crafted with understanding and compassion for the user's journey."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-blue-500" />,
      title: "Contextual Awareness",
      description: "Help appears at the right moment based on user behavior and current page context."
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
      title: "Actionable Guidance",
      description: "Each help bubble includes specific next steps and related resources."
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: "User-Centered Design",
      description: "Help bubbles are designed to be non-intrusive and respect user autonomy."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      title: "Educational Content",
      description: "Help includes related topics and learning resources for deeper understanding."
    },
    {
      icon: <Gift className="w-6 h-6 text-orange-500" />,
      title: "Celebratory Support",
      description: "Recognizes and celebrates user progress and achievements."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Empathetic Help System Demo
            </h1>
            <HelpBubble
              context="registration-welcome"
              trigger="hover"
              position="bottom"
              className="inline-block"
            />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our contextual help system designed to provide supportive, empathetic guidance 
            throughout the user's wellness journey.
          </p>
        </div>

        {/* Help Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Help System Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="mb-12" />

        {/* Interactive Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Interactive Help Demonstrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demoScenarios.map((scenario, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={scenario.trigger}
                    className="w-full"
                    variant={demoStep === index ? "default" : "outline"}
                  >
                    Trigger Help Bubble
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Example Integration */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Example Integration Scenarios
          </h2>
          <div className="space-y-6">
            {/* Registration Example */}
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">New User Registration</CardTitle>
                  <ContextualHelpTrigger 
                    context="registration-welcome" 
                    trigger="click"
                    position="left"
                  >
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  </ContextualHelpTrigger>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  When a new user completes registration, they receive a warm welcome message 
                  that acknowledges their courage to start their wellness journey.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Supportive Tone</Badge>
                  <Badge variant="secondary">Auto-triggered</Badge>
                  <Badge variant="secondary">3-second delay</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Donation Example */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">First-Time Donation</CardTitle>
                  <ContextualHelpTrigger 
                    context="donation-first-time" 
                    trigger="click"
                    position="left"
                  >
                    <Button variant="outline" size="sm">
                      <Gift className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  </ContextualHelpTrigger>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  First-time donors receive encouraging guidance that emphasizes the impact 
                  of their contribution, regardless of the amount.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Encouraging Tone</Badge>
                  <Badge variant="secondary">Click-triggered</Badge>
                  <Badge variant="secondary">Impact-focused</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Selection Example */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Coaching Specialty Selection</CardTitle>
                  <ContextualHelpTrigger 
                    context="coaching-selection" 
                    trigger="hover"
                    position="left"
                  >
                    <Button variant="outline" size="sm">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  </ContextualHelpTrigger>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Users selecting coaching specialties receive supportive guidance that 
                  validates their decision-making process and offers practical next steps.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Supportive Tone</Badge>
                  <Badge variant="secondary">Hover-triggered</Badge>
                  <Badge variant="secondary">Actionable Steps</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Difficult Moment Example */}
            <Card className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Support During Difficult Times</CardTitle>
                  <ContextualHelpTrigger 
                    context="difficult-moment" 
                    trigger="click"
                    position="left"
                  >
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Get Help
                    </Button>
                  </ContextualHelpTrigger>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Users who might be struggling receive empathetic support that acknowledges 
                  their challenges while providing hope and practical resources.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Empathetic Tone</Badge>
                  <Badge variant="secondary">Behavior-triggered</Badge>
                  <Badge variant="secondary">Crisis-aware</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Implementation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Smart Triggers</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-triggered based on user behavior patterns</li>
                <li>• Hover and click triggers for contextual help</li>
                <li>• Time-based delays for optimal timing</li>
                <li>• Page context awareness</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Personalization</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User history tracking (localStorage)</li>
                <li>• Dismissal state management</li>
                <li>• 24-hour cooldown periods</li>
                <li>• Membership level awareness</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}