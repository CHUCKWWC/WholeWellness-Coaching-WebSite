import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  ClipboardList, 
  Brain, 
  Users,
  Sparkles,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NextStep {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  linkText: string;
  primary?: boolean;
}

export default function RegistrationConfirmation() {
  const [, setLocation] = useLocation();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const email = sessionStorage.getItem('registeredEmail');
    const name = sessionStorage.getItem('registeredName');
    if (email) setUserEmail(email);
    if (name) setUserName(name);
  }, []);

  const nextSteps: NextStep[] = [
    {
      icon: ClipboardList,
      title: "Complete Your Discovery Assessment",
      description: "Answer a few questions to help us personalize your wellness journey and match you with the right resources.",
      link: "/digital-onboarding?startQuiz=true",
      linkText: "Start Assessment",
      primary: true
    },
    {
      icon: Brain,
      title: "Try AI Coaching",
      description: "Get instant support from our 6 specialized AI coaches available 24/7 to guide your wellness journey.",
      link: "/ai-coaching",
      linkText: "Meet AI Coaches"
    },
    {
      icon: Users,
      title: "Browse Professional Coaches",
      description: "Connect with certified human coaches who specialize in life coaching, wellness, and personal development.",
      link: "/coaches",
      linkText: "View Coaches"
    },
    {
      icon: BookOpen,
      title: "Explore Resources",
      description: "Access our library of wellness articles, guides, and self-help materials to support your growth.",
      link: "/resources",
      linkText: "Browse Resources"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
              <CheckCircle2 
                className="w-10 h-10 text-green-600 dark:text-green-400" 
                aria-hidden="true"
              />
            </div>
            <Badge className="mx-auto mb-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
              Account Created Successfully
            </Badge>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome{userName ? `, ${userName}` : " to WholeWellness"}!
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Your account has been created. You're one step closer to your wellness journey.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {userEmail && (
              <div 
                className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                role="status"
                aria-live="polite"
              >
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Confirmation Email Sent
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    We've sent a welcome email to <strong>{userEmail}</strong>. 
                    Check your inbox for important information about your account.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-600" aria-hidden="true" />
                What's Next?
              </h3>
              
              <div className="grid gap-4">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border transition-all hover:shadow-md",
                        step.primary 
                          ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700" 
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          step.primary 
                            ? "bg-purple-600 text-white" 
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}>
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {step.title}
                            {step.primary && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {step.description}
                          </p>
                          <Link href={step.link}>
                            <Button 
                              variant={step.primary ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "mt-3",
                                step.primary && "bg-purple-600 hover:bg-purple-700"
                              )}
                              data-testid={`button-${step.linkText.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {step.linkText}
                              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Need help? Contact our support team at{" "}
                <a 
                  href="mailto:support@wholewellness-coaching.org" 
                  className="text-purple-600 hover:underline"
                >
                  support@wholewellness-coaching.org
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
