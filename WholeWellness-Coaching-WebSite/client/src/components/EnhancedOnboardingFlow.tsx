import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  ClipboardList, 
  Target, 
  Calendar, 
  Upload,
  Video,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VideoUpload from "./VideoUpload";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  required: boolean;
}

interface EnhancedOnboardingFlowProps {
  type: "coach" | "client";
  onComplete?: (data: any) => void;
}

export default function EnhancedOnboardingFlow({ 
  type = "client",
  onComplete 
}: EnhancedOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const coachSteps: OnboardingStep[] = [
    {
      id: 0,
      title: "Personal Information",
      description: "Basic details and contact information",
      icon: UserPlus,
      completed: false,
      required: true
    },
    {
      id: 1,
      title: "Professional Background",
      description: "Credentials, experience, and specialties",
      icon: FileText,
      completed: false,
      required: true
    },
    {
      id: 2,
      title: "Introduction Video",
      description: "Record a brief introduction for clients",
      icon: Video,
      completed: false,
      required: true
    },
    {
      id: 3,
      title: "Documents Upload",
      description: "Resume, certifications, and credentials",
      icon: Upload,
      completed: false,
      required: true
    },
    {
      id: 4,
      title: "Goals & Approach",
      description: "Your coaching philosophy and methods",
      icon: Target,
      completed: false,
      required: true
    },
    {
      id: 5,
      title: "Availability Setup",
      description: "Set your schedule and booking preferences",
      icon: Calendar,
      completed: false,
      required: true
    }
  ];

  const clientSteps: OnboardingStep[] = [
    {
      id: 0,
      title: "Welcome",
      description: "Getting started with your wellness journey",
      icon: UserPlus,
      completed: false,
      required: true
    },
    {
      id: 1,
      title: "Health Assessment",
      description: "Current health status and concerns",
      icon: ClipboardList,
      completed: false,
      required: true
    },
    {
      id: 2,
      title: "Goal Setting",
      description: "What you want to achieve",
      icon: Target,
      completed: false,
      required: true
    },
    {
      id: 3,
      title: "Preferences",
      description: "Communication and coaching preferences",
      icon: Calendar,
      completed: false,
      required: true
    }
  ];

  const steps = type === "coach" ? coachSteps : clientSteps;
  const progress = (completedSteps.size / steps.length) * 100;

  const handleStepComplete = (stepId: number, data: any) => {
    setFormData(prev => ({
      ...prev,
      [`step_${stepId}`]: data
    }));
    
    setCompletedSteps(prev => new Set(prev).add(stepId));
    
    toast({
      title: "Step completed",
      description: `${steps[stepId].title} has been saved.`,
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (completedSteps.size === steps.filter(s => s.required).length) {
      onComplete?.(formData);
      toast({
        title: "Onboarding complete!",
        description: "Welcome to WholeWellness Coaching!",
      });
    } else {
      toast({
        title: "Please complete all required steps",
        description: "Some required information is still missing.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    if (type === "coach") {
      switch (currentStep) {
        case 0: // Personal Information
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="Enter your phone number" />
              </div>
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself and your coaching background" rows={4} />
              </div>
            </div>
          );

        case 1: // Professional Background
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="credentials">Credentials & Certifications</Label>
                <Textarea id="credentials" placeholder="List your relevant credentials and certifications" rows={3} />
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Textarea id="experience" placeholder="Describe your coaching and professional experience" rows={3} />
              </div>
              <div>
                <Label>Specialties</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Weight Management", "Relationship Coaching", "Stress Management", "Career Coaching", "Life Transitions", "Wellness Coaching"].map((specialty) => (
                    <Button key={specialty} variant="outline" size="sm" className="justify-start">
                      {specialty}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );

        case 2: // Introduction Video
          return (
            <div className="space-y-4">
              <VideoUpload
                title="Introduction Video"
                description="Record a 2-3 minute introduction video for potential clients"
                onVideoUploaded={(url) => console.log('Video uploaded:', url)}
                maxSize={100}
              />
            </div>
          );

        case 3: // Documents Upload
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input type="file" accept=".pdf,.doc,.docx" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input type="file" accept=".pdf,.jpg,.png" multiple />
                  </CardContent>
                </Card>
              </div>
            </div>
          );

        case 4: // Goals & Approach
          return (
            <div className="space-y-4">
              <div>
                <Label htmlFor="philosophy">Coaching Philosophy</Label>
                <Textarea id="philosophy" placeholder="What's your approach to coaching?" rows={3} />
              </div>
              <div>
                <Label htmlFor="methods">Methods & Techniques</Label>
                <Textarea id="methods" placeholder="What methods and techniques do you use?" rows={3} />
              </div>
            </div>
          );

        case 5: // Availability Setup
          return (
            <div className="space-y-4">
              <div>
                <Label>Available Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <Button key={day} variant="outline" size="sm">
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input id="startTime" type="time" />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input id="endTime" type="time" />
                </div>
              </div>
            </div>
          );

        default:
          return <div>Step not found</div>;
      }
    } else {
      // Client steps
      switch (currentStep) {
        case 0: // Welcome
          return (
            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-bold">Welcome to WholeWellness!</h3>
              <p className="text-muted-foreground">
                We're excited to support you on your wellness journey. This onboarding process will help us understand your needs and match you with the perfect coach.
              </p>
            </div>
          );

        default:
          return <div>Client step content</div>;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {type === "coach" ? "Coach" : "Client"} Onboarding
          </h2>
          <Badge variant="secondary">
            {completedSteps.size} of {steps.length} completed
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-center mb-8 overflow-x-auto">
        <div className="flex space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === index;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  isCurrent
                    ? "bg-primary/10 border-2 border-primary"
                    : isCompleted
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-gray-50 border-2 border-gray-200"
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`p-2 rounded-full ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent ? "text-primary" : isCompleted ? "text-green-600" : "text-gray-600"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <p className="text-muted-foreground">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button
            onClick={() => handleStepComplete(currentStep, {})}
            variant="outline"
          >
            Save Progress
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleFinish}>
              Complete Onboarding
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}