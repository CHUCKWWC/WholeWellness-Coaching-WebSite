import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Eye, EyeOff, ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialLogin from '@/components/SocialLogin';

const coachLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CoachLoginForm = z.infer<typeof coachLoginSchema>;

export default function CoachLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<CoachLoginForm>({
    resolver: zodResolver(coachLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: CoachLoginForm) => apiRequest('POST', '/api/auth/login', data),
    onSuccess: (data) => {
      if (data.user?.role === 'coach') {
        toast({
          title: 'Welcome back!',
          description: `Logged in successfully as ${data.user.firstName}`,
        });
        setLocation('/coach-portal');
      } else {
        toast({
          title: 'Login successful',
          description: 'Redirecting to member portal...',
        });
        setLocation('/member-portal');
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      setLoginError(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const handleGoogleSuccess = (userData: any) => {
    // Handle Google OAuth success
    setLoginError('');
    toast({
      title: 'Welcome!',
      description: 'Successfully signed in with Google',
    });
    setLocation('/coach-portal');
  };

  const handleGoogleError = (error: any) => {
    console.error('Google OAuth error:', error);
    setLoginError('Google sign-in failed. Please try again.');
  };

  const onSubmit = (data: CoachLoginForm) => {
    setLoginError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Coach Sign In</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your coaching dashboard and client management tools
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Welcome Back, Coach
            </CardTitle>
            <CardDescription>
              Sign in to your coaching account to manage clients and sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <SocialLogin
                onGoogleSuccess={handleGoogleSuccess}
                onGoogleError={handleGoogleError}
                disabled={loginMutation.isPending}
                buttonText="Sign in with Google"
                className="w-full"
              />
              
              
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="coach@example.com"
                          disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            disabled={loginMutation.isPending}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loginMutation.isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-2">
              <Link href="/password-reset">
                <Button variant="link" className="text-sm">
                  Forgot your password?
                </Button>
              </Link>
              
              <div className="text-sm text-gray-600">
                New to coaching?{' '}
                <Link href="/coach-signup">
                  <Button variant="link" className="p-0 h-auto">
                    Apply to become a coach
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}