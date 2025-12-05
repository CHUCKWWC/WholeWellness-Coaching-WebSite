import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Users, BookOpen, ArrowRight, CheckCircle, PartyPopper } from "lucide-react";

interface NextStepOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  buttonText: string;
}

const nextStepOptions: NextStepOption[] = [
  {
    id: "ai-coaching",
    title: "Try AI Coaching",
    description: "Start a conversation with one of our 6 specialized AI coaches. Available 24/7 to support your wellness journey.",
    icon: <Sparkles className="h-8 w-8" />,
    href: "/ai-coaching",
    color: "from-blue-500 to-cyan-500",
    buttonText: "Start AI Coaching"
  },
  {
    id: "browse-coaches",
    title: "Browse Professional Coaches",
    description: "Find a certified coach who specializes in your areas of focus. Book your first session today.",
    icon: <Users className="h-8 w-8" />,
    href: "/coaches",
    color: "from-purple-500 to-pink-500",
    buttonText: "Find a Coach"
  },
  {
    id: "explore-resources",
    title: "Explore Resources",
    description: "Access our library of articles, worksheets, videos, and podcasts to support your growth.",
    icon: <BookOpen className="h-8 w-8" />,
    href: "/resources",
    color: "from-amber-500 to-orange-500",
    buttonText: "Browse Resources"
  }
];

export default function WelcomeNextSteps() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const firstName = user?.firstName || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
            <PartyPopper className="h-10 w-10 text-white" />
          </div>
          
          <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-4 w-4 mr-1" />
            Setup Complete!
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome, {firstName}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your account is all set up. Here's what you can do next to begin your wellness journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {nextStepOptions.map((option) => (
            <Card 
              key={option.id}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer group"
              data-testid={`card-option-${option.id}`}
            >
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {option.icon}
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-base">{option.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Link href={option.href}>
                  <Button
                    className={`w-full min-h-[48px] text-base bg-gradient-to-r ${option.color} hover:opacity-90 text-white`}
                    data-testid={`button-${option.id}`}
                  >
                    {option.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not sure where to start?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            We recommend trying our AI coaching first. It's available 24/7 and can help you explore your goals and challenges at your own pace.
          </p>
          <Link href="/ai-coaching">
            <Button 
              size="lg"
              className="min-h-[52px] text-lg px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              data-testid="button-recommended-action"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start with AI Coaching
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link href="/member-portal">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Go to My Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
