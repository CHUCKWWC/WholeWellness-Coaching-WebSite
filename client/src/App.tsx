import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Programs from "@/pages/Programs";
import AICoaching from "@/pages/AICoaching";
import Resources from "@/pages/Resources";
import Contact from "@/pages/Contact";
import Booking from "@/pages/Booking";
import Members from "@/pages/Members";
import WeightLossIntake from "@/pages/WeightLossIntake";
import BetaTestPortal from "@/pages/BetaTestPortal";
import Impact from "@/pages/Impact";
import Admin from "@/pages/Admin";
import CMS from "@/pages/CMS";
import Donate from "@/pages/Donate";
import MemberPortal from "@/pages/MemberPortal";
import CoachDashboard from "@/pages/CoachDashboard";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/programs" component={Programs} />
          <Route path="/ai-coaching" component={AICoaching} />
          <Route path="/resources" component={Resources} />
          <Route path="/contact" component={Contact} />
          <Route path="/booking" component={Booking} />
          <Route path="/members" component={Members} />
          <Route path="/weight-loss-intake" component={WeightLossIntake} />
          <Route path="/beta-test/:sessionId?" component={BetaTestPortal} />
          <Route path="/impact" component={Impact} />
          <Route path="/admin" component={Admin} />
          <Route path="/cms" component={CMS} />
          <Route path="/donate" component={Donate} />
          <Route path="/member-portal" component={MemberPortal} />
          <Route path="/coach-dashboard" component={CoachDashboard} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
