import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, AlertCircle, RotateCcw, Play } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Types that match your original structure but enhanced for our system
interface Module {
  id: string;
  title: string;
  content: string;
  module_order: number;
  duration: number;
  contentType: string;
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      type: string;
      options?: string[];
      correctAnswer?: any;
    }>;
  };
}

interface Certification {
  module_id: string;
  status: string;
  score: number | null;
  answers: any;
  timeSpent: number;
  attempts: number;
  modules: Module; // This holds the joined module data
}

export default function CertificationDashboard() {
  const [progress, setProgress] = useState<Certification[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Using our API endpoints instead of direct Supabase calls
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/coach/courses", "course-1", "modules"], // Using demo course
    enabled: isAuthenticated && user?.role === "coach"
  });

  const { data: moduleProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/coach/module-progress", "enrollment-demo"], // Using demo enrollment
    enabled: isAuthenticated && user?.role === "coach"
  });

  // Start module mutation - enhanced version of your original function
  const startModuleMutation = useMutation({
    mutationFn: (moduleId: string) => 
      apiRequest("POST", "/api/coach/start-module", { 
        enrollmentId: "enrollment-demo", 
        moduleId 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/module-progress"] });
    },
    onError: () => {
      setError('Could not start the module.');
      toast({
        title: "Error",
        description: "Could not start the module. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit quiz mutation - enhanced version of your original function
  const submitQuizMutation = useMutation({
    mutationFn: (data: { moduleId: string; answers: any }) =>
      apiRequest("POST", "/api/coach/submit-quiz", {
        enrollmentId: "enrollment-demo",
        moduleId: data.moduleId,
        answers: data.answers,
        timeSpent: 0
      }),
    onSuccess: (result) => {
      const newStatus = result.passed ? 'completed' : 'failed';
      toast({
        title: result.passed ? "Quiz Completed!" : "Quiz Failed",
        description: result.passed 
          ? `Congratulations! You scored ${result.score}%` 
          : `You scored ${result.score}%. You need 80% to pass.`,
        variant: result.passed ? "default" : "destructive",
      });
      
      // Refresh progress and reset the view - matching your original logic
      queryClient.invalidateQueries({ queryKey: ["/api/coach/module-progress"] });
      setSelectedModule(null);
      setQuizAnswers({});
    },
    onError: () => {
      setError('Could not submit your quiz results.');
      toast({
        title: "Submission Failed",
        description: "Could not submit your quiz results. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Transform API data to match your original structure
  useEffect(() => {
    if (modules.length > 0 && moduleProgress.length >= 0) {
      const transformedProgress: Certification[] = modules.map((module: any) => {
        const progress = moduleProgress.find((p: any) => p.moduleId === module.id);
        return {
          module_id: module.id,
          status: progress?.status || 'not_started',
          score: progress?.score || null,
          answers: progress?.submissionData || {},
          timeSpent: progress?.timeSpent || 0,
          attempts: progress?.attempts || 0,
          modules: {
            id: module.id,
            title: module.title,
            content: module.content,
            module_order: module.moduleNumber,
            duration: module.duration,
            contentType: module.contentType,
            quiz: module.quiz
          }
        };
      });
      setProgress(transformedProgress);
      setLoading(false);
    }
  }, [modules, moduleProgress]);

  // Your original startModule function - enhanced but keeping the same logic
  const startModule = async (module: Module) => {
    setSelectedModule(module);
    
    // Only start if not already started - matching your original logic
    const moduleProgress = progress.find(p => p.module_id === module.id);
    if (!moduleProgress || moduleProgress.status === 'not_started') {
      startModuleMutation.mutate(module.id);
    }
  };

  // Your original submitQuiz function - enhanced but keeping the same logic
  const submitQuiz = async () => {
    if (!selectedModule) return;

    // Enhanced scoring logic but keeping your original structure
    let correctAnswers = 0;
    const totalQuestions = Object.keys(quizAnswers).length || 2; // Default to 2 like your original

    // Simple scoring logic similar to your original
    Object.values(quizAnswers).forEach(answer => {
      if (answer === 'correct' || answer.includes('Specific') || answer === 'false') {
        correctAnswers++;
      }
    });

    submitQuizMutation.mutate({
      moduleId: selectedModule.id,
      answers: quizAnswers
    });
  };

  // Your original loading and error states
  if (loading || modulesLoading || progressLoading) {
    return (
      <div className="certification-dashboard p-6">
        <p className="text-lg">Loading your progress...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="certification-dashboard p-6">
        <p className="error text-red-600">{error}</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "coach") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Certification dashboard is only available to registered coaches.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Your original return structure but with enhanced UI components
  return (
    <div className="certification-dashboard min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Coach Certification Modules
        </h1>
        
        {selectedModule ? (
          // Quiz container - enhanced version of your original
          <div className="quiz-container space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{selectedModule.title} Quiz</CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {selectedModule.contentType}
                  </Badge>
                </div>
                <CardDescription>
                  Duration: {selectedModule.duration} minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Module content - your original dangerouslySetInnerHTML approach */}
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedModule.content || "" }} />
                </div>
                
                {/* Enhanced quiz questions but keeping your original structure */}
                {selectedModule.quiz && selectedModule.quiz.questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Question {index + 1}: {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {question.type === 'multiple_choice' && question.options ? (
                        <Select
                          value={quizAnswers[question.id] || ''}
                          onValueChange={(value) => 
                            setQuizAnswers(prev => ({...prev, [question.id]: value}))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((option, optionIndex) => (
                              <SelectItem key={optionIndex} value={optionIndex.toString()}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        // Fallback to your original select approach
                        <div>
                          <Label htmlFor={`question-${question.id}`}>
                            Sample Question {index + 1}
                          </Label>
                          <Select
                            value={quizAnswers[question.id] || ''}
                            onValueChange={(value) => 
                              setQuizAnswers(prev => ({...prev, [question.id]: value}))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Answer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Select Answer</SelectItem>
                              <SelectItem value="correct">Correct Answer</SelectItem>
                              <SelectItem value="incorrect">Incorrect Answer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Your original buttons but enhanced with icons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={submitQuiz}
                    disabled={submitQuizMutation.isPending}
                    className="flex-1"
                  >
                    {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedModule(null)}
                    className="flex-1"
                  >
                    Back to Modules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Modules list - enhanced version of your original
          <div className="modules-list grid gap-6">
            {progress.map(item => {
              const isCompleted = item.status === 'completed';
              const isFailed = item.status === 'failed';
              const isInProgress = item.status === 'in_progress';
              
              return (
                <Card key={item.module_id} className="module-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-gray-400">
                          {item.modules.module_order}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.modules.title}</CardTitle>
                          <CardDescription>
                            Duration: {item.modules.duration} minutes | Type: {item.modules.contentType}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
                        {isFailed && <AlertCircle className="h-6 w-6 text-red-600" />}
                        {isInProgress && <Clock className="h-6 w-6 text-blue-600" />}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Status and score - your original approach but enhanced */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant={isCompleted ? "default" : isFailed ? "destructive" : "secondary"}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      {item.score !== null && (
                        <div className="flex justify-between text-sm">
                          <span>Score:</span>
                          <span className={item.score >= 80 ? "text-green-600" : "text-red-600"}>
                            {item.score}%
                          </span>
                        </div>
                      )}
                      
                      {item.timeSpent > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Time Spent:</span>
                          <span>{item.timeSpent} minutes</span>
                        </div>
                      )}
                      
                      {item.attempts > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Attempts:</span>
                          <span>{item.attempts}</span>
                        </div>
                      )}
                    </div>

                    {/* Your original conditional button logic but enhanced */}
                    {item.status !== 'completed' && (
                      <Button 
                        onClick={() => startModule(item.modules)}
                        disabled={startModuleMutation.isPending}
                        className="w-full"
                        variant={isFailed ? "destructive" : "default"}
                      >
                        {isInProgress || isFailed ? (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {isFailed ? 'Retry Module' : 'Continue Module'}
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Module
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}