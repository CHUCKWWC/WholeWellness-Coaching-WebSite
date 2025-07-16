import { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentForm = ({ onValidChange, onPaymentSuccess }: { 
  onValidChange: (valid: boolean) => void;
  onPaymentSuccess: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/coach-onboarding',
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
      // Payment succeeded
      setPaymentComplete(true);
      toast({
        title: "Payment Successful",
        description: "Your coach application fee has been processed successfully!",
      });
      onPaymentSuccess();
      onValidChange(true);
    }
  };

  useEffect(() => {
    // Initially invalid until payment is complete
    onValidChange(paymentComplete);
  }, [paymentComplete, onValidChange]);

  if (paymentComplete) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground">Your application fee has been processed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay $99.00 Application Fee
          </>
        )}
      </Button>
    </form>
  );
};

export default function CoachPaymentStep({ onValidChange }: { onValidChange: (valid: boolean) => void }) {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent for coach application fee
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/coach/application-payment', {
          amount: 99.00 // $99 application fee
        });
        setClientSecret(response.clientSecret);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment');
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  const handlePaymentSuccess = () => {
    // Store payment success in onboarding data
    const event = new CustomEvent('coachPaymentComplete', { detail: { paid: true } });
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Coach Application Fee</h3>
        <p className="text-muted-foreground">
          To complete your coach application, a one-time fee of $99.00 is required.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold mb-3 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          What the Application Fee Covers:
        </h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Background verification and credential validation</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Professional profile setup and optimization</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Initial training materials and platform orientation</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Ongoing technical support and resources</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Access to our client matching system</span>
          </li>
        </ul>
      </div>

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm 
            onValidChange={onValidChange} 
            onPaymentSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}

      <div className="text-center text-sm text-muted-foreground mt-6">
        <p>Secure payment processed by Stripe</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
}