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
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Mail, ArrowLeft, Eye, EyeOff, AlertCircle, Info, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginError {
  code?: string;
  message: string;
  field?: string;
}

function getErrorDetails(error: any): LoginError {
  const message = error?.message || "Invalid credentials. Please try again.";
  const code = error?.code;
  
  if (message.toLowerCase().includes("not verified") || message.toLowerCase().includes("unverified")) {
    return {
      code: "UNVERIFIED_ACCOUNT",
      message: "Your email address has not been verified. Please check your inbox for a verification email.",
      field: "email"
    };
  }
  
  if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("no account")) {
    return {
      code: "ACCOUNT_NOT_FOUND",
      message: "No account found with this email. Please check your email or create a new account.",
      field: "email"
    };
  }
  
  if (message.toLowerCase().includes("password") || message.toLowerCase().includes("incorrect") || message.toLowerCase().includes("invalid credentials")) {
    return {
      code: "INVALID_PASSWORD",
      message: "The password you entered is incorrect. Please try again or reset your password.",
      field: "password"
    };
  }
  
  if (message.toLowerCase().includes("locked") || message.toLowerCase().includes("too many attempts")) {
    return {
      code: "ACCOUNT_LOCKED",
      message: "Your account has been temporarily locked due to too many failed attempts. Please try again later or reset your password."
    };
  }
  
  if (message.toLowerCase().includes("disabled") || message.toLowerCase().includes("suspended")) {
    return {
      code: "ACCOUNT_DISABLED",
      message: "Your account has been disabled. Please contact support for assistance."
    };
  }
  
  return {
    message: message
  };
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<LoginError | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    // Redirect to the Google OAuth endpoint
    window.location.href = '/auth/google';
  };

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response;
    },
    onSuccess: (data) => {
      setFormError(null);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      sessionStorage.setItem('hasAuthSession', 'true');
      
      if (data.role === "admin" || data.role === "super_admin") {
        sessionStorage.setItem('isAdmin', 'true');
      }
      
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (!data.hasCompletedOnboarding) {
        sessionStorage.setItem('firstLogin', 'true');
        setLocation("/digital-onboarding");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      const errorDetails = getErrorDetails(error);
      setFormError(errorDetails);
      
      if (errorDetails.field === "email") {
        form.setError("email", { type: "manual", message: errorDetails.message });
      } else if (errorDetails.field === "password") {
        form.setError("password", { type: "manual", message: errorDetails.message });
      }
      
      toast({
        title: "Login Failed",
        description: errorDetails.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    setFormError(null);
    form.clearErrors();
    loginMutation.mutate(data);
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
              Welcome Back
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to continue your wellness journey
            </p>
          </CardHeader>
          
          <CardContent>
            {formError && (
              <div 
                className={cn(
                  "mb-4 p-3 rounded-lg flex items-start gap-2 border",
                  formError.code === "UNVERIFIED_ACCOUNT" 
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                )}
                role="alert"
                aria-live="assertive"
              >
                {formError.code === "UNVERIFIED_ACCOUNT" ? (
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div className="flex-1">
                  <p className={cn(
                    "text-sm",
                    formError.code === "UNVERIFIED_ACCOUNT" 
                      ? "text-yellow-800 dark:text-yellow-200"
                      : "text-red-700 dark:text-red-300"
                  )}>
                    {formError.message}
                  </p>
                  {formError.code === "UNVERIFIED_ACCOUNT" && (
                    <Button
                      variant="link"
                      className="h-auto p-0 mt-1 text-yellow-700 dark:text-yellow-300"
                      onClick={() => {
                        toast({
                          title: "Verification Email Sent",
                          description: "We've sent a new verification email to your address.",
                        });
                      }}
                      data-testid="button-resend-verification"
                    >
                      Resend verification email
                    </Button>
                  )}
                  {formError.code === "ACCOUNT_NOT_FOUND" && (
                    <Link href="/register">
                      <Button
                        variant="link"
                        className="h-auto p-0 mt-1 text-red-700 dark:text-red-300"
                        data-testid="link-create-account-error"
                      >
                        Create a new account
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                            aria-describedby={fieldState.error ? "email-error" : undefined}
                            aria-invalid={!!fieldState.error}
                            autoComplete="email"
                            data-testid="input-email"
                            {...field}
                          />
                        </div>
                      </FormControl>
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
                            placeholder="Enter your password"
                            className={cn(
                              "pl-10 pr-10 min-h-[44px]",
                              fieldState.error && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-describedby={fieldState.error ? "password-error" : undefined}
                            aria-invalid={!!fieldState.error}
                            autoComplete="current-password"
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
                      <FormMessage id="password-error" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-end mb-2">
                  <Link href="/forgot-password">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1 min-h-[44px] flex items-center"
                      data-testid="link-forgot-password"
                    >
                      Forgot password?
                    </button>
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px] text-base"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[48px] text-base flex items-center justify-center gap-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || loginMutation.isPending}
              data-testid="button-google-signin"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SiGoogle className="w-5 h-5 text-[#4285F4]" />
              )}
              {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/register">
                  <button 
                    className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded min-h-[44px] px-1"
                    data-testid="link-create-account"
                  >
                    Create Account
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
