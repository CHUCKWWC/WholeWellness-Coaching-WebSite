import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AssessmentForm } from "@/components/assessment-form";
import { useToast } from "@/hooks/use-toast";
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
  const assessmentId = params?.id;

  // Fetch assessment type structure
  const { data: assessmentType, isLoading, error } = useQuery<AssessmentType>({
    queryKey: ['/api/assessments/assessment-types', assessmentId],
    enabled: !!assessmentId,
  });

  // Submit assessment mutation
  const submitMutation = useMutation({
    mutationFn: async (responses: any) => {
      return await apiRequest('POST', '/api/assessments/submit', {
        assessmentTypeId: assessmentId,
        responses,
      });
    },
    onSuccess: () => {
      toast({
        title: "Assessment Complete!",
        description: "Your responses have been saved. Generating your results...",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments/user'] });
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
      onSubmit={(responses) => submitMutation.mutate(responses)}
      onCancel={() => setLocation('/assessments')}
      isSubmitting={submitMutation.isPending}
    />
  );
}
