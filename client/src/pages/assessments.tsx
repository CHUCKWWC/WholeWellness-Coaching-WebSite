import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AssessmentForm } from "@/components/assessment-form";
import { 
  ClipboardList, 
  Heart, 
  Brain, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface AssessmentType {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
  fields: any;
  coachTypes: string[];
  isActive: boolean;
}

interface UserAssessment {
  id: string;
  userId: string;
  assessmentTypeId: string;
  responses: any;
  summary?: string;
  tags: string[];
  completedAt: string;
  assessmentType: {
    name: string;
    displayName: string;
    category: string;
  };
}

const categoryIcons = {
  health: Heart,
  relationships: Users,
  mental_health: Brain,
  career: ClipboardList,
  default: ClipboardList
};

const categoryColors = {
  health: "bg-green-100 text-green-800",
  relationships: "bg-pink-100 text-pink-800", 
  mental_health: "bg-blue-100 text-blue-800",
  career: "bg-purple-100 text-purple-800",
  default: "bg-gray-100 text-gray-800"
};

export default function Assessments() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Get available assessment types
  const { data: assessmentTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ["/api/assessments/assessment-types"],
    enabled: isAuthenticated,
  });

  // Get user's completed assessments
  const { data: userAssessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments/user", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Submit assessment mutation
  const submitAssessment = useMutation({
    mutationFn: async (data: { assessmentTypeId: string; responses: any }) => {
      return apiRequest("POST", "/api/assessments/submit", data);
    },
    onSuccess: () => {
      toast({
        title: "Assessment Completed",
        description: "Your assessment has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments/user", user?.id] });
      setShowForm(false);
      setSelectedAssessment(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    },
  });

  const handleStartAssessment = (assessmentType: AssessmentType) => {
    setSelectedAssessment(assessmentType);
    setShowForm(true);
  };

  const handleSubmitAssessment = (responses: any) => {
    if (!selectedAssessment) return;
    
    submitAssessment.mutate({
      assessmentTypeId: selectedAssessment.id,
      responses,
    });
  };

  const isAssessmentCompleted = (assessmentTypeId: string) => {
    return userAssessments.some((assessment: UserAssessment) => 
      assessment.assessmentTypeId === assessmentTypeId
    );
  };

  const getCompletionProgress = () => {
    if (assessmentTypes.length === 0) return 0;
    return (userAssessments.length / assessmentTypes.length) * 100;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your assessments and begin your wellness journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/api/login'}
            >
              Log In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForm && selectedAssessment) {
    return (
      <AssessmentForm
        assessmentType={selectedAssessment}
        onSubmit={handleSubmitAssessment}
        onCancel={() => {
          setShowForm(false);
          setSelectedAssessment(null);
        }}
        isSubmitting={submitAssessment.isPending}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Wellness Assessments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete these personalized assessments to help our AI coaches and human professionals 
            provide you with the most effective support for your journey.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Assessment Progress
            </CardTitle>
            <CardDescription>
              Complete all assessments to unlock personalized coaching recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Completed: {userAssessments.length} of {assessmentTypes.length}</span>
                <span>{Math.round(getCompletionProgress())}%</span>
              </div>
              <Progress value={getCompletionProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Assessment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {typesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            assessmentTypes.map((assessmentType: AssessmentType) => {
              const IconComponent = categoryIcons[assessmentType.category as keyof typeof categoryIcons] || categoryIcons.default;
              const isCompleted = isAssessmentCompleted(assessmentType.id);
              
              return (
                <Card 
                  key={assessmentType.id} 
                  className={`transition-all duration-200 hover:shadow-lg ${
                    isCompleted ? 'ring-2 ring-green-200 bg-green-50' : 'hover:shadow-md'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{assessmentType.displayName}</CardTitle>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <CardDescription>{assessmentType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Badge 
                        variant="secondary" 
                        className={categoryColors[assessmentType.category as keyof typeof categoryColors] || categoryColors.default}
                      >
                        {assessmentType.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Helpful for:</strong> {assessmentType.coachTypes.join(', ')}
                      </div>
                      
                      <Button 
                        onClick={() => handleStartAssessment(assessmentType)}
                        className="w-full"
                        variant={isCompleted ? "outline" : "default"}
                      >
                        {isCompleted ? "Retake Assessment" : "Start Assessment"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Completed Assessments */}
        {userAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Completed Assessments
              </CardTitle>
              <CardDescription>
                View your assessment history and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userAssessments.map((assessment: UserAssessment) => (
                  <div 
                    key={assessment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{assessment.assessmentType.displayName}</h4>
                      <p className="text-sm text-gray-600">
                        Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                      </p>
                      {assessment.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {assessment.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}