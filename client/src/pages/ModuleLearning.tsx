import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  FileText,
  Video,
  HelpCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

// Enhanced types for the comprehensive certification system
interface CourseModule {
  id: string;
  courseId: string;
  moduleNumber: number;
  title: string;
  description: string;
  duration: number; // in minutes
  contentType: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  contentUrl?: string;
  content?: string;
  quiz?: {
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number;
  };
  assignment?: {
    instructions: string;
    submissionFormat: string;
    maxScore: number;
  };
  resources?: Resource[];
  isRequired: boolean;
  orderIndex: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'essay';
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  points: number;
}

interface Resource {
  title: string;
  type: 'pdf' | 'video' | 'article' | 'tool';
  url: string;
  description?: string;
}

interface ModuleProgress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // in minutes
  attempts: number;
  score?: number;
  submissionData?: any;
  feedback?: string;
}

interface ModuleLearningProps {
  courseId: string;
  enrollmentId: string;
}

export default function ModuleLearning({ courseId, enrollmentId }: ModuleLearningProps) {
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [assignmentSubmission, setAssignmentSubmission] = useState("");
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch course modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/coach/courses", courseId, "modules"],
    enabled: !!courseId
  });

  // Fetch module progress
  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/coach/module-progress", enrollmentId],
    enabled: !!enrollmentId
  });

  // Start/resume module mutation
  const startModuleMutation = useMutation({
    mutationFn: (moduleId: string) => 
      apiRequest("POST", "/api/coach/start-module", { enrollmentId, moduleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coach/module-progress", enrollmentId] });
      setStartTime(new Date());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start module. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: (data: { moduleId: string; answers: any; timeSpent: number }) =>
      apiRequest("POST", "/api/coach/submit-quiz", { 
        enrollmentId, 
        moduleId: data.moduleId,
        answers: data.answers,
        timeSpent: data.timeSpent
      }),
    onSuccess: (result) => {
      toast({
        title: result.passed ? "Quiz Passed!" : "Quiz Completed",
        description: result.passed 
          ? `Congratulations! You scored ${result.score}%` 
          : `You scored ${result.score}%. You need ${selectedModule?.quiz?.passingScore}% to pass.`,
        variant: result.passed ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/module-progress", enrollmentId] });
      setSelectedModule(null);
      setQuizAnswers({});
      setCurrentQuestionIndex(0);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: (data: { moduleId: string; submission: string; timeSpent: number }) =>
      apiRequest("POST", "/api/coach/submit-assignment", {
        enrollmentId,
        moduleId: data.moduleId,
        submission: data.submission,
        timeSpent: data.timeSpent
      }),
    onSuccess: () => {
      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/module-progress", enrollmentId] });
      setSelectedModule(null);
      setAssignmentSubmission("");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Track time spent
  useEffect(() => {
    if (startTime && selectedModule) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000 / 60));
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [startTime, selectedModule]);

  const getModuleProgress = (moduleId: string): ModuleProgress | undefined => {
    return progress.find((p: ModuleProgress) => p.moduleId === moduleId);
  };

  const startModule = (module: CourseModule) => {
    setSelectedModule(module);
    setStartTime(new Date());
    setTimeSpent(0);
    
    const moduleProgress = getModuleProgress(module.id);
    if (!moduleProgress || moduleProgress.status === 'not_started') {
      startModuleMutation.mutate(module.id);
    }
  };

  const submitQuiz = () => {
    if (!selectedModule?.quiz) return;
    
    submitQuizMutation.mutate({
      moduleId: selectedModule.id,
      answers: quizAnswers,
      timeSpent: timeSpent + (startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60) : 0)
    });
  };

  const submitAssignment = () => {
    if (!selectedModule?.assignment || !assignmentSubmission.trim()) return;
    
    submitAssignmentMutation.mutate({
      moduleId: selectedModule.id,
      submission: assignmentSubmission,
      timeSpent: timeSpent + (startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60) : 0)
    });
  };

  const renderModuleContent = () => {
    if (!selectedModule) return null;

    switch (selectedModule.contentType) {
      case 'video':
        return (
          <div className="space-y-4">
            {selectedModule.contentUrl && (
              <div className="aspect-video">
                <iframe
                  src={selectedModule.contentUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            )}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedModule.content || "" }} />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedModule.content || "" }} />
          </div>
        );

      case 'quiz':
        return renderQuiz();

      case 'assignment':
        return renderAssignment();

      default:
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedModule.content || "" }} />
          </div>
        );
    }
  };

  const renderQuiz = () => {
    if (!selectedModule?.quiz) return null;

    const { questions } = selectedModule.quiz;
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <Badge variant="outline">
            {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
          </Badge>
        </div>

        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <RadioGroup
                value={quizAnswers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
                }
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'true_false' && (
              <RadioGroup
                value={quizAnswers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">False</Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === 'essay' && (
              <Textarea
                placeholder="Enter your answer here..."
                value={quizAnswers[currentQuestion.id] || ""}
                onChange={(e) =>
                  setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))
                }
                rows={6}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={submitQuiz} disabled={submitQuizMutation.isPending}>
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderAssignment = () => {
    if (!selectedModule?.assignment) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedModule.assignment.instructions }} />
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Submission Format:</strong> {selectedModule.assignment.submissionFormat}
              </p>
              <p className="text-sm">
                <strong>Maximum Score:</strong> {selectedModule.assignment.maxScore} points
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your assignment submission here..."
              value={assignmentSubmission}
              onChange={(e) => setAssignmentSubmission(e.target.value)}
              rows={10}
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={submitAssignment}
                disabled={!assignmentSubmission.trim() || submitAssignmentMutation.isPending}
              >
                Submit Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!isAuthenticated || user?.role !== "coach") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Module learning is only available to registered coaches.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (modulesLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {selectedModule ? (
          <div className="space-y-6">
            {/* Module Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedModule(null)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Time: {timeSpent} minutes</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedModule.contentType === 'video' && <Video className="h-5 w-5" />}
                  {selectedModule.contentType === 'text' && <FileText className="h-5 w-5" />}
                  {selectedModule.contentType === 'quiz' && <HelpCircle className="h-5 w-5" />}
                  {selectedModule.contentType === 'assignment' && <FileText className="h-5 w-5" />}
                  <Badge variant="outline" className="capitalize">
                    {selectedModule.contentType}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{selectedModule.title}</CardTitle>
                <CardDescription>{selectedModule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {renderModuleContent()}
              </CardContent>
            </Card>

            {/* Resources */}
            {selectedModule.resources && selectedModule.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedModule.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-gray-600">{resource.description}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            Open
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Course Modules
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Complete all modules to earn your certification.
              </p>
            </div>

            <div className="grid gap-6">
              {modules.map((module: CourseModule) => {
                const moduleProgress = getModuleProgress(module.id);
                const isCompleted = moduleProgress?.status === 'completed' || moduleProgress?.status === 'passed';
                const isFailed = moduleProgress?.status === 'failed';
                const isInProgress = moduleProgress?.status === 'in_progress';

                return (
                  <Card key={module.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-gray-400">
                            {module.moduleNumber}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          )}
                          {module.isRequired && (
                            <Badge variant="secondary">Required</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1 capitalize">
                          {module.contentType === 'video' && <Video className="h-4 w-4" />}
                          {module.contentType === 'text' && <FileText className="h-4 w-4" />}
                          {module.contentType === 'quiz' && <HelpCircle className="h-4 w-4" />}
                          {module.contentType === 'assignment' && <FileText className="h-4 w-4" />}
                          <span>{module.contentType}</span>
                        </div>
                      </div>

                      {moduleProgress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="capitalize">{moduleProgress.status.replace('_', ' ')}</span>
                          </div>
                          {moduleProgress.score !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span>Score</span>
                              <span>{moduleProgress.score}%</span>
                            </div>
                          )}
                          {moduleProgress.timeSpent > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Time Spent</span>
                              <span>{moduleProgress.timeSpent} minutes</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => startModule(module)}
                          disabled={startModuleMutation.isPending}
                          variant={isCompleted ? "outline" : "default"}
                          className="flex-1"
                        >
                          {isCompleted ? (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Review Module
                            </>
                          ) : isFailed ? (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Retry Module
                            </>
                          ) : isInProgress ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Continue
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Module
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}