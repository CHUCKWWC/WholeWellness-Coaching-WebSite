import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Mail, Loader } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export default function EmailVerification() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      return apiRequest('/api/onboarding/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    },
    onSuccess: () => {
      setVerificationStatus('success');
      toast({
        title: "Email Verified Successfully",
        description: "Your email has been verified. You can now access all features.",
      });
      setTimeout(() => {
        window.location.href = '/onboarding';
      }, 3000);
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Verification failed');
      if (error.message?.includes('Invalid') || error.message?.includes('expired')) {
        setVerificationStatus('expired');
      }
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/onboarding/resend-verification', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "A new verification email has been sent to your address.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    } else {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided');
    }
  }, [token]);

  const handleResendVerification = () => {
    resendVerificationMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
          <p className="text-gray-600">
            Confirming your email address
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              {verificationStatus === 'loading' && <Loader className="h-5 w-5 animate-spin" />}
              {verificationStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {(verificationStatus === 'error' || verificationStatus === 'expired') && <AlertCircle className="h-5 w-5 text-red-600" />}
              <span>
                {verificationStatus === 'loading' && 'Verifying...'}
                {verificationStatus === 'success' && 'Verified!'}
                {verificationStatus === 'error' && 'Verification Failed'}
                {verificationStatus === 'expired' && 'Link Expired'}
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            {verificationStatus === 'loading' && (
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-semibold">Email successfully verified!</p>
                    <p>Welcome to Whole Wellness Coaching. You'll be redirected to complete your onboarding.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'expired' && (
              <div className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="space-y-2">
                      <p className="font-semibold">Verification link has expired</p>
                      <p>For security reasons, verification links are only valid for 24 hours.</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">
                    Would you like us to send you a new verification email?
                  </p>
                  <Button 
                    onClick={handleResendVerification}
                    disabled={resendVerificationMutation.isPending}
                    className="w-full"
                  >
                    {resendVerificationMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      'Send New Verification Email'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus === 'error' && errorMessage && !errorMessage.includes('expired') && (
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="space-y-2">
                      <p className="font-semibold">Verification failed</p>
                      <p>{errorMessage}</p>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <p className="text-gray-600 mb-6">
                    There was an issue verifying your email. You can try requesting a new verification link.
                  </p>
                  <Button 
                    onClick={handleResendVerification}
                    disabled={resendVerificationMutation.isPending}
                    className="w-full"
                  >
                    {resendVerificationMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      'Request New Verification Email'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <a href="/contact" className="font-medium text-primary hover:text-primary/80">
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Don't see the verification email?</strong> Check your spam folder, 
            or make sure the email address you registered with is correct.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}