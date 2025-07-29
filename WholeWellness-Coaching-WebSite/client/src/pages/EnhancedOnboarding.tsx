import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  UserPlus, 
  Users, 
  ChevronRight,
  Star,
  Clock,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EnhancedOnboardingFlow from "@/components/EnhancedOnboardingFlow";

export default function EnhancedOnboarding() {
  const [selectedType, setSelectedType] = useState<"coach" | "client" | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();

  const handleTypeSelection = (type: "coach" | "client") => {
    setSelectedType(type);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    toast({
      title: "Welcome to WholeWellness!",
      description: `Your ${selectedType} onboarding has been completed successfully.`,
    });
  };

  if (showOnboarding && selectedType) {
    return (
      <EnhancedOnboardingFlow 
        type={selectedType}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join WholeWellness Coaching
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your path to wellness. Whether you're seeking guidance or ready to guide others, 
            we have the perfect onboarding experience for you.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Client Card */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Start Your Journey
                </Badge>
              </div>
              <CardTitle className="text-2xl text-gray-900">I'm Seeking Coaching</CardTitle>
              <p className="text-gray-600">
                Get personalized support and guidance from our expert coaches to achieve your wellness goals.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Personalized Matching</p>
                    <p className="text-sm text-gray-600">Get matched with coaches who specialize in your needs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Flexible Scheduling</p>
                    <p className="text-sm text-gray-600">Book sessions that fit your lifestyle</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Safe & Confidential</p>
                    <p className="text-sm text-gray-600">Your privacy and wellbeing are our top priority</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  className="w-full bg-primary hover:bg-secondary text-white transition-colors group"
                  onClick={() => handleTypeSelection("client")}
                >
                  Start Client Onboarding
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Coach Card */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden border-2 border-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Professional Opportunity
                </Badge>
              </div>
              <CardTitle className="text-2xl text-gray-900">I Want to Be a Coach</CardTitle>
              <p className="text-gray-600">
                Join our team of professional coaches and make a meaningful impact in people's lives.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Professional Network</p>
                    <p className="text-sm text-gray-600">Join a community of expert wellness professionals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Flexible Income</p>
                    <p className="text-sm text-gray-600">Set your rates and schedule on your terms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Full Support</p>
                    <p className="text-sm text-gray-600">Training, resources, and ongoing support provided</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors group"
                  onClick={() => handleTypeSelection("coach")}
                >
                  Start Coach Application
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose WholeWellness?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive onboarding process ensures the perfect match between coaches and clients, 
              creating lasting wellness transformations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Assessment</h3>
              <p className="text-sm text-gray-600">
                Detailed intake process to understand your unique needs and goals
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-secondary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Expert Matching</h3>
              <p className="text-sm text-gray-600">
                Advanced algorithm matches you with the most suitable wellness professional
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ongoing Support</h3>
              <p className="text-sm text-gray-600">
                Continuous guidance and resources throughout your wellness journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}