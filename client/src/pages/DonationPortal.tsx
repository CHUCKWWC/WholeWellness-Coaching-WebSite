import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Heart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Star,
  Gift,
  Shield,
  Clock,
  Trophy,
  Target,
  Zap,
  Award,
  CreditCard,
  PaypalIcon,
  Wallet,
  ChevronRight,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface DonationPreset {
  id: string;
  amount: number;
  label: string;
  description: string;
  icon: string;
  isPopular: boolean;
  impact: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  endDate: string;
  isActive: boolean;
  imageUrl: string;
  category: string;
  progress: number;
}

interface MembershipBenefit {
  id: string;
  membershipLevel: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
}

interface UserDonation {
  id: string;
  amount: number;
  currency: string;
  donationType: string;
  status: string;
  createdAt: string;
  campaign?: {
    title: string;
  };
}

interface ImpactMetric {
  id: string;
  metric: string;
  value: number;
  period: string;
  description: string;
}

export default function DonationPortal() {
  const [activeTab, setActiveTab] = useState("donate");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one-time");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch donation presets
  const { data: presets, isLoading: presetsLoading } = useQuery<DonationPreset[]>({
    queryKey: ["/api/donation-presets"],
  });

  // Fetch active campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Fetch membership benefits
  const { data: benefits, isLoading: benefitsLoading } = useQuery<MembershipBenefit[]>({
    queryKey: ["/api/membership-benefits"],
  });

  // Fetch user donations (if authenticated)
  const { data: userDonations, isLoading: donationsLoading } = useQuery<UserDonation[]>({
    queryKey: ["/api/user/donations"],
    enabled: isAuthenticated,
  });

  // Fetch impact metrics
  const { data: impactMetrics, isLoading: impactLoading } = useQuery<ImpactMetric[]>({
    queryKey: ["/api/impact-metrics"],
  });

  // Create donation mutation
  const createDonationMutation = useMutation({
    mutationFn: async (donationData: any) => {
      const response = await apiRequest("POST", "/api/donations", donationData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Thank you for your donation!",
        description: "Your contribution will help transform lives.",
      });
      // Redirect to payment processing
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Error processing donation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDonate = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a donation.",
        variant: "destructive",
      });
      return;
    }

    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    createDonationMutation.mutate({
      amount,
      currency: "USD",
      donationType,
      paymentMethod,
      campaignId: selectedCampaign,
      isAnonymous,
      dedicatedTo: dedicatedTo || null,
      message: message || null,
    });
  };

  const membershipTiers = [
    {
      level: "supporter",
      name: "Supporter",
      minAmount: 25,
      color: "bg-blue-100 text-blue-800",
      benefits: ["Monthly newsletter", "Impact updates", "Community access"]
    },
    {
      level: "champion",
      name: "Champion",
      minAmount: 100,
      color: "bg-purple-100 text-purple-800",
      benefits: ["All Supporter benefits", "Exclusive webinars", "Priority support", "Special recognition"]
    },
    {
      level: "guardian",
      name: "Guardian",
      minAmount: 500,
      color: "bg-gold-100 text-gold-800",
      benefits: ["All Champion benefits", "VIP events", "Direct founder access", "Legacy naming rights"]
    }
  ];

  const impactStories = [
    {
      title: "Lives Transformed",
      value: "1,247",
      description: "Women who have received life coaching support",
      icon: Heart
    },
    {
      title: "Sessions Funded",
      value: "3,891",
      description: "Free coaching sessions provided to those in need",
      icon: Users
    },
    {
      title: "Communities Reached",
      value: "156",
      description: "Locations where our services have made an impact",
      icon: Target
    },
    {
      title: "Success Stories",
      value: "892",
      description: "Documented transformations and achievements",
      icon: Trophy
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Make a Difference</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your donation helps provide life-changing coaching to individuals who need it most. 
            Every contribution, no matter the size, creates lasting impact.
          </p>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impactStories.map((story, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <story.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{story.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{story.title}</div>
                <div className="text-xs text-gray-500">{story.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="donate">Donate Now</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
            <TabsTrigger value="history">My Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="donate">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Donation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Make Your Donation
                  </CardTitle>
                  <CardDescription>
                    Choose your donation amount and help transform lives today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Donation Type */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Donation Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant={donationType === "one-time" ? "default" : "outline"}
                        onClick={() => setDonationType("one-time")}
                        className="h-12"
                      >
                        One-time
                      </Button>
                      <Button 
                        variant={donationType === "monthly" ? "default" : "outline"}
                        onClick={() => setDonationType("monthly")}
                        className="h-12"
                      >
                        Monthly
                      </Button>
                    </div>
                  </div>

                  {/* Preset Amounts */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Select Amount</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {presets?.map((preset) => (
                        <Button
                          key={preset.id}
                          variant={selectedAmount === preset.amount ? "default" : "outline"}
                          onClick={() => {
                            setSelectedAmount(preset.amount);
                            setCustomAmount("");
                          }}
                          className="h-16 flex flex-col items-center justify-center relative"
                        >
                          {preset.isPopular && (
                            <Badge className="absolute -top-2 -right-2 text-xs">Popular</Badge>
                          )}
                          <div className="text-lg font-bold">${preset.amount}</div>
                          <div className="text-xs text-gray-500">{preset.label}</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount */}
                  <div>
                    <Label htmlFor="custom-amount" className="text-base font-medium mb-3 block">
                      Or Enter Custom Amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Campaign Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Support a Campaign (Optional)</Label>
                    <Select value={selectedCampaign || ""} onValueChange={setSelectedCampaign}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a campaign or general fund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">General Fund</SelectItem>
                        {campaigns?.map((campaign) => (
                          <SelectItem key={campaign.id} value={campaign.id}>
                            {campaign.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dedication */}
                  <div>
                    <Label htmlFor="dedicated-to" className="text-base font-medium mb-3 block">
                      Dedicate This Donation (Optional)
                    </Label>
                    <Input
                      id="dedicated-to"
                      placeholder="In honor of or in memory of..."
                      value={dedicatedTo}
                      onChange={(e) => setDedicatedTo(e.target.value)}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-base font-medium mb-3 block">
                      Personal Message (Optional)
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Share why you're supporting our mission..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous">Make this donation anonymous</Label>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Payment Method</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <Button 
                        variant={paymentMethod === "stripe" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("stripe")}
                        className="h-12 flex items-center"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Card
                      </Button>
                      <Button 
                        variant={paymentMethod === "paypal" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("paypal")}
                        className="h-12 flex items-center"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        PayPal
                      </Button>
                      <Button 
                        variant={paymentMethod === "bank" ? "default" : "outline"}
                        onClick={() => setPaymentMethod("bank")}
                        className="h-12 flex items-center"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Bank
                      </Button>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <Button 
                    onClick={handleDonate}
                    className="w-full h-12 text-lg font-medium"
                    disabled={createDonationMutation.isPending}
                  >
                    {createDonationMutation.isPending ? (
                      "Processing..."
                    ) : (
                      <>
                        Donate ${selectedAmount || customAmount || 0}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Donation Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-green-500" />
                    Your Impact
                  </CardTitle>
                  <CardDescription>
                    See how your donation makes a difference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {presets?.map((preset) => (
                      <div key={preset.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-lg font-semibold">${preset.amount}</div>
                          <Badge variant="outline">{preset.label}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">{preset.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns?.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={campaign.imageUrl} 
                      alt={campaign.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-2 right-2">{campaign.category}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.title}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Raised: ${campaign.raisedAmount}</span>
                        <span>Goal: ${campaign.goalAmount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedCampaign(campaign.id);
                        setActiveTab("donate");
                      }}
                    >
                      Support This Campaign
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="membership">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipTiers.map((tier) => (
                <Card key={tier.level} className="relative overflow-hidden">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>
                      ${tier.minAmount}+ {donationType === "monthly" ? "monthly" : "one-time"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-6"
                      onClick={() => {
                        setSelectedAmount(tier.minAmount);
                        setActiveTab("donate");
                      }}
                    >
                      Become a {tier.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="space-y-8">
              {/* Current Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Our Current Impact</CardTitle>
                  <CardDescription>Real-time metrics showing the difference we're making</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {impactMetrics?.map((metric) => (
                      <div key={metric.id} className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                        <div className="text-sm font-medium text-gray-700">{metric.metric}</div>
                        <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Success Stories */}
              <Card>
                <CardHeader>
                  <CardTitle>Success Stories</CardTitle>
                  <CardDescription>Real stories from those we've helped</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          S
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Sarah M.</div>
                          <div className="text-sm text-gray-500">Domestic Violence Survivor</div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">
                        "The coaching I received helped me rebuild my confidence and start a new career. 
                        I'm now helping other women in similar situations."
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          M
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Maria L.</div>
                          <div className="text-sm text-gray-500">Single Mother</div>
                        </div>
                      </div>
                      <p className="text-gray-700 italic">
                        "Through the life coaching program, I learned to balance work and family while 
                        pursuing my dreams. My children are proud of who I've become."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {isAuthenticated ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Donation History</CardTitle>
                  <CardDescription>Track your contributions and impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userDonations?.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">${donation.amount} {donation.currency}</div>
                          <div className="text-sm text-gray-500">
                            {donation.campaign?.title || "General Fund"} • {donation.donationType}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge 
                          variant={donation.status === "completed" ? "default" : "secondary"}
                        >
                          {donation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Please Log In</h3>
                  <p className="text-gray-500">
                    You need to be logged in to view your donation history.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}