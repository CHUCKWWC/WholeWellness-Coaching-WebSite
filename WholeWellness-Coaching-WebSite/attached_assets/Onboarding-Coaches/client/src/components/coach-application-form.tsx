import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

const applicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  bio: z.string().min(100, "Bio must be at least 100 characters"),
  credentials: z.string().min(10, "Please provide your credentials"),
  experience: z.string().min(50, "Please describe your experience"),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const specialtyOptions = [
  "nutrition", "fitness", "mental health", "stress management", 
  "weight loss", "mindfulness", "eating disorders", "body positivity",
  "anxiety management", "sleep optimization", "hormone balance",
  "digestive health", "chronic disease management", "sports performance"
];

export default function CoachApplicationForm() {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      credentials: "",
      experience: "",
      specialties: [],
    },
  });

  const createApplication = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return await apiRequest("/api/applications", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully!",
        description: "Your coach application has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      form.reset();
      setSelectedSpecialties([]);
    },
    onError: (error) => {
      toast({
        title: "Error submitting application",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const addSpecialty = (specialty: string) => {
    if (!selectedSpecialties.includes(specialty)) {
      const newSpecialties = [...selectedSpecialties, specialty];
      setSelectedSpecialties(newSpecialties);
      form.setValue("specialties", newSpecialties);
    }
  };

  const removeSpecialty = (specialty: string) => {
    const newSpecialties = selectedSpecialties.filter(s => s !== specialty);
    setSelectedSpecialties(newSpecialties);
    form.setValue("specialties", newSpecialties);
  };

  const onSubmit = (data: ApplicationFormData) => {
    createApplication.mutate({
      ...data,
      specialties: selectedSpecialties,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Coach Application</CardTitle>
        <CardDescription>
          Apply to become a wellness coach with Whole Wellness Coaching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1-555-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself, your coaching philosophy, and what makes you unique as a wellness coach..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 100 characters. This will be visible to potential clients.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credentials & Certifications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List your relevant certifications, degrees, and professional credentials..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include certification bodies, dates, and license numbers where applicable.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your relevant work experience, specializations, and client success stories..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 50 characters. Include years of experience and specific areas of expertise.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Specialties</FormLabel>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map((specialty) => (
                  <Button
                    key={specialty}
                    type="button"
                    variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectedSpecialties.includes(specialty) 
                      ? removeSpecialty(specialty) 
                      : addSpecialty(specialty)
                    }
                  >
                    {selectedSpecialties.includes(specialty) ? (
                      <X className="w-3 h-3 mr-1" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}
                    {specialty}
                  </Button>
                ))}
              </div>
              {selectedSpecialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSpecialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
              <FormDescription>
                Select at least one specialty area. You can choose multiple.
              </FormDescription>
              {form.formState.errors.specialties && (
                <p className="text-sm text-red-500">{form.formState.errors.specialties.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createApplication.isPending}
            >
              {createApplication.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}