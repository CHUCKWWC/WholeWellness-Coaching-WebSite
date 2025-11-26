import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle,
  ClipboardList, 
  Brain, 
  Users,
  UserCircle,
  Calendar,
  BookOpen,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  linkText: string;
  completed: boolean;
}

interface WelcomeChecklistProps {
  userName?: string;
  onDismiss?: () => void;
  className?: string;
}

export function WelcomeChecklist({ userName, onDismiss, className }: WelcomeChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your photo and personal details to personalize your experience",
      icon: UserCircle,
      link: "/profile",
      linkText: "Edit Profile",
      completed: false
    },
    {
      id: "assessment",
      title: "Take Discovery Assessment",
      description: "Help us understand your wellness goals and needs",
      icon: ClipboardList,
      link: "/digital-onboarding?startQuiz=true",
      linkText: "Start Assessment",
      completed: false
    },
    {
      id: "ai-coaching",
      title: "Try AI Coaching",
      description: "Have your first conversation with one of our 6 AI coaches",
      icon: Brain,
      link: "/ai-coaching",
      linkText: "Chat Now",
      completed: false
    },
    {
      id: "browse-coaches",
      title: "Explore Professional Coaches",
      description: "Browse certified coaches and find your perfect match",
      icon: Users,
      link: "/coaches",
      linkText: "View Coaches",
      completed: false
    },
    {
      id: "schedule",
      title: "Schedule Your First Session",
      description: "Book a live coaching session with a professional",
      icon: Calendar,
      link: "/subscribe",
      linkText: "Book Session",
      completed: false
    },
    {
      id: "resources",
      title: "Explore Wellness Resources",
      description: "Access articles, guides, and self-help materials",
      icon: BookOpen,
      link: "/resources",
      linkText: "Browse Library",
      completed: false
    }
  ]);

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem('welcomeChecklistProgress');
    if (savedProgress) {
      const completedIds = JSON.parse(savedProgress);
      setItems(prev => prev.map(item => ({
        ...item,
        completed: completedIds.includes(item.id)
      })));
    }

    const isDismissed = localStorage.getItem('welcomeChecklistDismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  const toggleItem = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      const completedIds = updated.filter(i => i.completed).map(i => i.id);
      localStorage.setItem('welcomeChecklistProgress', JSON.stringify(completedIds));
      return updated;
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('welcomeChecklistDismissed', 'true');
    onDismiss?.();
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;
  const allComplete = completedCount === items.length;

  if (dismissed) {
    return null;
  }

  return (
    <Card className={cn("shadow-lg border-purple-200 dark:border-purple-800", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome{userName ? `, ${userName}` : ""}!
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete these steps to get the most from WholeWellness
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            aria-label="Dismiss welcome checklist"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {completedCount} of {items.length} completed
            </span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            aria-label={`Onboarding progress: ${completedCount} of ${items.length} steps completed`}
          />
        </div>

        {allComplete && (
          <div 
            className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium">All steps complete! You're all set to enjoy WholeWellness.</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "p-3 rounded-lg border transition-all",
                item.completed 
                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" 
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                    item.completed 
                      ? "bg-green-500 text-white" 
                      : "border-2 border-gray-300 dark:border-gray-600 hover:border-purple-500"
                  )}
                  aria-label={item.completed ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as complete`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Circle className="w-4 h-4 text-transparent" aria-hidden="true" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      "w-4 h-4",
                      item.completed ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400"
                    )} aria-hidden="true" />
                    <h4 className={cn(
                      "font-medium text-sm",
                      item.completed 
                        ? "text-green-700 dark:text-green-300 line-through" 
                        : "text-gray-900 dark:text-white"
                    )}>
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                  
                  {!item.completed && (
                    <Link href={item.link}>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 mt-2 text-purple-600 hover:text-purple-700"
                        data-testid={`link-checklist-${item.id}`}
                      >
                        {item.linkText}
                        <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="w-full"
            data-testid="button-dismiss-checklist"
          >
            I'll explore on my own
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WelcomeChecklist;
