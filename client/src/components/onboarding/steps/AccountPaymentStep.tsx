import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, Shield, Info, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface AccountPaymentStepProps {
  onValidChange: (isValid: boolean) => void;
}

const pricingPlans = [
  {
    id: 'weekly',
    name: 'Weekly Sessions',
    price: '$80/week',
    description: 'Best for active support and rapid progress',
    features: ['Unlimited messaging', 'Weekly 50-min sessions', 'Personalized action plans', 'Resource library access']
  },
  {
    id: 'biweekly',
    name: 'Bi-Weekly Sessions',
    price: '$160/month',
    description: 'Balanced support for steady growth',
    features: ['Unlimited messaging', 'Two sessions per month', 'Goal tracking tools', 'Resource library access']
  },
  {
    id: 'monthly',
    name: 'Monthly Sessions',
    price: '$90/month',
    description: 'Maintenance and check-in support',
    features: ['Unlimited messaging', 'One session per month', 'Email support', 'Resource library access']
  }
];

// Load Stripe outside component
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function PaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/onboarding-complete`,
      },
      redirect: 'if_required',
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
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Complete Registration & Payment'
        )}
      </Button>
    </form>
  );
}

export default function AccountPaymentStep({ onValidChange }: AccountPaymentStepProps) {
  const { data, updateData } = useOnboarding();
  const { toast } = useToast();
  const [email, setEmail] = useState(data.email || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState(data.firstName || '');
  const [lastName, setLastName] = useState(data.lastName || '');
  const [selectedPlan, setSelectedPlan] = useState(data.selectedPlan || '');
  const [isRegistered, setIsRegistered] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      // First, create the user account
      const registerResponse = await apiRequest("POST", "/api/auth/register", {
        email,
        password,
        firstName,
        lastName,
        phone,
        onboardingData: data
      });

      const user = await registerResponse.json();

      // Then create payment intent for the selected plan
      const planPrices = {
        weekly: 32000, // $320/month (80*4)
        biweekly: 16000, // $160/month
        monthly: 9000, // $90/month
      };

      const paymentResponse = await apiRequest("POST", "/api/create-subscription", {
        userId: user.id,
        priceAmount: planPrices[selectedPlan as keyof typeof planPrices],
        planId: selectedPlan,
      });

      return paymentResponse.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setIsRegistered(true);
      updateData({ userId: data.userId });
      toast({
        title: "Account Created!",
        description: "Please complete payment to finalize your registration.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email) &&
                   phone.length === 10 &&
                   password.length >= 8 &&
                   password === confirmPassword &&
                   firstName.length >= 1 &&
                   lastName.length >= 1 &&
                   selectedPlan !== '';
    onValidChange(isValid && !isRegistered);
  }, [email, phone, password, confirmPassword, firstName, lastName, selectedPlan, isRegistered, onValidChange]);

  useEffect(() => {
    updateData({
      email,
      phone,
      firstName,
      lastName,
      selectedPlan,
    });
  }, [email, phone, firstName, lastName, selectedPlan, updateData]);

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: "Your registration is complete. Check your email for confirmation.",
    });
    updateData({ isComplete: true });
    onValidChange(false); // Disable next button since we're done
  };

  if (isRegistered && clientSecret && stripePromise) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Account created successfully! Complete your payment to finalize registration.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Create your secure account and select a plan to reserve your coach match.
        </AlertDescription>
      </Alert>

      {/* Account Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="1234567890"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPhone(value.slice(0, 10));
              }}
            />
            <p className="text-sm text-gray-600 mt-1">10-digit number for appointment reminders</p>
          </div>

          <div>
            <Label htmlFor="password">Create Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm Password *</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Select Your Plan *</h3>
        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-colors ${
                selectedPlan === plan.id ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={plan.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <span className="font-bold text-lg text-purple-600">{plan.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={() => registerMutation.mutate()}
        disabled={registerMutation.isPending || !selectedPlan || password !== confirmPassword}
        className="w-full"
        size="lg"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          'Create Account & Continue to Payment'
        )}
      </Button>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> After creating your account, you'll be redirected to our secure payment page to complete registration. You'll be matched with a coach within 24-48 hours.
        </AlertDescription>
      </Alert>
    </div>
  );
}