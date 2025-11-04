import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AssessmentForm } from "@/components/assessment-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface AssessmentType {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
  fields: {
    sections?: Array<{
      title: string;
      fields: Array<{
        name: string;
        type: string;
        label: string;
        required?: boolean;
        options?: string[];
        min?: number;
        max?: number;
      }>;
    }>;
    fields?: Array<{
      name: string;
      type: string;
      label: string;
      required?: boolean;
      options?: string[];
      min?: number;
      max?: number;
    }>;
  };
}

// Helper function to flatten sections into a single fields array
function flattenAssessmentFields(assessmentType: AssessmentType) {
  // Check if fields property exists
  if (!assessmentType.fields) {
    console.error('Assessment type missing fields property:', assessmentType);
    return assessmentType;
  }
  
  if (assessmentType.fields.fields) {
    // Already flat
    return assessmentType;
  }
  
  if (assessmentType.fields.sections) {
    // Flatten sections into fields
    const allFields = assessmentType.fields.sections.flatMap(section => section.fields);
    return {
      ...assessmentType,
      fields: { fields: allFields }
    };
  }
  
  return assessmentType;
}

export default function TakeAssessment() {
  const [, params] = useRoute("/assessments/take/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const assessmentId = params?.id;

  // Fetch assessment type structure
  const { data: assessmentType, isLoading, error } = useQuery<AssessmentType>({
    queryKey: ['/api/assessments/assessment-types', assessmentId],
    queryFn: async () => {
      const res = await fetch(`/api/assessments/assessment-types/${assessmentId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch assessment: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!assessmentId,
  });

  // Submit assessment mutation
  const submitMutation = useMutation({
    mutationFn: async (data: { responses: any; email?: string }) => {
      return await apiRequest('POST', '/api/assessments/submit', {
        assessmentTypeId: assessmentId,
        responses: data.responses,
        email: data.email,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Assessment Complete!",
        description: data.message || "Your responses have been saved. Generating your results...",
      });
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['/api/assessments/user'] });
      }
      // Navigate back to assessments page
      setLocation('/assessments');
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit assessment",
        variant: "destructive",
      });
    },
  });

  if (!assessmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid assessment ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading assessment...</span>
        </div>
      </div>
    );
  }

  if (error || !assessmentType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load assessment</p>
          <button
            onClick={() => setLocation('/assessments')}
            className="text-blue-500 hover:underline"
          >
            Return to Assessments
          </button>
        </div>
      </div>
    );
  }

  // Flatten sections if needed
  const flattenedAssessment = flattenAssessmentFields(assessmentType);

  return (
    <AssessmentForm
      assessmentType={flattenedAssessment}
      onSubmit={(responses, email) => submitMutation.mutate({ responses, email })}
      onCancel={() => setLocation('/assessments')}
      isSubmitting={submitMutation.isPending}
      isAuthenticated={isAuthenticated}
    />
  );
}
