import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Users, Zap, ArrowRight, Shield, Clock, Star } from "lucide-react";

const AI_COACHING_PAYMENT_LINK = import.meta.env.VITE_STRIPE_AI_COACHING_LINK || "https://buy.stripe.com/3cIfZh0vQ0Xg4PIcOl3oA04";
const LIVE_COACHING_PAYMENT_LINK = import.meta.env.VITE_STRIPE_LIVE_COACHING_LINK || "https://buy.stripe.com/bJe28rdiC7lEdme15D3oA03";
const COMBINED_COACHING_PAYMENT_LINK = import.meta.env.VITE_STRIPE_COMBINED_LINK || "https://buy.stripe.com/4gMdR992mfSabe601z3oA02";

interface Package {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  popular?: boolean;
  paymentLink: string;
  color: string;
}

const packages: Package[] = [
  {
    id: "ai",
    name: "AI Coaching",
    price: "$19.99",
    period: "/month",
    description: "24/7 AI-powered coaching support for your wellness journey",
    icon: <Sparkles className="h-8 w-8" />,
    features: [
      "6 specialized AI coaches",
      "Unlimited conversations",
      "Personalized insights",
      "Progress tracking",
      "Wellness resources library",
      "Mobile-friendly access"
    ],
    paymentLink: AI_COACHING_PAYMENT_LINK,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "live",
    name: "Live Coaching",
    price: "$599",
    period: " one-time",
    description: "Work directly with a certified professional coach",
    icon: <Users className="h-8 w-8" />,
    features: [
      "6 one-on-one sessions",
      "Personalized coaching plan",
      "Video calls via Google Meet",
      "Email support between sessions",
      "Session recordings",
      "Certificate of completion"
    ],
    popular: true,
    paymentLink: LIVE_COACHING_PAYMENT_LINK,
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "combined",
    name: "Complete Wellness",
    price: "$799",
    period: " one-time",
    description: "The ultimate coaching experience with AI + live support",
    icon: <Zap className="h-8 w-8" />,
    features: [
      "Everything in AI Coaching",
      "Everything in Live Coaching",
      "Priority coach matching",
      "Extended session times",
      "Lifetime resource access",
      "Community group access"
    ],
    paymentLink: COMBINED_COACHING_PAYMENT_LINK,
    color: "from-amber-500 to-orange-500"
  }
];

export default function PackageSelection() {
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg.id);
    setIsProcessing(true);
    
    sessionStorage.setItem('selectedPackage', pkg.id);
    sessionStorage.setItem('pendingAssessment', 'true');
    
    window.location.href = pkg.paymentLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            Step 2 of 4
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Coaching Package
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select the coaching experience that best fits your wellness goals and preferences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
                selectedPackage === pkg.id 
                  ? 'ring-2 ring-purple-500 shadow-lg scale-[1.02]' 
                  : 'hover:scale-[1.01]'
              } ${pkg.popular ? 'border-purple-300 dark:border-purple-700' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
              data-testid={`card-package-${pkg.id}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-purple-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center text-white mb-4`}>
                  {pkg.icon}
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription className="text-base">{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{pkg.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">{pkg.period}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full min-h-[48px] text-base bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPackage(pkg);
                  }}
                  disabled={isProcessing && selectedPackage === pkg.id}
                  data-testid={`button-select-${pkg.id}`}
                >
                  {isProcessing && selectedPackage === pkg.id ? (
                    "Redirecting to payment..."
                  ) : (
                    <>
                      Select {pkg.name}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Secure payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock className="h-5 w-5 text-blue-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Star className="h-5 w-5 text-amber-500" />
              <span>100% satisfaction guarantee</span>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-sm">
          After payment, you'll complete a brief discovery assessment to personalize your experience.
        </p>
      </div>
    </div>
  );
}
