import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Save, ChevronLeft } from "lucide-react";

interface AssessmentType {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
  fields: {
    fields: Array<{
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

interface AssessmentFormProps {
  assessmentType: AssessmentType;
  onSubmit: (responses: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AssessmentForm({ assessmentType, onSubmit, onCancel, isSubmitting }: AssessmentFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = assessmentType.fields.fields || [];
  const fieldsPerStep = 3;
  const totalSteps = Math.ceil(fields.length / fieldsPerStep);
  const currentFields = fields.slice(currentStep * fieldsPerStep, (currentStep + 1) * fieldsPerStep);

  const handleInputChange = (fieldName: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear any existing error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    currentFields.forEach(field => {
      if (field.required && (!responses[field.name] || responses[field.name] === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(responses);
    }
  };

  const renderField = (field: any) => {
    const value = responses[field.name] || '';
    const hasError = !!errors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? "border-red-500" : ""}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {hasError && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
              className={hasError ? "border-red-500" : ""}
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
            {hasError && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={hasError ? "border-red-500" : ""}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={3}
            />
            {hasError && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.name, val)}>
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${option}`}
                    checked={(value as string[])?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (value as string[]) || [];
                      if (checked) {
                        handleInputChange(field.name, [...currentValues, option]);
                      } else {
                        handleInputChange(field.name, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.name}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        );

      case 'range':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="px-2">
              <Slider
                value={[value || field.min || 1]}
                onValueChange={(val) => handleInputChange(field.name, val[0])}
                max={field.max || 10}
                min={field.min || 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{field.min || 1}</span>
                <span className="font-medium">Current: {value || field.min || 1}</span>
                <span>{field.max || 10}</span>
              </div>
            </div>
            {hasError && <p className="text-red-500 text-xs">{errors[field.name]}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Assessments
              </Button>
            </div>
            
            <CardTitle className="text-2xl">{assessmentType.displayName}</CardTitle>
            <CardDescription>{assessmentType.description}</CardDescription>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {currentStep + 1} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {currentFields.map(renderField)}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === totalSteps - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Complete Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}