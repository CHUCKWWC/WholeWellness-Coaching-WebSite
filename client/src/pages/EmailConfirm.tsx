import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function EmailConfirm() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Extract the token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    if (accessToken) {
      // Email confirmed successfully
      setStatus('success');
      setMessage('Your email has been confirmed successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation('/login');
      }, 3000);
    } else {
      setStatus('error');
      setMessage('Invalid confirmation link or token has expired.');
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
              status === 'loading' ? 'bg-blue-100' :
              status === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {status === 'error' && <AlertCircle className="h-8 w-8 text-red-600" />}
            </div>
            <CardTitle className={
              status === 'loading' ? 'text-blue-700' :
              status === 'success' ? 'text-green-700' : 'text-red-700'
            }>
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              {message}
            </p>
            
            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to login page in 3 seconds...
                </p>
                <Button 
                  onClick={() => setLocation('/login')}
                  className="w-full"
                >
                  Continue to Login
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-3">
                <Button 
                  onClick={() => setLocation('/register')}
                  className="w-full"
                >
                  Try Registration Again
                </Button>
                <Button 
                  onClick={() => setLocation('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}