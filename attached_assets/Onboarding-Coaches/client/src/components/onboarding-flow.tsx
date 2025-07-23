import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserPlus, ClipboardList, Target, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingForm } from "@shared/schema";

export default function OnboardingFlow() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingForm, setEditingForm] = useState<OnboardingForm | null>(null);
  const { toast } = useToast();

  const { data: forms, isLoading } = useQuery<OnboardingForm[]>({
    queryKey: ['/api/coaches/1/forms'],
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: any) => {
      return apiRequest('POST', '/api/forms', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1/forms'] });
      setShowAddForm(false);
      toast({
        title: "Form created",
        description: "Your onboarding form has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onboardingSteps = [
    {
      id: 1,
      title: "Welcome",
      description: "Initial greeting",
      icon: UserPlus,
      color: "text-[var(--wellness-teal)]",
    },
    {
      id: 2,
      title: "Assessment",
      description: "Intake forms",
      icon: ClipboardList,
      color: "text-[var(--wellness-teal)]",
    },
    {
      id: 3,
      title: "Goal Setting",
      description: "Define objectives",
      icon: Target,
      color: "text-[var(--wellness-teal)]",
    },
    {
      id: 4,
      title: "Scheduling",
      description: "Book sessions",
      icon: Calendar,
      color: "text-[var(--wellness-teal)]",
    },
  ];

  const defaultFormSections = [
    {
      title: "Personal Information",
      description: "Name, contact, demographics",
      fields: [
        { type: "text", label: "Full Name", required: true },
        { type: "email", label: "Email Address", required: true },
        { type: "tel", label: "Phone Number", required: false },
        { type: "date", label: "Date of Birth", required: false },
      ],
    },
    {
      title: "Wellness Goals",
      description: "What they want to achieve",
      fields: [
        { type: "textarea", label: "Primary Goals", required: true },
        { type: "select", label: "Focus Area", options: ["Health", "Career", "Relationships", "Personal Growth"], required: true },
        { type: "text", label: "Timeline", required: false },
      ],
    },
    {
      title: "Current Challenges",
      description: "Areas of concern",
      fields: [
        { type: "textarea", label: "Main Challenges", required: true },
        { type: "text", label: "Previous Experience with Coaching", required: false },
        { type: "textarea", label: "Expectations", required: false },
      ],
    },
  ];

  const handleCreateForm = (formData: FormData) => {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    
    const newForm = {
      coachId: 1,
      title,
      fields: defaultFormSections,
      isActive: true,
    };

    createFormMutation.mutate(newForm);
  };

  return (
    <div className="space-y-8">
      {/* Onboarding Steps Overview */}
      <Card className="wellness-card">
        <CardHeader>
          <CardTitle>Onboarding Flow Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="text-center relative">
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 bg-[var(--wellness-light)]`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h4 className="font-medium text-gray-700 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.description}</p>
                
                {/* Connection line */}
                {index < onboardingSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intake Forms Management */}
      <Card className="wellness-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Intake Forms</CardTitle>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="btn-secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Intake Form</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateForm(new FormData(e.currentTarget));
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="title">Form Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Initial Client Assessment"
                      required
                      className="wellness-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of the form purpose"
                      className="wellness-input"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-primary"
                      disabled={createFormMutation.isPending}
                    >
                      {createFormMutation.isPending ? "Creating..." : "Create Form"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--wellness-teal)]"></div>
            </div>
          ) : forms && forms.length > 0 ? (
            <div className="space-y-4">
              {forms.map((form) => (
                <div key={form.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-700">{form.title}</h4>
                      <Badge variant={form.isActive ? "default" : "secondary"}>
                        {form.isActive ? "Active" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Array.isArray(form.fields) && form.fields.map((section: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-700">{section.title}</h5>
                          <span className="text-sm text-gray-500">
                            {section.fields?.length || 0} fields
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Forms Created Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first intake form to start onboarding clients
              </p>
              <Button
                className="btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Form
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Builder Preview */}
      {forms && forms.length > 0 && (
        <Card className="wellness-card">
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Wellness Journey</h3>
                <p className="text-gray-600">
                  Please take a few minutes to complete this form so we can better understand your goals and needs.
                </p>
              </div>

              <div className="space-y-8">
                {defaultFormSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">{section.title}</h4>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {section.fields.map((field: any, fieldIndex: number) => (
                        <div key={fieldIndex}>
                          <Label className="text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea 
                              placeholder={`Enter your ${field.label.toLowerCase()}`}
                              className="wellness-input mt-1"
                              disabled
                            />
                          ) : field.type === 'select' ? (
                            <Select disabled>
                              <SelectTrigger className="wellness-input mt-1">
                                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option: string) => (
                                  <SelectItem key={option} value={option.toLowerCase()}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              type={field.type}
                              placeholder={`Enter your ${field.label.toLowerCase()}`}
                              className="wellness-input mt-1"
                              disabled
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {sectionIndex < defaultFormSections.length - 1 && (
                      <Separator className="my-8" />
                    )}
                  </div>
                ))}
                
                <div className="flex justify-center pt-6">
                  <Button className="btn-primary w-full max-w-sm" disabled>
                    Submit Assessment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
