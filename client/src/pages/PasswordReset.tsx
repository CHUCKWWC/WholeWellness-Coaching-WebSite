import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Mail, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import HelpBubble from '@/components/HelpBubble';

const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordResetSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function PasswordReset() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Request password reset mutation
  const requestResetMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/onboarding/password-reset-request', { email });
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Reset Link Sent",
        description: "If an account with that email exists, a reset link has been sent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      return apiRequest('POST', '/api/onboarding/password-reset', data);
    },
    onSuccess: () => {
      setSuccess(true);
      toast({
        title: "Password Reset Successfully",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      passwordResetRequestSchema.parse({ email });
      requestResetMutation.mutate(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      passwordResetSchema.parse({ newPassword, confirmPassword });
      if (token) {
        resetPasswordMutation.mutate({ token, newPassword });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {token ? 'Reset Your Password' : 'Forgot Password?'}
          </h1>
          <p className="text-gray-600">
            {token 
              ? 'Enter your new password below' 
              : "No worries! Enter your email and we'll send you a reset link"
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {token ? <Lock className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              <span>{token ? 'Set New Password' : 'Password Reset'}</span>
              <HelpBubble
                context="difficult-moment"
                trigger="auto"
                delay={2000}
                position="right"
                className="inline-block"
              />
            </CardTitle>
            <CardDescription>
              {token 
                ? 'Your new password must be at least 8 characters long'
                : 'Enter the email address associated with your account'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {token 
                    ? 'Your password has been successfully reset. Redirecting to login...'
                    : 'If an account with that email exists, a reset link has been sent. Please check your inbox.'
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={token ? handleResetPassword : handleRequestReset} className="space-y-4">
                {!token ? (
                  // Email input for requesting reset
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  // Password inputs for resetting
                  <>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        required
                        className={errors.newPassword ? 'border-red-500' : ''}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={requestResetMutation.isPending || resetPasswordMutation.isPending}
                >
                  {(requestResetMutation.isPending || resetPasswordMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    token ? 'Reset Password' : 'Send Reset Link'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <a href="/login" className="font-medium text-primary hover:text-primary/80">
                  Back to Login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            For your security, password reset links expire after 1 hour. 
            If you don't receive an email, please check your spam folder.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}