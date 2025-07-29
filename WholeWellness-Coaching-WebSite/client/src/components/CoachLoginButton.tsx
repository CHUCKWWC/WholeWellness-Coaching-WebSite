import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/hooks/useAuth";

export default function CoachLoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isPulsing, setIsPulsing] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Hide button if user is already authenticated as a coach
  useEffect(() => {
    if (isAuthenticated && user?.role === "coach") {
      setIsVisible(false);
    } else if (!isAuthenticated) {
      setIsVisible(true);
    }
  }, [isAuthenticated, user]);

  // Pulse animation control
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Animated background rings */}
      <div className="absolute inset-0 -m-4">
        <div className={cn(
          "absolute inset-0 rounded-full bg-primary/15 animate-ping",
          isPulsing ? "opacity-75" : "opacity-0"
        )} style={{ animationDuration: "3s" }} />
        <div className={cn(
          "absolute inset-2 rounded-full bg-primary/25 animate-ping",
          isPulsing ? "opacity-50" : "opacity-0"
        )} style={{ animationDuration: "3s", animationDelay: "1s" }} />
        <div className={cn(
          "absolute inset-4 rounded-full bg-primary/35 animate-ping",
          isPulsing ? "opacity-25" : "opacity-0"
        )} style={{ animationDuration: "3s", animationDelay: "2s" }} />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className={cn(
              "relative bg-gradient-to-r from-primary via-primary/90 to-primary/80",
              "hover:from-primary/95 hover:via-primary/85 hover:to-primary/75",
              "text-white shadow-2xl rounded-full p-4 h-auto min-w-[150px]",
              "transform transition-all duration-500 ease-in-out",
              "hover:scale-110 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]",
              "hover:-translate-y-2 active:scale-95",
              "coach-float coach-glow group overflow-hidden",
              "border-2 border-white/20"
            )}
            size="lg"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-in-out" />
            
            {/* Multiple sparkle icons */}
            <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-300 animate-pulse" />
            <Sparkles className="absolute bottom-1 left-1 h-2 w-2 text-yellow-200 animate-pulse" style={{ animationDelay: "0.5s" }} />
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-3 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
              <div className="absolute bottom-3 right-4 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: "2s" }} />
            </div>
            
            {/* Main content with enhanced animations */}
            <GraduationCap className="h-5 w-5 mr-2 transform group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 ease-in-out" />
            <span className="font-bold relative z-10 tracking-wide">Coach Login</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-center text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            Coach Portal Access
          </DialogTitle>
          <div className="mb-4 text-center text-sm text-gray-600">
            Sign in to access your coaching dashboard, certification courses, and client management tools.
          </div>
          <AuthForm onSuccess={() => setIsOpen(false)} />
          
          {/* Coach benefits */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="text-xs text-gray-600 text-center mb-2">
              <strong>Coach Benefits:</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Certification Courses
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Client Management
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Progress Tracking
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Professional Tools
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}