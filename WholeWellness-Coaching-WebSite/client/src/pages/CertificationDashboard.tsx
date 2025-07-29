import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, AlertCircle, RotateCcw, Play, FileText, Video, Image, Download, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Define types for our data for better TypeScript support - matching your original exactly
type Module = {
  id: number;
  title: string;
  content: string;
  module_order: number;
};

type Certification = {
  module_id: number;
  status: string;
  score: number | null;
  answers: any;
  modules: Module; // This will hold the joined module data
};

type CourseMaterial = {
  id: string;
  name: string;
  type: 'video' | 'document' | 'image' | 'other';
  url: string;
  thumbnailUrl?: string;
  size?: string;
  uploadedAt: string;
};

const generateModuleContent = (courseTitle: string, moduleTitle: string, duration: number): string => {
  const contentMap: { [key: string]: string } = {
    "Advanced Coaching Techniques": `
## Module Overview
Master advanced coaching methodologies that transform client outcomes through evidence-based practices and innovative approaches.

### Learning Objectives
- Implement solution-focused coaching strategies
- Apply motivational interviewing techniques
- Design personalized coaching frameworks
- Master active listening and powerful questioning

### Key Topics Covered
**1. Solution-Focused Coaching (${Math.floor(duration * 0.3)} hours)**
- Identifying client strengths and resources
- Goal-setting frameworks that drive results
- Scaling questions and miracle questions
- Building on existing client competencies

**2. Motivational Interviewing Techniques (${Math.floor(duration * 0.3)} hours)**
- Understanding stages of change
- Resolving ambivalence and resistance
- Using reflective listening effectively
- Enhancing client motivation and commitment

**3. Advanced Communication Skills (${Math.floor(duration * 0.4)} hours)**
- Powerful questioning techniques
- Creating safe spaces for vulnerability
- Managing challenging conversations
- Non-verbal communication mastery

### Practical Applications
- Role-playing exercises with feedback
- Case study analysis and discussion
- Technique demonstration videos
- Self-assessment tools and reflection exercises

### Professional Development
This module contributes **${duration} CE credits** toward your professional certification and meets ICF core competency requirements.
    `,
    
    "Behavior Change Psychology": `
## Module Overview
Deep dive into the psychology of behavior change, habit formation, and sustainable transformation methodologies.

### Learning Objectives
- Understand neuroplasticity and behavior modification
- Apply evidence-based change models
- Design effective intervention strategies
- Support clients through change resistance

### Key Topics Covered
**1. Psychology of Change (${Math.floor(duration * 0.25)} hours)**
- Transtheoretical Model of behavior change
- Cognitive-behavioral principles
- Neuroplasticity and brain adaptation
- Understanding change resistance

**2. Habit Formation Science (${Math.floor(duration * 0.25)} hours)**
- The habit loop: cue, routine, reward
- Keystone habits and behavior stacking
- Environmental design for success
- Breaking unwanted patterns

**3. Motivational Psychology (${Math.floor(duration * 0.25)} hours)**
- Self-Determination Theory
- Intrinsic vs. extrinsic motivation
- Goal-setting psychology
- Building self-efficacy

**4. Practical Applications (${Math.floor(duration * 0.25)} hours)**
- Behavior change assessments
- Intervention design workshop
- Client case study analysis
- Progress tracking methodologies

### Professional Resources
- Behavior change assessment tools
- Client handouts and worksheets
- Research articles and evidence base
- Professional development resources
    `,
    
    "Wellness Assessment Methods": `
## Module Overview
Comprehensive training in holistic wellness assessment techniques, measurement tools, and client evaluation methodologies.

### Learning Objectives
- Conduct comprehensive wellness assessments
- Interpret assessment results effectively
- Design personalized wellness plans
- Track and measure client progress

### Key Topics Covered
**1. Holistic Assessment Frameworks (${Math.floor(duration * 0.3)} hours)**
- Physical wellness indicators
- Mental and emotional health markers
- Social and relationship wellness
- Spiritual and purpose alignment
- Environmental and lifestyle factors

**2. Assessment Tools and Techniques (${Math.floor(duration * 0.3)} hours)**
- Validated wellness questionnaires
- Biometric and physical assessments
- Lifestyle and habit inventories
- Stress and resilience measures
- Values and purpose assessments

**3. Data Interpretation and Planning (${Math.floor(duration * 0.4)} hours)**
- Analyzing assessment results
- Identifying priority areas for improvement
- Creating personalized wellness plans
- Setting SMART wellness goals
- Tracking progress and outcomes

### Hands-On Practice
- Complete wellness assessments on yourself
- Practice with volunteer clients
- Interpret sample assessment results
- Design personalized wellness plans

### Professional Toolkit
Access to professional-grade assessment tools, scoring guides, and interpretation resources used by certified wellness coaches.
    `,
    
    "Client Relationship Management": `
## Module Overview
Master the art of building, maintaining, and optimizing client relationships for maximum coaching effectiveness and satisfaction.

### Learning Objectives
- Establish professional coaching relationships
- Maintain appropriate boundaries
- Handle challenging client situations
- Optimize client engagement and retention

### Key Topics Covered
**1. Relationship Foundation (${Math.floor(duration * 0.25)} hours)**
- Creating psychological safety
- Establishing trust and rapport
- Setting clear expectations
- Professional boundary management

**2. Communication Excellence (${Math.floor(duration * 0.25)} hours)**
- Active listening mastery
- Empathetic responding
- Difficult conversation navigation
- Cultural competency awareness

**3. Client Engagement Strategies (${Math.floor(duration * 0.25)} hours)**
- Motivation and accountability systems
- Session structure optimization
- Between-session support
- Progress celebration methods

**4. Challenge Management (${Math.floor(duration * 0.25)} hours)**
- Handling resistance and setbacks
- Managing client expectations
- Ethical dilemma resolution
- Professional referral processes

### Real-World Applications
- Client onboarding best practices
- Session planning templates
- Communication scripts and frameworks
- Challenge resolution case studies

This module prepares you for the complexities of professional coaching relationships while maintaining the highest ethical standards.
    `
  };
  
  return contentMap[moduleTitle] || `
## ${moduleTitle}
Professional certification module covering ${moduleTitle.toLowerCase()} with comprehensive learning objectives, practical applications, and hands-on exercises.

**Duration:** ${duration} hours of intensive training
**Format:** Interactive online learning with assessments
**Certification:** Contributes toward professional coaching credentials

### Module Content
This comprehensive module includes theoretical foundations, practical applications, case studies, and assessment components designed to enhance your professional coaching capabilities.

### Learning Outcomes
Upon completion, you will have mastered essential skills in ${moduleTitle.toLowerCase()} and be prepared to apply these techniques with confidence in your coaching practice.
  `;
};

export default function CertificationDashboard() {
  const [progress, setProgress] = useState<Certification[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseMaterials, setCourseMaterials] = useState<CourseMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchCertificationProgress()
  }, [])

  const fetchCertificationProgress = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get available certification courses
      const courses = await apiRequest("GET", "/api/coach/certification-courses");
      if (courses && Array.isArray(courses)) {
        // Transform courses into module progress format
        const moduleProgress: Certification[] = [];
        
        courses.forEach((course: any, courseIndex: number) => {
          if (course.syllabus && course.syllabus.modules) {
            course.syllabus.modules.forEach((module: any, moduleIndex: number) => {
              moduleProgress.push({
                module_id: courseIndex * 100 + moduleIndex + 1,
                status: moduleIndex === 0 ? 'not_started' : 'coming_soon', // First module available, others coming soon
                score: null,
                answers: {},
                modules: {
                  id: courseIndex * 100 + moduleIndex + 1,
                  title: module.title,
                  content: generateModuleContent(course.title, module.title, module.duration),
                  module_order: moduleIndex + 1
                }
              });
            });
          }
        });
        
        setProgress(moduleProgress);
      } else {
        console.error('API returned non-array data:', courses);
        setProgress([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Could not fetch certification courses.');
      setProgress([]); // Ensure progress is always an array
    }
    setLoading(false);
  }

  const fetchCourseMaterials = async (courseId: number) => {
    setMaterialsLoading(true);
    try {
      const response = await apiRequest("GET", `/api/public/course-materials/${courseId}`);
      if (response.success && response.folderUrl) {
        // Open user's shared Google Drive folder directly
        window.open(response.folderUrl, '_blank');
        toast({
          title: "Course Materials",
          description: `Opening ${response.courseTitle || 'course'} materials in Google Drive`,
          variant: "default",
        });
        setCourseMaterials(response.materials || []);
      } else {
        setCourseMaterials([]);
        toast({
          title: "Materials Access",
          description: response.message || "Course materials are being prepared.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error accessing course materials:', error);
      setCourseMaterials([]);
      toast({
        title: "Error Loading Materials",
        description: "Failed to access course materials. Please try again.",
        variant: "destructive",
      });
    }
    setMaterialsLoading(false);
  };

  const startModule = async (module: Module) => {
    try {
      // This function updates the status of a module to 'in_progress'
      await apiRequest("POST", "/api/coach/start-module", { 
        moduleId: module.id,
        status: 'in_progress'
      });
      
      setSelectedModule(module);
      setShowMaterials(false); // Reset materials view
      fetchCertificationProgress(); // Refresh the state
      
      // Fetch course materials for this module
      await fetchCourseMaterials(module.id);
    } catch (error) {
      console.error('Error starting module:', error);
      setError('Could not start the module.');
      toast({
        title: "Error",
        description: "Could not start the module. Please try again.",
        variant: "destructive",
      });
    }
  }

  const submitQuiz = async () => {
    if (!selectedModule) return

    try {
      // Simple example of calculating a score
      const totalQuestions = 2; // Assuming 2 questions for this example
      const correctAnswers = Object.values(quizAnswers).filter(answer => answer === 'correct').length
      const score = Math.round((correctAnswers / totalQuestions) * 100)
      const newStatus = score >= 80 ? 'completed' : 'failed'; // Example passing score

      // This function updates the certification entry with the quiz results.
      await apiRequest("POST", "/api/coach/submit-quiz", {
        moduleId: selectedModule.id,
        score: score,
        answers: quizAnswers,
        status: newStatus
      });

      // Show success/failure message
      toast({
        title: newStatus === 'completed' ? "Quiz Completed!" : "Quiz Failed",
        description: newStatus === 'completed' 
          ? `Congratulations! You scored ${score}%` 
          : `You scored ${score}%. You need 80% to pass.`,
        variant: newStatus === 'completed' ? "default" : "destructive",
      });

      // Refresh progress and reset the view
      fetchCertificationProgress()
      setSelectedModule(null)
      setQuizAnswers({})
      setCourseMaterials([])
      setShowMaterials(false)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError('Could not submit your quiz results.');
      toast({
        title: "Submission Failed",
        description: "Could not submit your quiz results. Please try again.",
        variant: "destructive",
      });
    }
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <Download className="h-4 w-4" />;
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-700 border-red-200';
      case 'document': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'image': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return (
    <div className="certification-dashboard p-6">
      <p>Loading your progress...</p>
    </div>
  );
  
  if (error) return (
    <div className="certification-dashboard p-6">
      <p className="error text-red-600">{error}</p>
    </div>
  );

  if (!Array.isArray(progress)) {
    return (
      <div className="certification-dashboard p-6">
        <p className="error text-red-600">Error: Invalid data format received.</p>
      </div>
    );
  }

  return (
    <div className="certification-dashboard">
      <h1>Coach Certification Modules</h1>
      {selectedModule ? (
        <div className="quiz-container">
          <div className="flex justify-between items-center mb-4">
            <h2>{selectedModule.title} Quiz</h2>
            <div className="space-x-2">
              <Button
                variant={showMaterials ? "default" : "outline"}
                onClick={() => setShowMaterials(!showMaterials)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Course Materials
              </Button>
              <Button variant="outline" onClick={() => setSelectedModule(null)}>
                Back to Modules
              </Button>
            </div>
          </div>

          {showMaterials && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Course Materials
                </CardTitle>
                <CardDescription>
                  Access videos, documents, and resources for this module
                </CardDescription>
              </CardHeader>
              <CardContent>
                {materialsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="ml-2">Loading materials...</span>
                  </div>
                ) : courseMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseMaterials.map((material) => (
                      <Card key={material.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg border ${getMaterialColor(material.type)}`}>
                              {getMaterialIcon(material.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate" title={material.name}>
                                {material.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Badge variant="secondary" className="text-xs">
                                  {material.type}
                                </Badge>
                                {material.size && <span>{material.size}</span>}
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 h-auto mt-2 text-xs"
                                onClick={() => window.open(material.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open in Google Drive
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No course materials available</p>
                    <p className="text-sm">Course materials will appear here when Google Drive is configured</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Course content and quiz */}
          <div dangerouslySetInnerHTML={{ __html: selectedModule.content || "" }} />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Knowledge Assessment</CardTitle>
              <CardDescription>Complete the quiz to test your understanding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="q1">Sample Question 1</Label>
                <Select value={quizAnswers['q1'] || ''} onValueChange={(value) => setQuizAnswers(prev => ({...prev, q1: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correct">Correct Answer</SelectItem>
                    <SelectItem value="incorrect">Incorrect Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="q2">Sample Question 2</Label>
                <Select value={quizAnswers['q2'] || ''} onValueChange={(value) => setQuizAnswers(prev => ({...prev, q2: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correct">Correct Answer</SelectItem>
                    <SelectItem value="incorrect">Incorrect Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={submitQuiz} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {progress.map(item => {
            const getStatusIcon = () => {
              switch (item.status) {
                case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
                case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
                case 'failed': return <AlertCircle className="h-5 w-5 text-red-600" />;
                case 'coming_soon': return <Clock className="h-5 w-5 text-gray-400" />;
                default: return <Play className="h-5 w-5 text-gray-600" />;
              }
            };

            const getStatusColor = () => {
              switch (item.status) {
                case 'completed': return 'border-green-200 bg-green-50';
                case 'in_progress': return 'border-blue-200 bg-blue-50';
                case 'failed': return 'border-red-200 bg-red-50';
                case 'coming_soon': return 'border-gray-200 bg-gray-50';
                default: return 'border-gray-200 bg-white';
              }
            };

            return (
              <Card key={item.module_id} className={`transition-all hover:shadow-lg ${getStatusColor()}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.modules.title}</CardTitle>
                    {getStatusIcon()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {item.score !== null && (
                      <Badge variant={item.score >= 80 ? 'default' : 'destructive'}>
                        {item.score}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Module {item.modules.module_order} - Professional Certification Course
                    </p>
                    
                    {item.status === 'coming_soon' ? (
                      <Button disabled className="w-full" variant="secondary">
                        <Clock className="h-4 w-4 mr-2" />
                        Coming Soon
                      </Button>
                    ) : item.status === 'completed' ? (
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full" onClick={() => startModule(item.modules)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Review Module
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => startModule(item.modules)}>
                        <Play className="h-4 w-4 mr-2" />
                        {item.status === 'in_progress' || item.status === 'failed' ? 'Continue Module' : 'Start Module'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
}