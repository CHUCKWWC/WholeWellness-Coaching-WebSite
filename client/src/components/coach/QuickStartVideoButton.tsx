import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuickStartVideoButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function QuickStartVideoButton({ 
  variant = "default", 
  size = "default",
  className = ""
}: QuickStartVideoButtonProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const quickStartMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      const response = await apiRequest("POST", "/api/video/sessions/instant", {
        title: `Quick Call - ${timeString}`,
        description: "Instant video call",
        maxParticipants: 10,
        recordingEnabled: true,
      });
      return response;
    },
    onSuccess: (data) => {
      // Immediately navigate to the video session
      const sessionId = data.session?.id;
      if (sessionId) {
        setLocation(`/session/${sessionId}`);
      } else {
        toast({
          title: "Error",
          description: "Session created but ID missing",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start Call",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      onClick={() => quickStartMutation.mutate()}
      disabled={quickStartMutation.isPending}
      variant={variant}
      size={size}
      className={className}
      data-testid="button-quick-start-video"
    >
      {quickStartMutation.isPending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <Video className="h-4 w-4 mr-2" />
          Start Video Call
        </>
      )}
    </Button>
  );
}
