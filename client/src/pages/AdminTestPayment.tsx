import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, TestTube, DollarSign } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function TestPaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const createTestPaymentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/donations/admin-test-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create test payment");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (!stripe || !elements) {
        toast({
          title: "Error",
          description: "Stripe not loaded. Please refresh the page.",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast({
          title: "Error",
          description: "Card element not found.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          },
        }
      });

      setIsProcessing(false);

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Payment Successful!",
          description: "Your $1.00 test payment has been processed successfully.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createTestPaymentMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing || createTestPaymentMutation.isPending}
        className="w-full"
      >
        {isProcessing || createTestPaymentMutation.isPending ? (
          "Processing..."
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Process Test Payment - $1.00
          </>
        )}
      </Button>
    </form>
  );
}

export default function AdminTestPayment() {
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page is only accessible to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Badge variant="outline" className="mb-4">
            Admin Only
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Payment System Test</h1>
          <p className="text-muted-foreground">
            Test the Stripe payment integration with a $1.00 transaction.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Test Payment - $1.00
              </CardTitle>
              <CardDescription>
                Process a test payment to verify Stripe integration is working correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise}>
                <TestPaymentForm />
              </Elements>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Using Test Card Numbers:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <code className="bg-muted px-2 py-1 rounded">4242 4242 4242 4242</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Decline:</span>
                    <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 0002</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Insufficient Funds:</span>
                    <code className="bg-muted px-2 py-1 rounded">4000 0000 0000 9995</code>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Other Details:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use any future expiry date (e.g., 12/34)</li>
                  <li>• Use any 3-digit CVC (e.g., 123)</li>
                  <li>• Use any ZIP code (e.g., 12345)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}