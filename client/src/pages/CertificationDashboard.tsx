import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, AlertCircle, RotateCcw, Play } from "lucide-react";
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

export default function CertificationDashboard() {
  const [progress, setProgress] = useState<Certification[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      // Using API request instead of direct supabase calls for security
      const data = await apiRequest("GET", "/api/coach/certification-progress");
      if (data && Array.isArray(data)) {
        setProgress(data as Certification[]);
      } else {
        console.error('API returned non-array data:', data);
        setProgress([]);
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      setError('Could not fetch certification progress.');
      setProgress([]); // Ensure progress is always an array
    }
    setLoading(false);
  }

  const startModule = async (module: Module) => {
    try {
      // This function updates the status of a module to 'in_progress'
      await apiRequest("POST", "/api/coach/start-module", { 
        moduleId: module.id,
        status: 'in_progress'
      });
      
      setSelectedModule(module);
      fetchCertificationProgress(); // Refresh the state
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
          <h2>{selectedModule.title} Quiz</h2>
          {/* You would dynamically render quiz questions from the module content */}
          <div dangerouslySetInnerHTML={{ __html: selectedModule.content || "" }} />
          
          <div>
            <label>
              Sample Question 1
              <select 
                value={quizAnswers['q1'] || ''} 
                onChange={(e) => setQuizAnswers(prev => ({...prev, q1: e.target.value}))}
              >
                <option value="">Select Answer</option>
                <option value="correct">Correct Answer</option>
                <option value="incorrect">Incorrect Answer</option>
              </select>
            </label>
          </div>
          
          <div>
            <label>
              Sample Question 2
              <select 
                value={quizAnswers['q2'] || ''} 
                onChange={(e) => setQuizAnswers(prev => ({...prev, q2: e.target.value}))}
              >
                <option value="">Select Answer</option>
                <option value="correct">Correct Answer</option>
                <option value="incorrect">Incorrect Answer</option>
              </select>
            </label>
          </div>
          
          <button onClick={submitQuiz}>Submit Quiz</button>
          <button onClick={() => setSelectedModule(null)}>Back to Modules</button>
        </div>
      ) : (
        <div className="modules-list">
          {progress.map(item => (
            <div key={item.module_id} className="module-card">
              <h3>{item.modules.title}</h3>
              <p>Status: {item.status}</p>
              {item.score !== null && <p>Score: {item.score}%</p>}
              {item.status !== 'completed' && (
                <button onClick={() => startModule(item.modules)}>
                  {item.status === 'in_progress' || item.status === 'failed' ? 'Retry Module' : 'Start Module'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}