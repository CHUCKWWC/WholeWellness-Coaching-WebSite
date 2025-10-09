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
// import Chatbot from "@/components/Chatbot"; // Component doesn't exist yet
import HelpSystem from "@/components/HelpSystem";
import EmpatheticHelpProvider from "@/components/EmpatheticHelpProvider";
import { Suspense, lazy, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LazyLoadWrapper, withLazyLoading } from "@/components/LazyLoadWrapper";
import { useRoutePreloader } from "@/utils/routePreloader";
import { useLocation } from "wouter";
// PerformanceMonitor removed to clean up obsolete components

// Core pages - loaded immediately
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EmailConfirm from "@/pages/EmailConfirm";
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
const CustomOnboarding = lazy(() => import("@/pages/CustomOnboarding"));
const ComingEvents = lazy(() => import("@/pages/ComingEvents"));
const CoachProfileView = lazy(() => import("@/pages/CoachProfileView"));
const UserProfileView = lazy(() => import("@/pages/UserProfileView"));
const VideoSession = lazy(() => import("@/pages/VideoSession"));
const SessionJoin = lazy(() => import("@/pages/SessionJoin"));
const Settings = lazy(() => import("@/pages/Settings"));
const AdminCrisisAlerts = lazy(() => import("@/pages/AdminCrisisAlerts"));

// Enhanced lazy route wrapper component with performance optimizations
const LazyRoute = ({ component: Component, loadingText, ...props }: any) => (
  <LazyLoadWrapper loadingText={loadingText}>
    <Component {...props} />
  </LazyLoadWrapper>
);

function Router() {
  const [location] = useLocation();
  
  // Temporarily disable preloading to fix re-render loop
  // const { preloadCriticalRoutes, preloadRelatedRoutes, preloadBasedOnUserRole } = useRoutePreloader();

  // Initialize performance optimizations - temporarily disabled
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     preloadCriticalRoutes();
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, []);

  // useEffect(() => {
  //   preloadRelatedRoutes(location);
  // }, [location]);

  // useEffect(() => {
  //   const userRole = localStorage.getItem('userRole') || 'guest';
  //   preloadBasedOnUserRole(userRole);
  // }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SmartNavigation />
      <main className="flex-1 safe-bottom">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/services" component={Services} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/email-confirm" component={EmailConfirm} />
          <Route path="/programs" component={(props) => <LazyRoute component={Programs} loadingText="Loading Programs..." {...props} />} />
          <Route path="/ai-coaching" component={(props) => <LazyRoute component={AICoaching} loadingText="Initializing AI Coaching..." {...props} />} />
          <Route path="/resources" component={(props) => <LazyRoute component={Resources} loadingText="Loading Resources..." {...props} />} />
          <Route path="/events" component={(props) => <LazyRoute component={ComingEvents} loadingText="Loading Events..." {...props} />} />
          <Route path="/contact" component={Contact} />
          <Route path="/booking" component={(props) => <LazyRoute component={Booking} loadingText="Loading Booking System..." {...props} />} />
          <Route path="/members" component={(props) => <LazyRoute component={Members} loadingText="Loading Member Portal..." {...props} />} />
          <Route path="/weight-loss-intake" component={(props) => <LazyRoute component={WeightLossIntake} loadingText="Loading Assessment..." {...props} />} />

          <Route path="/impact" component={(props) => <LazyRoute component={Impact} loadingText="Loading Impact Data..." {...props} />} />
          <Route path="/admin" component={(props) => <LazyRoute component={Admin} loadingText="Loading Admin Panel..." {...props} />} />
          <Route path="/cms" component={(props) => <LazyRoute component={CMS} loadingText="Loading Content Management..." {...props} />} />
          <Route path="/donate" component={(props) => <LazyRoute component={Donate} loadingText="Loading Donation Portal..." {...props} />} />
          <Route path="/member-portal" component={(props) => <LazyRoute component={MemberPortal} loadingText="Loading Member Dashboard..." {...props} />} />
          <Route path="/coach-dashboard" component={(props) => <LazyRoute component={CoachDashboard} loadingText="Loading Coach Dashboard..." {...props} />} />
          <Route path="/assessments" component={(props) => <LazyRoute component={Assessments} loadingText="Loading Assessments..." {...props} />} />
          <Route path="/user-profile" component={(props) => <LazyRoute component={UserProfile} loadingText="Loading Profile..." {...props} />} />
          <Route path="/settings" component={(props) => <LazyRoute component={Settings} loadingText="Loading Settings..." {...props} />} />
          <Route path="/admin-login" component={(props) => <LazyRoute component={AdminLogin} loadingText="Loading Admin Login..." {...props} />} />
          <Route path="/admin-dashboard" component={(props) => <LazyRoute component={AdminDashboard} loadingText="Loading Admin Dashboard..." {...props} />} />
          <Route path="/admin-security" component={(props) => <LazyRoute component={AdminSecurity} loadingText="Loading Security Settings..." {...props} />} />
          <Route path="/admin-coupons" component={(props) => <LazyRoute component={AdminCoupons} loadingText="Loading Coupon Management..." {...props} />} />
          <Route path="/admin-certifications" component={(props) => <LazyRoute component={AdminCertifications} loadingText="Loading Certification Management..." {...props} />} />
          <Route path="/admin-crisis-alerts" component={(props) => <LazyRoute component={AdminCrisisAlerts} loadingText="Loading Crisis Alerts..." {...props} />} />
          <Route path="/donation-portal" component={(props) => <LazyRoute component={DonationPortal} loadingText="Loading Donation System..." {...props} />} />
          <Route path="/coach-portal" component={(props) => <LazyRoute component={CoachPortal} loadingText="Loading Coach Portal..." {...props} />} />
          <Route path="/privacy" component={(props) => <LazyRoute component={Privacy} loadingText="Loading Privacy Policy..." {...props} />} />
          <Route path="/terms" component={(props) => <LazyRoute component={Terms} loadingText="Loading Terms of Service..." {...props} />} />
          <Route path="/onboarding" component={(props) => <LazyRoute component={OnboardingWizard} loadingText="Setting up your journey..." {...props} />} />
          <Route path="/reset-password" component={(props) => <LazyRoute component={PasswordReset} loadingText="Loading password reset..." {...props} />} />
          <Route path="/verify-email" component={(props) => <LazyRoute component={EmailVerification} loadingText="Verifying email..." {...props} />} />
          <Route path="/help-demo" component={(props) => <LazyRoute component={HelpDemo} loadingText="Loading help system..." {...props} />} />
          <Route path="/mental-wellness" component={(props) => <LazyRoute component={MentalWellnessHub} loadingText="Loading wellness resources..." {...props} />} />
          <Route path="/personalized-recommendations" component={(props) => <LazyRoute component={PersonalizedRecommendations} loadingText="Generating recommendations..." {...props} />} />
          <Route path="/digital-onboarding" component={(props) => <LazyRoute component={DigitalOnboarding} loadingText="Preparing onboarding..." {...props} />} />
          <Route path="/coach-onboarding" component={(props) => <LazyRoute component={CoachOnboarding} loadingText="Loading coach setup..." {...props} />} />
          <Route path="/coach-signup" component={(props) => <LazyRoute component={CoachSignup} loadingText="Loading coach registration..." {...props} />} />
          <Route path="/coach-login" component={(props) => <LazyRoute component={CoachLogin} loadingText="Loading coach login..." {...props} />} />
          <Route path="/coach-profile" component={(props) => <LazyRoute component={CoachProfile} loadingText="Loading coach profile..." {...props} />} />
          <Route path="/coach/:coachId" component={(props) => <LazyRoute component={CoachProfileView} loadingText="Loading coach profile..." {...props} />} />
          <Route path="/user/:userId" component={(props) => <LazyRoute component={UserProfileView} loadingText="Loading user profile..." {...props} />} />
          <Route path="/checkout" component={(props) => <LazyRoute component={Checkout} loadingText="Securing payment..." {...props} />} />
          <Route path="/payment-success" component={(props) => <LazyRoute component={PaymentSuccess} loadingText="Confirming payment..." {...props} />} />
          <Route path="/subscribe" component={(props) => <LazyRoute component={Subscribe} loadingText="Setting up subscription..." {...props} />} />
          <Route path="/subscription-success" component={(props) => <LazyRoute component={SubscriptionSuccess} loadingText="Activating subscription..." {...props} />} />
          <Route path="/volunteer-application" component={(props) => <LazyRoute component={VolunteerApplication} loadingText="Loading application..." {...props} />} />
          <Route path="/wix-booking" component={(props) => <LazyRoute component={WixBooking} loadingText="Loading booking system..." {...props} />} />
          <Route path="/enhanced-onboarding" component={(props) => <LazyRoute component={EnhancedOnboarding} loadingText="Personalizing experience..." {...props} />} />
          <Route path="/coach-certifications" component={(props) => <LazyRoute component={CoachCertifications} loadingText="Loading certifications..." {...props} />} />
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
          <Route path="/certification-dashboard" component={(props) => <LazyRoute component={CertificationDashboard} loadingText="Loading certification dashboard..." {...props} />} />
          <Route path="/certification-guide" component={(props) => <LazyRoute component={CertificationGuide} loadingText="Loading certification guide..." {...props} />} />
          <Route path="/wellness-journey" component={(props) => <LazyRoute component={WellnessJourneyRecommender} loadingText="Creating your wellness journey..." {...props} />} />
          <Route path="/admin/test-payment" component={(props) => <LazyRoute component={AdminTestPayment} loadingText="Loading payment test..." {...props} />} />
          <Route path="/custom-onboarding" component={(props) => <LazyRoute component={CustomOnboarding} loadingText="Loading onboarding experience..." {...props} />} />
          <Route path="/session/:sessionId/join" component={(props) => <LazyRoute component={SessionJoin} loadingText="Preparing session..." {...props} />} />
          <Route path="/session/:sessionId" component={(props) => <LazyRoute component={VideoSession} loadingText="Connecting..." {...props} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      {/* <Chatbot /> */}
      <HelpSystem />
      <FeatureSpotlight />
      <ProgressIndicator />
      <KeyboardShortcuts />
      <KeyboardShortcutsHint />
    </div>
  );
}

function App() {
  // Temporarily disable performance monitoring to fix re-render loop
  // useWebVitals();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EmpatheticHelpProvider>
          <Router />
          <Toaster />
          {/* Temporarily disabled: <PerformanceMonitor /> */}
        </EmpatheticHelpProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
