import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialLogin from '@/components/SocialLogin';

export default function AdminLogin() {
  const [loginError, setLoginError] = useState<string>('');
  const { toast } = useToast();

  const adminOAuthMutation = useMutation({
    mutationFn: (oauthData: any) => apiRequest('POST', '/api/admin/auth/oauth-login', oauthData),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Admin Access Granted',
          description: `Welcome, ${data.user.firstName}!`,
        });
        // Redirect to admin dashboard
        window.location.href = '/admin-dashboard';
      } else {
        setLoginError(data.error || 'Admin access denied');
      }
    },
    onError: (error: any) => {
      console.error('Admin OAuth error:', error);
      setLoginError(error.message || 'Authentication failed. Please try again.');
    },
  });

  const handleGoogleSuccess = (userData: any) => {
    setLoginError('');
    adminOAuthMutation.mutate({
      email: userData.email,
      googleId: userData.id,
      firstName: userData.given_name,
      lastName: userData.family_name,
      profileImageUrl: userData.picture
    });
  };

  const handleGoogleError = (error: any) => {
    console.error('Google OAuth error:', error);
    setLoginError('Google authentication failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Access</h2>
          <p className="mt-2 text-sm text-gray-600">
            Secure Google OAuth authentication for administrators
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Administrator Login
            </CardTitle>
            <CardDescription>
              Use your authorized Google account to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <SocialLogin
                onGoogleSuccess={handleGoogleSuccess}
                onGoogleError={handleGoogleError}
                disabled={adminOAuthMutation.isPending}
                buttonText="Sign in with Google"
                className="w-full"
              />
              
              {adminOAuthMutation.isPending && (
                <div className="text-center text-sm text-gray-500">
                  Authenticating administrator access...
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Admin Access Only:</strong> Only authorized administrators with 
                  'admin' or 'super_admin' roles can access this area. Your Google account 
                  must be pre-approved for administrative access.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.location.href = '/'}
            className="text-gray-500 hover:text-gray-700"
          >
            Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}