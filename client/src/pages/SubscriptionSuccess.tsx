import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ClipboardCheck, Star, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation('/discovery-assessment');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, setLocation]);

  const handleContinue = () => {
    setAutoRedirect(false);
    setLocation('/discovery-assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Step 3 of 4
          </Badge>
        </div>

        <Card className="border-green-200 dark:border-green-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-300">Payment Successful!</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome to your coaching program! Your payment has been processed successfully.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                  One More Step!
                </h3>
              </div>
              <p className="text-center text-purple-700 dark:text-purple-300">
                Complete a brief discovery assessment to help us personalize your coaching experience.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Discovery Assessment</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Takes about 3-5 minutes</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This short assessment helps us understand your goals, challenges, and preferences 
                so we can match you with the right coach and resources.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleContinue}
                className="w-full min-h-[52px] text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                data-testid="button-continue-assessment"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Continue to Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              {autoRedirect && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Automatically continuing in {countdown} seconds...
                </p>
              )}
            </div>

            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A confirmation email has been sent to your inbox.
                <br />
                Need help?{' '}
                <a href="mailto:hello@wholewellnesscoaching.org" className="text-purple-600 hover:underline">
                  Contact us
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}