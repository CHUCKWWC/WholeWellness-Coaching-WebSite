import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check, Heart, Shield, Star, ArrowLeft } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import SocialLogin from "@/components/SocialLogin";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const MEMBERSHIP_PRICE = 1999; // $19.99 in cents

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const PaymentForm = ({ userId, onSuccess }: { userId: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/onboarding?source=fitness`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-5 w-5" />
            Complete Payment - $19.99/month
          </>
        )}
      </Button>
      <p className="text-xs text-center text-gray-500">
        Secure payment powered by Stripe. Cancel anytime.
      </p>
    </form>
  );
};

export default function FitnessCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState<"account" | "payment">(isAuthenticated ? "payment" : "account");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userId, setUserId] = useState<string | null>(user?.id || null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  // Fetch Stripe config
  const { data: stripeConfig } = useQuery({
    queryKey: ["/api/stripe/config"],
  });

  useEffect(() => {
    if (stripeConfig?.publishableKey) {
      setStripePromise(loadStripe(stripeConfig.publishableKey));
    }
  }, [stripeConfig]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setUserId(user.id);
      setStep("payment");
    }
  }, [isAuthenticated, user]);

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

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await apiRequest("POST", "/api/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "user"
      });
      return response;
    },
    onSuccess: async (data) => {
      sessionStorage.setItem('hasAuthSession', 'true');
      queryClient.setQueryData(["/api/auth/user"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      if (data.id) {
        setUserId(data.id);
        await initializePayment(data.id);
        setStep("payment");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Initialize payment intent
  const initializePayment = async (uid: string) => {
    try {
      const data = await apiRequest<{ clientSecret: string }>("POST", "/api/create-subscription-intent", {
        planId: "wellness_membership",
        amount: MEMBERSHIP_PRICE,
      });
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("No client secret returned");
      }
    } catch (error: any) {
      console.error("Failed to initialize payment:", error);
      toast({
        title: "Payment Setup Error",
        description: error.message || "Unable to set up payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId && step === "payment" && !clientSecret) {
      initializePayment(userId);
    }
  }, [userId, step, clientSecret]);

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Welcome to WholeWellness!",
      description: "Your membership is now active. Let's set up your wellness profile.",
    });
    setLocation("/onboarding?source=fitness");
  };

  const benefits = [
    { icon: Heart, text: "24/7 AI Wellness Coaching" },
    { icon: Star, text: "Personalized Fitness Plans" },
    { icon: Shield, text: "Mental Wellness Support" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="min-h-[44px]" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Left Column - Benefits */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Start Your Wellness Journey
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Join thousands transforming their lives with personalized AI coaching.
              </p>
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Premium Membership
                </CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-purple-600">$19.99</span>
                  <span className="text-gray-500">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <benefit.icon className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200">{benefit.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500 space-y-2">
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Cancel anytime, no long-term commitment
              </p>
              <p className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Secure payment with Stripe
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "account" ? "bg-purple-600 text-white" : "bg-green-500 text-white"}`}>
                  {step === "payment" ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <div className="h-0.5 w-8 bg-gray-200" />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  2
                </div>
              </div>
              <CardTitle>
                {step === "account" ? "Create Your Account" : "Complete Payment"}
              </CardTitle>
              <CardDescription>
                {step === "account" 
                  ? "Quick sign up to get started" 
                  : "Secure payment to activate your membership"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "account" ? (
                <div className="space-y-6">
                  <SocialLogin onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                  }} />

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 text-sm text-gray-500">
                      or continue with email
                    </span>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  <Input
                                    {...field}
                                    placeholder="First"
                                    className="pl-10"
                                    data-testid="input-first-name"
                                  />
                                </div>
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
                                <Input
                                  {...field}
                                  placeholder="Last"
                                  data-testid="input-last-name"
                                />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="you@example.com"
                                  className="pl-10"
                                  data-testid="input-email"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a strong password"
                                  className="pl-10 pr-10"
                                  data-testid="input-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                </button>
                              </div>
                            </FormControl>
                            <PasswordStrengthMeter password={watchPassword} />
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
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  {...field}
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm your password"
                                  className="pl-10 pr-10"
                                  data-testid="input-confirm-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                        data-testid="button-continue-to-payment"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          "Continue to Payment"
                        )}
                      </Button>
                    </form>
                  </Form>

                  <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-purple-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stripePromise && clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <PaymentForm userId={userId!} onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      <span className="ml-2 text-gray-600">Setting up payment...</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
