import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SmartNavigation from "@/components/SmartNavigation";
import FeatureSpotlight from "@/components/FeatureSpotlight";
import ProgressIndicator from "@/components/ProgressIndicator";
import KeyboardShortcuts, { KeyboardShortcutsHint } from "@/components/KeyboardShortcuts";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import HelpSystem from "@/components/HelpSystem";
import EmpatheticHelpProvider from "@/components/EmpatheticHelpProvider";

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

import Impact from "@/pages/Impact";
import Admin from "@/pages/Admin";
import CMS from "@/pages/CMS";
import Donate from "@/pages/Donate";
import MemberPortal from "@/pages/MemberPortal";
import CoachDashboard from "@/pages/CoachDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import DonationPortal from "@/pages/DonationPortal";
import CoachPortal from "@/pages/CoachPortal";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import OnboardingWizard from "@/pages/OnboardingWizard";
import PasswordReset from "@/pages/PasswordReset";
import EmailVerification from "@/pages/EmailVerification";
import HelpDemo from "@/pages/HelpDemo";
import MentalWellnessHub from "@/pages/MentalWellnessHub";
import PersonalizedRecommendations from "@/pages/PersonalizedRecommendations";
import DigitalOnboarding from "@/pages/DigitalOnboarding";
import CoachOnboarding from "@/pages/CoachOnboarding";
import CoachSignup from "@/pages/CoachSignup";
import CoachLogin from "@/pages/CoachLogin";
import CoachProfile from "@/pages/CoachProfile";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Subscribe from "@/pages/Subscribe";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import VolunteerApplication from "@/pages/VolunteerApplication";
import WixBooking from "@/pages/WixBooking";
import Assessments from "@/pages/assessments";
import UserProfile from "@/pages/UserProfile";
import EnhancedOnboarding from "@/pages/EnhancedOnboarding";
import CoachCertifications from "@/pages/CoachCertifications";
import ModuleLearning from "@/pages/ModuleLearning";
import CertificationDashboard from "@/pages/CertificationDashboard";
import CertificationGuide from "@/pages/CertificationGuide";
import AdminSecurity from "@/pages/AdminSecurity";
import AdminCoupons from "@/pages/AdminCoupons";
import WellnessJourneyRecommender from "@/pages/WellnessJourneyRecommender";
import AdminCertifications from "@/pages/AdminCertifications";
import AdminTestPayment from "@/pages/AdminTestPayment";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <SmartNavigation />
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

          <Route path="/impact" component={Impact} />
          <Route path="/admin" component={Admin} />
          <Route path="/cms" component={CMS} />
          <Route path="/donate" component={Donate} />
          <Route path="/member-portal" component={MemberPortal} />
          <Route path="/coach-dashboard" component={CoachDashboard} />
          <Route path="/assessments" component={Assessments} />
          <Route path="/user-profile" component={UserProfile} />
          <Route path="/admin-login" component={AdminLogin} />
          <Route path="/admin-dashboard" component={AdminDashboard} />
          <Route path="/admin-security" component={AdminSecurity} />
          <Route path="/admin-coupons" component={AdminCoupons} />
          <Route path="/admin-certifications" component={AdminCertifications} />
          <Route path="/donation-portal" component={DonationPortal} />
          <Route path="/coach-portal" component={CoachPortal} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/onboarding" component={OnboardingWizard} />
          <Route path="/reset-password" component={PasswordReset} />
          <Route path="/verify-email" component={EmailVerification} />
          <Route path="/help-demo" component={HelpDemo} />
          <Route path="/mental-wellness" component={MentalWellnessHub} />
          <Route path="/personalized-recommendations" component={PersonalizedRecommendations} />
          <Route path="/digital-onboarding" component={DigitalOnboarding} />
          <Route path="/coach-onboarding" component={CoachOnboarding} />
          <Route path="/coach-signup" component={CoachSignup} />
          <Route path="/coach-login" component={CoachLogin} />
          <Route path="/coach-profile" component={CoachProfile} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/subscription-success" component={SubscriptionSuccess} />
          <Route path="/volunteer-application" component={VolunteerApplication} />
          <Route path="/wix-booking" component={WixBooking} />
          <Route path="/enhanced-onboarding" component={EnhancedOnboarding} />
          <Route path="/coach-certifications" component={CoachCertifications} />
          <Route path="/module-learning" component={() => {
            const params = new URLSearchParams(window.location.search);
            const courseId = params.get('courseId');
            const enrollmentId = params.get('enrollmentId');
            
            // Validate required parameters
            if (!courseId || !enrollmentId) {
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Missing Parameters</h1>
                    <p className="text-gray-600 mb-4">
                      Course ID and Enrollment ID are required to access module learning.
                    </p>
                    <a href="/coach-certifications" className="text-blue-600 hover:underline">
                      Return to Certifications
                    </a>
                  </div>
                </div>
              );
            }
            
            return <ModuleLearning courseId={courseId} enrollmentId={enrollmentId} />;
          }} />
          <Route path="/certification-dashboard" component={CertificationDashboard} />
          <Route path="/certification-guide" component={CertificationGuide} />
          <Route path="/wellness-journey" component={WellnessJourneyRecommender} />
          <Route path="/admin/test-payment" component={AdminTestPayment} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Chatbot />
      <HelpSystem />
      <FeatureSpotlight />
      <ProgressIndicator />
      <KeyboardShortcuts />
      <KeyboardShortcutsHint />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EmpatheticHelpProvider>
          <Router />
          <Toaster />
        </EmpatheticHelpProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
