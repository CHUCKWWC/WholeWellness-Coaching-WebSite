import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function AssessmentPaymentSuccess() {
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get query parameters
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    
    const sessionId = params.get('session_id');
    const assessmentId = params.get('assessmentId');

    if (sessionId && assessmentId) {
      // Call the payment success endpoint to create the paid assessment record
      fetch(`/api/assessments/payment-success?session_id=${sessionId}&assessmentId=${assessmentId}`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast({
              title: "Payment Successful!",
              description: "Your assessment has been unlocked. You can now take it.",
            });
          }
        })
        .catch(error => {
          console.error('Error processing payment success:', error);
        });
    }
  }, [toast]);

  const assessmentId = searchParams?.get('assessmentId');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Thank you for your payment. Your assessment has been unlocked and you can now take it.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Your assessment is now available</li>
                <li>• Take your time to answer thoughtfully</li>
                <li>• You'll receive personalized insights after completion</li>
                <li>• Results are saved and can be accessed anytime</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              {assessmentId ? (
                <Link href={`/assessments/take/${assessmentId}`}>
                  <Button className="flex items-center gap-2">
                    Take Assessment Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/assessments">
                  <Button>Return to Assessments</Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}