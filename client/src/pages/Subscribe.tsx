import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Shield, CheckCircle, Star, Clock, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import StripeBuyButton from "@/components/StripeBuyButton";

const AI_COACHING_BUY_BUTTON_ID = "buy_btn_1SXW87FHAup9QfDRAgIqhD8w";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CoachingPurchaseFormProps {
  clientSecret: string;
  planName: string;
  planPrice: string;
  onSuccess?: () => void;
}

const CoachingPurchaseForm = ({ clientSecret, planName, planPrice, onSuccess }: CoachingPurchaseFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/subscription-success',
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
      toast({
        title: "Purchase Successful",
        description: "Welcome to your coaching program!",
      });
      onSuccess?.();
      setLocation('/subscription-success');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Secure Purchase</span>
        </div>
        <p className="text-sm text-blue-700">
          This is a one-time purchase for your coaching program with a limited time period. No recurring charges.
        </p>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Coaching Program:</span>
          <Badge variant="secondary">{planName}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">One-Time Price:</span>
          <span className="text-2xl font-bold text-purple-600">{planPrice}</span>
        </div>
      </div>

      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Purchase...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Purchase Program for {planPrice}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        By purchasing, you agree to our Terms of Service and Privacy Policy.
        This is a one-time purchase with no recurring charges.
      </p>
    </form>
  );
};

const pricingPlans = [
  {
    id: 'ai_coaching',
    name: 'AI Coaching',
    price: '$19.99',
    priceType: 'monthly',
    description: 'Unlimited access to 6 specialized AI coaches',
    features: [
      'Unlimited AI coaching conversations',
      '6 specialized AI coaches',
      '24/7 availability',
      'Personalized wellness insights',
      'Progress tracking & analytics',
      'Resource library access',
      'Cancel anytime'
    ],
    popular: false,
    sessions: 'unlimited',
    sessionType: 'AI',
    savings: 'Best value for ongoing support'
  },
  {
    id: 'live_coaching',
    name: 'Live Coaching Package',
    price: '$599',
    priceType: 'one-time',
    description: 'Six professional live coaching sessions with certified coaches',
    features: [
      '6 live coaching sessions (50 minutes each)',
      'Certified professional coaches',
      'Weekly or biweekly scheduling options',
      'Video session capabilities',
      'Personalized coaching plans',
      'Progress tracking & goals',
      'Priority support',
      'Discounts available for returning clients'
    ],
    popular: true,
    sessions: 6,
    sessionType: 'Live',
    revenueModel: '70% to coaches, 30% to WholeWellness'
  },
  {
    id: 'combined',
    name: 'Combined Package',
    price: '$799',
    priceType: 'one-time',
    description: 'Best value - both AI and live coaching sessions',
    features: [
      '6 AI coaching sessions',
      '6 live coaching sessions', 
      '12 total sessions (50 minutes each)',
      'Hybrid coaching approach',
      'Flexible scheduling options',
      'All premium features included',
      'Maximum support & guidance'
    ],
    popular: false,
    sessions: 12,
    sessionType: 'Hybrid',
    savings: '$99 savings vs separate packages'
  }
];

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[0]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Get selected plan from URL or default to first plan
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    
    if (planId) {
      const plan = pricingPlans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, []);

  const createPurchase = async () => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      setError('Please log in to purchase a coaching program');
      toast({
        title: "Authentication Required",
        description: "Please log in to access coaching programs",
        variant: "destructive",
      });
      return;
    }

    try {
      // apiRequest already parses JSON and returns the data directly
      const data = await apiRequest("POST", "/api/get-or-create-purchase", {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        priceType: selectedPlan.priceType
      });
      
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Purchase creation error:', err);
      setError(err.message || 'Failed to initialize purchase');
      toast({
        title: "Purchase Setup Error",
        description: err.message || 'Failed to initialize purchase',
        variant: "destructive",
      });
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-600">Login Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Please log in to access our coaching programs and start your wellness journey.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/register'}
                  variant="outline"
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Purchase Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Coaching Program
            </h1>
            <p className="text-gray-600">
              Select the program that best fits your wellness journey - one-time purchase with limited access period
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan.id === plan.id 
                    ? 'border-purple-500 ring-2 ring-purple-200' 
                    : 'hover:border-gray-300'
                } ${plan.popular ? 'border-purple-300' : ''}`}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardHeader className="relative">
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600">
                    {plan.price}
                    <span className="text-sm text-gray-500 font-normal"> {plan.priceType === 'monthly' ? '/month' : 'one-time'}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Selected Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold">{selectedPlan.name}</h3>
                  <p className="text-2xl font-bold text-purple-600">{selectedPlan.price}{selectedPlan.priceType === 'monthly' ? '/month' : ' one-time'}</p>
                  <p className="text-gray-600 mt-2">{selectedPlan.description}</p>
                </div>
                
                {selectedPlan.id === 'ai_coaching' ? (
                  <div className="space-y-4">
                    <StripeBuyButton buyButtonId={AI_COACHING_BUY_BUTTON_ID} />
                    <p className="text-xs text-gray-500 text-center">
                      Secure subscription powered by Stripe. Cancel anytime.
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={createPurchase}
                    className="w-full py-3 text-lg bg-purple-600 hover:bg-purple-700"
                    data-testid="button-continue-payment"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue to Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Limited time access</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Professional coaches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Complete Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CoachingPurchaseForm 
                clientSecret={clientSecret} 
                planName={selectedPlan.name}
                planPrice={selectedPlan.price}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}