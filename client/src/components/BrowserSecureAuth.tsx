import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Shield, AlertTriangle } from 'lucide-react';

interface BrowserSecureAuthProps {
  onClose?: () => void;
}

export default function BrowserSecureAuth({ onClose }: BrowserSecureAuthProps) {
  const handleGoogleLogin = () => {
    // Open Google OAuth in a new window to comply with security policies
    const authUrl = `/auth/google`;
    const authWindow = window.open(
      authUrl,
      'google_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Monitor the popup window
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed);
        // Refresh the page to check authentication status
        window.location.reload();
      }
    }, 1000);

    // Clean up after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    }, 300000);
  };

  return (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Secure Authentication Required</strong>
          <br />
          For your security, Google authentication will open in a secure browser window.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
          <ExternalLink className="h-4 w-4 ml-1" />
        </Button>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            This opens a secure Google authentication window
          </p>
          <p>Allow popups for this site if prompted</p>
        </div>
      </div>

      {onClose && (
        <div className="pt-2 border-t">
          <Button variant="ghost" onClick={onClose} className="w-full text-sm">
            Use Email/Password Instead
          </Button>
        </div>
      )}
    </div>
  );
}