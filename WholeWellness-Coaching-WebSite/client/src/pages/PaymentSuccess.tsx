import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment details from URL parameters or session storage
    const urlParams = new URLSearchParams(window.location.search);
    const sessionAmount = urlParams.get('amount') || sessionStorage.getItem('checkout_amount');
    const sessionDescription = urlParams.get('description') || sessionStorage.getItem('checkout_description') || 'Coaching Services';
    
    if (sessionAmount) {
      setPaymentDetails({
        amount: parseInt(sessionAmount),
        description: sessionDescription
      });
    }

    // Clear session storage
    sessionStorage.removeItem('checkout_amount');
    sessionStorage.removeItem('checkout_description');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Thank you for your payment. Your transaction has been completed successfully.
              </p>
              
              {paymentDetails && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Amount Paid:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${(paymentDetails.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{paymentDetails.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">What's Next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Payment confirmation email sent</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Your account has been updated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span>Coach matching in progress (24-48 hours)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/member-portal')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Member Portal
              </Button>
              
              <Button 
                onClick={() => setLocation('/digital-onboarding')}
                variant="outline"
                className="w-full"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue Onboarding
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>
                Need help? Contact us at{' '}
                <a href="mailto:hello@wholewellnesscoaching.org" className="text-blue-600 hover:underline">
                  hello@wholewellnesscoaching.org
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}