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
import { Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

// Core pages - loaded immediately
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

// Lazy-loaded pages for better performance
const Programs = lazy(() => import("@/pages/Programs"));
const AICoaching = lazy(() => import("@/pages/AICoaching"));
const Resources = lazy(() => import("@/pages/Resources"));
const Booking = lazy(() => import("@/pages/Booking"));
const Members = lazy(() => import("@/pages/Members"));
const WeightLossIntake = lazy(() => import("@/pages/WeightLossIntake"));
const Impact = lazy(() => import("@/pages/Impact"));
const Admin = lazy(() => import("@/pages/Admin"));
const CMS = lazy(() => import("@/pages/CMS"));
const Donate = lazy(() => import("@/pages/Donate"));
const MemberPortal = lazy(() => import("@/pages/MemberPortal"));
const CoachDashboard = lazy(() => import("@/pages/CoachDashboard"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const DonationPortal = lazy(() => import("@/pages/DonationPortal"));
const CoachPortal = lazy(() => import("@/pages/CoachPortal"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const OnboardingWizard = lazy(() => import("@/pages/OnboardingWizard"));
const PasswordReset = lazy(() => import("@/pages/PasswordReset"));
const EmailVerification = lazy(() => import("@/pages/EmailVerification"));
const HelpDemo = lazy(() => import("@/pages/HelpDemo"));
const MentalWellnessHub = lazy(() => import("@/pages/MentalWellnessHub"));
const PersonalizedRecommendations = lazy(() => import("@/pages/PersonalizedRecommendations"));
const DigitalOnboarding = lazy(() => import("@/pages/DigitalOnboarding"));
const CoachOnboarding = lazy(() => import("@/pages/CoachOnboarding"));
const CoachSignup = lazy(() => import("@/pages/CoachSignup"));
const CoachLogin = lazy(() => import("@/pages/CoachLogin"));
const CoachProfile = lazy(() => import("@/pages/CoachProfile"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const Subscribe = lazy(() => import("@/pages/Subscribe"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const VolunteerApplication = lazy(() => import("@/pages/VolunteerApplication"));
const WixBooking = lazy(() => import("@/pages/WixBooking"));
const Assessments = lazy(() => import("@/pages/assessments"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const EnhancedOnboarding = lazy(() => import("@/pages/EnhancedOnboarding"));
const CoachCertifications = lazy(() => import("@/pages/CoachCertifications"));
const ModuleLearning = lazy(() => import("@/pages/ModuleLearning"));
const CertificationDashboard = lazy(() => import("@/pages/CertificationDashboard"));
const CertificationGuide = lazy(() => import("@/pages/CertificationGuide"));
const AdminSecurity = lazy(() => import("@/pages/AdminSecurity"));
const AdminCoupons = lazy(() => import("@/pages/AdminCoupons"));
const WellnessJourneyRecommender = lazy(() => import("@/pages/WellnessJourneyRecommender"));
const AdminCertifications = lazy(() => import("@/pages/AdminCertifications"));
const AdminTestPayment = lazy(() => import("@/pages/AdminTestPayment"));

// Lazy route wrapper component
const LazyRoute = ({ component: Component, ...props }: any) => (
  <Suspense fallback={<LoadingSpinner />}>
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  </Suspense>
);

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <SmartNavigation />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/programs" component={(props) => <LazyRoute component={Programs} {...props} />} />
          <Route path="/ai-coaching" component={(props) => <LazyRoute component={AICoaching} {...props} />} />
          <Route path="/resources" component={(props) => <LazyRoute component={Resources} {...props} />} />
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
