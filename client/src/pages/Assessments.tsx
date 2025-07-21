import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Lock, Star } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: number;
  duration: string;
  price: number;
}

interface UserProgram {
  id: string;
  assessmentType: string;
  results: any;
  paid: boolean;
  createdAt: string;
}

const AVAILABLE_ASSESSMENTS: Assessment[] = [
  {
    id: "wellness_personality",
    title: "Wellness Personality Assessment",
    description: "Discover your unique wellness style and personalized recommendations for optimal health and happiness.",
    category: "Wellness",
    questions: 25,
    duration: "10 minutes",
    price: 9.99
  },
  {
    id: "career_alignment",
    title: "Career Alignment Analysis",
    description: "Uncover your career strengths, values, and ideal work environment for professional fulfillment.",
    category: "Career",
    questions: 30,
    duration: "12 minutes",
    price: 9.99
  },
  {
    id: "relationship_patterns",
    title: "Relationship Patterns Assessment",
    description: "Understand your attachment style and communication patterns in personal relationships.",
    category: "Relationships",
    questions: 20,
    duration: "8 minutes", 
    price: 9.99
  },
  {
    id: "stress_resilience",
    title: "Stress & Resilience Profile",
    description: "Assess your stress management skills and discover personalized coping strategies.",
    category: "Mental Health",
    questions: 22,
    duration: "9 minutes",
    price: 9.99
  },
  {
    id: "nutrition_lifestyle",
    title: "Nutrition & Lifestyle Analysis",
    description: "Get a comprehensive evaluation of your eating habits and lifestyle factors affecting your health.",
    category: "Nutrition",
    questions: 28,
    duration: "11 minutes",
    price: 9.99
  }
];

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

export default function Assessments() {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's completed programs
  const { data: userPrograms = [], isLoading: programsLoading } = useQuery<UserProgram[]>({
    queryKey: ['/api/programs'],
    retry: false,
  });

  // Count free assessments used
  const freeAssessmentsUsed = userPrograms.filter(program => !program.paid).length;
  const remainingFreeAssessments = Math.max(0, 3 - freeAssessmentsUsed);

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await apiRequest('/api/create-payment-intent', 'POST', {
        assessmentId,
        amount: 9.99
      });
      return response;
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        toast({
          title: "Payment Error",
          description: result.error.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  // Start assessment mutation
  const startAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const response = await apiRequest('/api/programs', 'POST', {
        assessmentType: assessmentId,
        paid: remainingFreeAssessments > 0 ? false : true
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Started",
        description: "Your assessment has been created. Complete it to see your results.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      // Navigate to assessment questions (would be implemented)
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to start assessment",
        variant: "destructive",
      });
    },
  });

  const handleStartAssessment = async (assessment: Assessment) => {
    // Check if user needs to pay
    if (remainingFreeAssessments === 0) {
      // Start payment flow
      createPaymentMutation.mutate(assessment.id);
    } else {
      // Start free assessment
      startAssessmentMutation.mutate(assessment.id);
    }
  };

  const isAssessmentCompleted = (assessmentId: string) => {
    return userPrograms.some(program => program.assessmentType === assessmentId);
  };

  const getAssessmentResults = (assessmentId: string) => {
    return userPrograms.find(program => program.assessmentType === assessmentId);
  };

  if (programsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading your assessments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personal Wellness Assessments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover insights about yourself with our evidence-based assessments. 
            Get 3 free results, then unlock additional assessments for just $9.99 each.
          </p>
          
          {/* Free assessments counter */}
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md inline-block">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">
                {remainingFreeAssessments} free assessment{remainingFreeAssessments !== 1 ? 's' : ''} remaining
              </span>
            </div>
            {remainingFreeAssessments === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Additional assessments are $9.99 each
              </p>
            )}
          </div>
        </div>

        {/* Assessment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {AVAILABLE_ASSESSMENTS.map((assessment) => {
            const completed = isAssessmentCompleted(assessment.id);
            const results = getAssessmentResults(assessment.id);
            const needsPayment = remainingFreeAssessments === 0 && !completed;

            return (
              <Card key={assessment.id} className="relative hover:shadow-lg transition-shadow">
                {completed && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{assessment.category}</Badge>
                    {needsPayment && <Lock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Assessment details */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{assessment.questions} questions</span>
                      <span>{assessment.duration}</span>
                    </div>
                    
                    {/* Price or completion status */}
                    <div className="flex justify-between items-center">
                      <div>
                        {completed ? (
                          <span className="text-green-600 font-medium">Completed</span>
                        ) : needsPayment ? (
                          <span className="text-lg font-bold text-teal-600">${assessment.price}</span>
                        ) : (
                          <span className="text-lg font-bold text-green-600">FREE</span>
                        )}
                      </div>
                      
                      {/* Action button */}
                      <Button 
                        onClick={() => handleStartAssessment(assessment)}
                        disabled={createPaymentMutation.isPending || startAssessmentMutation.isPending}
                        variant={completed ? "outline" : "default"}
                        className={needsPayment ? "bg-teal-600 hover:bg-teal-700" : ""}
                      >
                        {createPaymentMutation.isPending || startAssessmentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        
                        {completed 
                          ? "View Results" 
                          : needsPayment 
                            ? "Purchase & Start" 
                            : "Start Assessment"
                        }
                      </Button>
                    </div>
                    
                    {/* Results preview */}
                    {completed && results && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          Completed on {new Date(results.createdAt).toLocaleDateString()}
                        </p>
                        {results.paid && (
                          <Badge className="mt-1" variant="secondary">Paid Assessment</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Why Take These Assessments?</h3>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Get personalized insights based on evidence-based psychology</li>
              <li>• Receive customized recommendations for your wellness journey</li>
              <li>• Track your progress over time with follow-up assessments</li>
              <li>• Share results with your coach for more targeted support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}