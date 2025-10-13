import SmartNavigation from "@/components/SmartNavigation";
import Footer from "@/components/Footer";
import { useChatUI } from "@/ui/ChatUIContext";
import { useRoute } from "wouter";

interface MemberLayoutProps {
  children: React.ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  const { chatActive } = useChatUI();
  const [isAICoachingRoute] = useRoute("/ai-coaching/:rest*");
  
  // Hide footer in chat mode or on AI coaching routes
  const hideFooter = chatActive || isAICoachingRoute;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SmartNavigation />
      <main className="flex-1 safe-bottom md:pb-0">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
