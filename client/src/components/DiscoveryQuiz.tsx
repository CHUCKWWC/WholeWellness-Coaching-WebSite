import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Brain, Briefcase, DollarSign, Activity, Shield, Compass, Clock, Baby, User, ArrowRight, CheckCircle } from "lucide-react";

interface QuizStep {
  id: number;
  title: string;
  description: string;
  type: 'multiple' | 'single' | 'adaptive';
}

interface CoachMatch {
  specialty: string;
  description: string;
  priority: 'primary' | 'supporting';
  icon: React.ReactNode;
}

interface QuizResults {
  currentNeeds: string[];
  situationDetails: Record<string, string>;
  supportPreference: string;
  readinessLevel: string;
  recommendedPath: {
    coaches: CoachMatch[];
    aiTools: string[];
    groupSupport: boolean;
    pricing: {
      live: number;
      ai: number;
      combined: number;
    };
  };
}

const currentNeedsOptions = [
  { id: 'emotions', label: 'Managing emotions (stress, anxiety, overwhelm)', icon: <Brain className="h-5 w-5" /> },
  { id: 'relationships', label: 'Relationship issues (dating, marriage, family, divorce)', icon: <Heart className="h-5 w-5" /> },
  { id: 'career', label: 'Career stagnation, burnout, or transitions', icon: <Briefcase className="h-5 w-5" /> },
  { id: 'financial', label: 'Financial stress or goals', icon: <DollarSign className="h-5 w-5" /> },
  { id: 'health', label: 'Health and wellness', icon: <Activity className="h-5 w-5" /> },
  { id: 'crisis', label: 'Navigating a life crisis (grief, identity, trauma)', icon: <Shield className="h-5 w-5" /> },
  { id: 'purpose', label: 'Feeling unfulfilled / purpose-seeking', icon: <Compass className="h-5 w-5" /> },
  { id: 'productivity', label: 'Productivity or time management', icon: <Clock className="h-5 w-5" /> },
  { id: 'trauma', label: 'Trauma or domestic violence recovery', icon: <Shield className="h-5 w-5" /> },
  { id: 'parenting', label: 'Parenting or co-parenting', icon: <Baby className="h-5 w-5" /> },
  { id: 'confidence', label: 'Low self-worth or confidence', icon: <User className="h-5 w-5" /> },
];

const supportPreferences = [
  { id: 'live', label: 'I want to talk to a real coach', description: 'Live Coaching Package - $599' },
  { id: 'ai', label: 'I prefer tools to explore on my own', description: 'AI Coaching Package - $299' },
  { id: 'mix', label: 'A mix of both', description: 'Combined Package - $799' },
  { id: 'unsure', label: "I'm not sure—help me explore options", description: 'We\'ll recommend the best fit' },
];

const readinessLevels = [
  { 
    id: 'overwhelmed', 
    label: "I'm overwhelmed and unsure where to begin", 
    description: 'Gentle Entry: AI Tools + Intro Session',
    color: 'bg-amber-100 text-amber-800'
  },
  { 
    id: 'managing', 
    label: "I'm managing, just need direction", 
    description: 'Intermediate Path: 1–2 Coach Matches',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    id: 'motivated', 
    label: "I'm motivated and ready to change", 
    description: 'Action Coaching Plan',
    color: 'bg-green-100 text-green-800'
  },
  { 
    id: 'curious', 
    label: "I'm curious and open to explore", 
    description: 'Discovery & Vision Mapping Track',
    color: 'bg-purple-100 text-purple-800'
  },
];

export default function DiscoveryQuiz() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [situationDetails, setSituationDetails] = useState<Record<string, string>>({});
  const [supportPreference, setSupportPreference] = useState('');
  const [readinessLevel, setReadinessLevel] = useState('');
  const [results, setResults] = useState<QuizResults | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();

  const saveQuizResults = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/discovery-quiz', data);
    },
    onSuccess: () => {
      toast({
        title: "Quiz Completed",
        description: "Your personalized coaching recommendations are ready!",
      });
    },
    onError: (error) => {
      console.error('Failed to save quiz results:', error);
      // Continue to show results even if save fails
    },
  });

  const generateRecommendations = (needs: string[], details: Record<string, string>, support: string, readiness: string): QuizResults => {
    const coaches: CoachMatch[] = [];
    const aiTools: string[] = [];
    let groupSupport = false;

    // Generate coach matches based on needs
    if (needs.includes('relationships')) {
      coaches.push({
        specialty: 'Relationship Coach',
        description: 'Boundaries, communication, and healthy relationships',
        priority: 'primary',
        icon: <Heart className="h-5 w-5" />
      });
    }

    if (needs.includes('career')) {
      coaches.push({
        specialty: 'Career Coach',
        description: 'Resume building, goals, and career confidence',
        priority: needs.includes('relationships') ? 'supporting' : 'primary',
        icon: <Briefcase className="h-5 w-5" />
      });
    }

    if (needs.includes('confidence') || needs.includes('emotions')) {
      coaches.push({
        specialty: 'Mindset Coach',
        description: 'Resilience, self-belief, and emotional regulation',
        priority: 'supporting',
        icon: <Brain className="h-5 w-5" />
      });
    }

    if (needs.includes('trauma') || needs.includes('crisis')) {
      coaches.push({
        specialty: 'Trauma-Informed Coach',
        description: 'Specialized support for trauma recovery',
        priority: 'primary',
        icon: <Shield className="h-5 w-5" />
      });
      groupSupport = true;
    }

    if (needs.includes('financial')) {
      coaches.push({
        specialty: 'Financial Coach',
        description: 'Budgeting, debt management, and financial planning',
        priority: 'supporting',
        icon: <DollarSign className="h-5 w-5" />
      });
    }

    if (needs.includes('purpose')) {
      coaches.push({
        specialty: 'Life Purpose Coach',
        description: 'Identity exploration and purpose discovery',
        priority: 'primary',
        icon: <Compass className="h-5 w-5" />
      });
    }

    // Add AI tools based on readiness and preferences
    if (support === 'ai' || support === 'mix' || readiness === 'overwhelmed') {
      aiTools.push('Daily AI Reflection Journals');
      aiTools.push('Goal Mapping Tools');
      aiTools.push('Progress Tracking Dashboard');
    }

    if (readiness === 'overwhelmed') {
      aiTools.push('Gentle Check-in Assistant');
      groupSupport = true;
    }

    return {
      currentNeeds: needs,
      situationDetails: details,
      supportPreference: support,
      readinessLevel: readiness,
      recommendedPath: {
        coaches,
        aiTools,
        groupSupport,
        pricing: {
          live: 599,
          ai: 299,
          combined: 799
        }
      }
    };
  };

  const handleStepComplete = () => {
    if (currentStep === 5) {
      // Generate and save results
      const quizResults = generateRecommendations(selectedNeeds, situationDetails, supportPreference, readinessLevel);
      setResults(quizResults);
      
      // Save to backend
      saveQuizResults.mutate({
        sessionId,
        currentNeeds: selectedNeeds,
        situationDetails,
        supportPreference,
        readinessLevel,
        recommendedPath: quizResults.recommendedPath,
        completed: true
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedNeeds.length > 0 && selectedNeeds.length <= 3;
      case 2: return true; // Situation details are optional
      case 3: return supportPreference !== '';
      case 4: return readinessLevel !== '';
      default: return true;
    }
  };

  const progress = ((currentStep - 1) / 4) * 100;

  if (results) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Coaching Match Results</h1>
            <p className="text-lg text-gray-600">Personalized recommendations based on your responses</p>
          </div>
        </div>

        {/* Recommended Coaches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              Recommended Coaching Team
            </CardTitle>
            <CardDescription>
              Based on your selections: {results.currentNeeds.join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendedPath.coaches.map((coach, index) => (
                <div key={index} className={`p-4 rounded-lg border ${coach.priority === 'primary' ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600">{coach.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{coach.specialty}</h3>
                        <Badge variant={coach.priority === 'primary' ? 'default' : 'secondary'}>
                          {coach.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{coach.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Options */}
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Coaching Package</CardTitle>
            <CardDescription>Select the option that fits your preferences and budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                results.supportPreference === 'ai' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">AI Coaching Package</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">${results.recommendedPath.pricing.ai}</div>
                  <p className="text-sm text-gray-600 mb-4">6 AI coaching sessions</p>
                  <Button 
                    className="w-full" 
                    variant={results.supportPreference === 'ai' ? 'default' : 'outline'}
                    onClick={() => window.location.href = '/subscribe?plan=ai_coaching'}
                  >
                    Start AI Coaching
                  </Button>
                </div>
              </div>

              <div className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                results.supportPreference === 'live' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <Badge className="mb-2">Most Popular</Badge>
                  <h3 className="font-semibold mb-2">Live Coaching Package</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">${results.recommendedPath.pricing.live}</div>
                  <p className="text-sm text-gray-600 mb-4">6 live coaching sessions</p>
                  <Button 
                    className="w-full" 
                    variant={results.supportPreference === 'live' ? 'default' : 'outline'}
                    onClick={() => window.location.href = '/subscribe?plan=live_coaching'}
                  >
                    Start Live Coaching
                  </Button>
                </div>
              </div>

              <div className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                results.supportPreference === 'mix' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Combined Package</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-2">${results.recommendedPath.pricing.combined}</div>
                  <p className="text-sm text-gray-600 mb-4">6 AI + 6 live sessions</p>
                  <Button 
                    className="w-full" 
                    variant={results.supportPreference === 'mix' ? 'default' : 'outline'}
                    onClick={() => window.location.href = '/subscribe?plan=combined'}
                  >
                    Start Combined
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        {(results.recommendedPath.aiTools.length > 0 || results.recommendedPath.groupSupport) && (
          <Card>
            <CardHeader>
              <CardTitle>Bonus Resources Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.recommendedPath.aiTools.map((tool, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{tool}</span>
                  </div>
                ))}
                {results.recommendedPath.groupSupport && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Group Discovery Call Access</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Message */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Thank you for exploring WholeWellness
          </h2>
          <p className="text-gray-600 mb-4">
            You're not alone—your healing, clarity, and growth journey starts here. Let's take your next step together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => window.location.href = '/ai-coaching'}>
              Try AI Chat Free
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/digital-onboarding'}>
              Book Discovery Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🌟 WholeWellness Discovery Roadmap
        </h1>
        <p className="text-lg text-gray-600">
          Let's identify your needs and find the perfect coaching approach for your journey
        </p>
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 mt-2">Step {currentStep} of 4</p>
        </div>
      </div>

      {/* Step 1: Current Needs */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>🧭 Step 1: Identify Your Current Needs or Challenges</CardTitle>
            <CardDescription>Select up to 3 areas where you'd like support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentNeedsOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedNeeds.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked && selectedNeeds.length < 3) {
                      setSelectedNeeds([...selectedNeeds, option.id]);
                    } else if (!checked) {
                      setSelectedNeeds(selectedNeeds.filter(need => need !== option.id));
                    }
                  }}
                  disabled={!selectedNeeds.includes(option.id) && selectedNeeds.length >= 3}
                />
                <label htmlFor={option.id} className="flex items-center space-x-2 cursor-pointer">
                  {option.icon}
                  <span className="text-sm">{option.label}</span>
                </label>
              </div>
            ))}
            <div className="text-xs text-gray-500 mt-4">
              Selected: {selectedNeeds.length}/3
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Situation Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>🔁 Step 2: Tell Us More About Your Situation</CardTitle>
            <CardDescription>This helps us provide more personalized recommendations (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="situation">What describes your current situation best?</Label>
                <textarea
                  id="situation"
                  placeholder="Tell us more about what you're experiencing..."
                  className="w-full p-3 mt-2 border rounded-lg resize-none h-24"
                  value={situationDetails.situation || ''}
                  onChange={(e) => setSituationDetails({
                    ...situationDetails,
                    situation: e.target.value
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Support Preference */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>🧠 Step 3: What Type of Support Feels Right?</CardTitle>
            <CardDescription>Choose the approach that resonates most with you</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={supportPreference} onValueChange={setSupportPreference}>
              {supportPreferences.map((pref) => (
                <div key={pref.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={pref.id} id={pref.id} />
                  <div className="flex-1">
                    <Label htmlFor={pref.id} className="font-medium cursor-pointer">
                      {pref.label}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">{pref.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Readiness Level */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>📈 Step 4: How Ready Are You?</CardTitle>
            <CardDescription>This helps us match the right pace and approach for you</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={readinessLevel} onValueChange={setReadinessLevel}>
              {readinessLevels.map((level) => (
                <div key={level.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={level.id} id={level.id} />
                  <div className="flex-1">
                    <Label htmlFor={level.id} className="font-medium cursor-pointer">
                      {level.label}
                    </Label>
                    <Badge className={`${level.color} text-xs mt-1`}>
                      {level.description}
                    </Badge>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          onClick={handleStepComplete}
          disabled={!canProceed()}
        >
          {currentStep === 4 ? 'Get My Results' : 'Next Step'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}