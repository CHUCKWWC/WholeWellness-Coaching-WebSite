import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

interface Program {
  id: string;
  userId: string;
  assessmentType: string;
  status: string;
  completionPercentage: number;
  paid: boolean;
  paymentIntentId: string | null;
  responses: Record<string, any>;
  result: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const ASSESSMENT_TITLES: Record<string, string> = {
  wellness_personality: "Wellness Personality Assessment",
  career_alignment: "Career Alignment Analysis",
  relationship_patterns: "Relationship Patterns Assessment",
  stress_resilience: "Stress & Resilience Profile",
  nutrition_lifestyle: "Nutrition & Lifestyle Analysis"
};

export default function AssessmentResults() {
  const [, params] = useRoute("/assessments/results/:id");
  const [, setLocation] = useLocation();
  const programId = params?.id;

  // Fetch all programs and find the one we need
  const { data: programs = [], isLoading, error } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
  });

  const program = programs.find(p => p.id === programId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading your results...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Assessment not found</p>
            <Button onClick={() => setLocation('/assessments')} className="w-full">
              Return to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assessmentTitle = ASSESSMENT_TITLES[program.assessmentType] || "Assessment";
  const responses = program.responses || {};
  const responseEntries = Object.entries(responses);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/assessments')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessments
          </Button>
        </div>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{assessmentTitle}</CardTitle>
                <CardDescription>
                  Completed on {new Date(program.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <div className="flex gap-2 mt-4">
              <Badge variant="outline">
                {program.paid ? 'Paid Assessment' : 'Free Assessment'}
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                Completed
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {/* Your Responses */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Responses</h3>
                
                {responseEntries.length > 0 ? (
                  <div className="space-y-4">
                    {responseEntries.map(([key, value], index) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Question {index + 1}: {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-gray-900">
                          {Array.isArray(value) 
                            ? value.join(', ') 
                            : typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No responses recorded for this assessment.
                  </p>
                )}
              </div>

              {/* Results/Insights Section */}
              {program.result && Object.keys(program.result).length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Insights & Recommendations</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700">
                      {typeof program.result === 'string' 
                        ? program.result 
                        : JSON.stringify(program.result, null, 2)
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-teal-700">1</span>
                    </div>
                    <p className="text-gray-700">Share your results with a coach for personalized guidance</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-teal-700">2</span>
                    </div>
                    <p className="text-gray-700">Explore our AI coaching for ongoing support</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-teal-700">3</span>
                    </div>
                    <p className="text-gray-700">Take additional assessments to gain more insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <Button onClick={() => setLocation('/assessments')} variant="outline" className="flex-1">
                View All Assessments
              </Button>
              <Button onClick={() => setLocation('/ai-coaching')} className="flex-1">
                Talk to AI Coach
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
