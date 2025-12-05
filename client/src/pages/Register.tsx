import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character (!@#$%^&*)"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const watchPassword = form.watch("password");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      return await apiRequest("POST", "/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "user"
      });
    },
    onSuccess: (data, variables) => {
      sessionStorage.setItem('hasAuthSession', 'true');
      sessionStorage.setItem('firstLogin', 'true');
      sessionStorage.setItem('registeredEmail', variables.email);
      sessionStorage.setItem('registeredName', variables.firstName);
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Redirect to package selection as step 2 of onboarding flow
      setLocation("/choose-package");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to create account. Please try again.";
      setFormError(errorMessage);
      
      if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("exists")) {
        form.setError("email", { 
          type: "manual", 
          message: "This email is already registered. Please sign in instead." 
        });
      } else if (errorMessage.toLowerCase().includes("password")) {
        form.setError("password", { 
          type: "manual", 
          message: errorMessage 
        });
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    setFormError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="mb-4 min-h-[44px] min-w-[44px]"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Your Account
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Join WholeWellness and start your journey today
            </p>
          </CardHeader>
          
          <CardContent>
            {formError && (
              <div 
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700 dark:text-red-300">{formError}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel htmlFor="firstName">First Name</FormLabel>
                        <FormControl>
                          <Input
                            id="firstName"
                            placeholder="First name"
                            className={cn(
                              "min-h-[44px]",
                              fieldState.error && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-describedby={fieldState.error ? "firstName-error" : undefined}
                            aria-invalid={!!fieldState.error}
                            data-testid="input-firstname"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage id="firstName-error" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel htmlFor="lastName">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            className={cn(
                              "min-h-[44px]",
                              fieldState.error && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-describedby={fieldState.error ? "lastName-error" : undefined}
                            aria-invalid={!!fieldState.error}
                            data-testid="input-lastname"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage id="lastName-error" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail 
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
                            aria-hidden="true"
                          />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className={cn(
                              "pl-10 min-h-[44px]",
                              fieldState.error && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-describedby={fieldState.error ? "email-error" : "email-description"}
                            aria-invalid={!!fieldState.error}
                            autoComplete="email"
                            data-testid="input-email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription id="email-description" className="sr-only">
                        We'll send your confirmation to this email
                      </FormDescription>
                      <FormMessage id="email-error" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock 
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
                            aria-hidden="true"
                          />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className={cn(
                              "pl-10 pr-10 min-h-[44px]",
                              fieldState.error && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-describedby="password-requirements"
                            aria-invalid={!!fieldState.error}
                            autoComplete="new-password"
                            data-testid="input-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded min-w-[24px] min-h-[24px] flex items-center justify-center"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div id="password-requirements" className="mt-3">
                        <PasswordStrengthMeter password={watchPassword || ""} />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock 
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
                            aria-hidden="true"
                          />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className={cn(
                              "pl-10 pr-10 min-h-[44px]",
                              fieldState.error && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-describedby={fieldState.error ? "confirmPassword-error" : undefined}
                            aria-invalid={!!fieldState.error}
                            autoComplete="new-password"
                            data-testid="input-confirm-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded min-w-[24px] min-h-[24px] flex items-center justify-center"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            data-testid="button-toggle-confirm-password"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage id="confirmPassword-error" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px] text-base"
                  disabled={registerMutation.isPending}
                  data-testid="button-create-account"
                >
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login">
                  <button 
                    className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded min-h-[44px] px-1"
                    data-testid="link-sign-in"
                  >
                    Sign In
                  </button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
