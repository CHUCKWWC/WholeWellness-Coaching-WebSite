import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User, Heart, Shield, UserPlus, CreditCard, Crown } from "lucide-react";
import BrowserSecureAuth from "@/components/BrowserSecureAuth";

const registrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["client_free", "client_paid", "coach"]),
  packageType: z.string().optional(),
  coachingSpecialty: z.string().optional(),
  bio: z.string().optional(),
  credentials: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function RoleBasedRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<"client_free" | "client_paid" | "coach">("client_free");

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "client_free",
      termsAccepted: false,
    },
  });

  // Fetch available coaching packages
  const { data: packages } = useQuery({
    queryKey: ["/api/coaching-packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/coaching-packages");
      return response.json();
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: selectedRole === "coach" 
          ? "Your application has been submitted for review. You'll be notified once approved."
          : "Welcome to WholeWellness! You can now access your personalized dashboard.",
      });
      
      if (selectedRole === "coach") {
        setLocation("/coach-pending-approval");
      } else if (selectedRole === "client_paid") {
        setLocation("/checkout");
      } else {
        setLocation("/digital-onboarding");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationData) => {
    registrationMutation.mutate(data);
  };

  const roleOptions = [
    {
      value: "client_free" as const,
      title: "Free Coaching Starter",
      description: "Get started with 3 free AI coaching sessions and basic assessments",
      icon: <User className="w-8 h-8 text-primary" />,
      features: ["3 Free AI Coaching Sessions", "Basic Health Assessments", "Community Support", "Resource Library Access"],
      price: "Free"
    },
    {
      value: "client_paid" as const,
      title: "Premium Coaching Plan",
      description: "Full access to AI coaching, assessments, and premium resources",
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      features: ["Unlimited AI Coaching", "All Assessments", "Priority Support", "Live Coach Sessions", "Personalized Plans"],
      price: "Starting at $29/month"
    },
    {
      value: "coach" as const,
      title: "Become a Coach",
      description: "Apply to join our coaching team and help transform lives",
      icon: <Heart className="w-8 h-8 text-red-500" />,
      features: ["Coach Dashboard", "Client Management", "Certification Courses", "Revenue Sharing", "Professional Tools"],
      price: "Commission-based"
    }
  ];

  const coachingSpecialties = [
    { value: "weight_loss", label: "Weight Loss & Nutrition" },
    { value: "relationship", label: "Relationship Coaching" },
    { value: "behavior", label: "Behavior Change" },
    { value: "wellness", label: "Holistic Wellness" },
    { value: "accountability", label: "Financial Wellness" },
    { value: "empowerment", label: "Domestic Violence Recovery" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Join WholeWellness Coaching
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your path to wellness. Whether you're seeking support or ready to support others, we have a place for you.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((option) => (
            <Card 
              key={option.value}
              className={`cursor-pointer transition-all ${
                selectedRole === option.value 
                  ? "ring-2 ring-primary shadow-lg scale-105" 
                  : "hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedRole(option.value);
                form.setValue("role", option.value);
              }}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {option.icon}
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription className="text-sm">{option.description}</CardDescription>
                <div className="text-lg font-bold text-primary">{option.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Form */}
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Create Your Account
            </CardTitle>
            <CardDescription>
              Fill out the information below to get started on your wellness journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google OAuth Option */}
            <div className="mb-6">
              <BrowserSecureAuth onClose={() => {}} />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Package Selection for Paid Clients */}
                {selectedRole === "client_paid" && packages && (
                  <FormField
                    control={form.control}
                    name="packageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose Your Package</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a coaching package" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {packages.map((pkg: any) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name} - ${pkg.price}/month
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Coach-specific fields */}
                {selectedRole === "coach" && (
                  <>
                    <FormField
                      control={form.control}
                      name="coachingSpecialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coaching Specialty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {coachingSpecialties.map((specialty) => (
                                <SelectItem key={specialty.value} value={specialty.value}>
                                  {specialty.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your coaching experience and approach..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
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
                              placeholder="List your relevant credentials, certifications, and qualifications..."
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the{" "}
                          <a href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registrationMutation.isPending}
                >
                  {registrationMutation.isPending ? (
                    selectedRole === "coach" ? "Submitting Application..." : "Creating Account..."
                  ) : (
                    selectedRole === "coach" ? "Submit Coach Application" : "Create Account"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Sign in here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}