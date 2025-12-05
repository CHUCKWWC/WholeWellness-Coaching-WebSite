import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ amount, description }: { amount: number; description: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
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
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      setLocation('/payment-success');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          {description} - ${(amount / 100).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment details from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const paymentAmount = urlParams.get('amount');
    const paymentDescription = urlParams.get('description') || 'Coaching Services';
    
    if (!paymentAmount) {
      // Try to get from localStorage (set by booking form)
      const bookingData = localStorage.getItem('pendingBooking');
      if (bookingData) {
        const booking = JSON.parse(bookingData);
        const serviceAmount = getServiceAmount(booking.serviceType);
        createPaymentIntent(serviceAmount, `${booking.serviceType} Coaching Session`);
      } else {
        setLoading(false);
      }
    } else {
      createPaymentIntent(parseInt(paymentAmount), paymentDescription);
    }
  }, []);

  const getServiceAmount = (serviceType: string): number => {
    switch (serviceType) {
      case 'consultation': return 5000; // $50
      case 'individual': return 12500; // $125
      case 'intensive': return 25000; // $250
      default: return 5000;
    }
  };

  const createPaymentIntent = async (amount: number, description: string) => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount,
        description 
      });
      const data = await response.json();
      
      setClientSecret(data.clientSecret);
      setAmount(amount);
      setDescription(description);
      setLoading(false);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>
              Unable to initialize payment. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm amount={amount} description={description} />
        </Elements>
      </div>
    </div>
  );
}