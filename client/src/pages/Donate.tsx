import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Heart, Star, Gift, Zap, Users, Target, Sparkles, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DonationPreset {
  id: string;
  amount: number;
  label: string;
  description: string;
  icon: string;
  isPopular: boolean;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  imageUrl?: string;
  category: string;
  endDate?: string;
}

const emotiveIcons = {
  heart: Heart,
  star: Star,
  gift: Gift,
  zap: Zap,
  users: Users,
  target: Target,
  sparkles: Sparkles,
  award: Award,
};

export default function Donate() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);

  // Fetch donation presets
  const { data: presets = [] } = useQuery<DonationPreset[]>({
    queryKey: ["/api/donations/presets"],
  });

  // Fetch active campaigns
  const { data: campaigns = [] } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns/active"],
  });

  // Fetch user's impact metrics
  const { data: userImpact } = useQuery({
    queryKey: ["/api/user/impact"],
    enabled: isAuthenticated,
  });

  // Create donation mutation
  const createDonationMutation = useMutation({
    mutationFn: async (donationData: any) => {
      const response = await fetch("/api/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(donationData),
      });
      if (!response.ok) throw new Error("Failed to create donation");
      return response.json();
    },
    onSuccess: (data) => {
      // Show reward animation for recurring donors
      if (user?.donationTotal > 0) {
        setShowRewardAnimation(true);
        setTimeout(() => setShowRewardAnimation(false), 3000);
      }
      
      // Redirect to Stripe checkout or show success
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Thank you for your donation!",
          description: `Your ${donationType} donation of $${getAmount()} is being processed.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Donation failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const getAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const handleDonate = () => {
    const amount = getAmount();
    if (amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount of at least $1",
        variant: "destructive",
      });
      return;
    }

    createDonationMutation.mutate({
      amount,
      donationType,
      isAnonymous,
      message,
      campaignId: selectedCampaign,
    });
  };

  const getMembershipBadge = (level: string) => {
    const badges = {
      free: { label: "Supporter", color: "bg-blue-500", icon: Heart },
      supporter: { label: "Champion", color: "bg-green-500", icon: Star },
      champion: { label: "Guardian", color: "bg-purple-500", icon: Award },
      guardian: { label: "Hero", color: "bg-gold-500", icon: Sparkles },
    };
    return badges[level as keyof typeof badges] || badges.free;
  };

  const calculateRewardPoints = (amount: number) => {
    const basePoints = Math.floor(amount);
    const bonusMultiplier = donationType === "monthly" ? 2 : 1;
    const loyaltyBonus = user?.donationTotal > 100 ? 1.5 : 1;
    return Math.floor(basePoints * bonusMultiplier * loyaltyBonus);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Reward Animation Overlay */}
      <AnimatePresence>
        {showRewardAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className="bg-white rounded-full p-8 text-center"
            >
              <Sparkles className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900">Bonus Points!</h3>
              <p className="text-gray-600">Thank you for your continued support!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Make a Difference Today</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your donation helps us provide life-changing coaching services to those who need it most.
          Every contribution creates lasting impact in someone's life.
        </p>
      </div>

      {/* User Impact Dashboard */}
      {isAuthenticated && userImpact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Your Impact</h3>
            <Badge className={getMembershipBadge(user?.membershipLevel || 'free').color}>
              {getMembershipBadge(user?.membershipLevel || 'free').label}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userImpact.livesImpacted || 0}</div>
              <div className="text-sm text-gray-600">Lives Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${userImpact.totalDonated || 0}</div>
              <div className="text-sm text-gray-600">Total Donated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userImpact.rewardPoints || 0}</div>
              <div className="text-sm text-gray-600">Reward Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{userImpact.sessionsSupported || 0}</div>
              <div className="text-sm text-gray-600">Sessions Supported</div>
            </div>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="donate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donate">Make a Donation</TabsTrigger>
          <TabsTrigger value="campaigns">Support a Campaign</TabsTrigger>
        </TabsList>

        <TabsContent value="donate" className="space-y-6">
          {/* Quick Donation Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Quick Donation
              </CardTitle>
              <CardDescription>
                Choose an amount or enter a custom donation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Amount Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presets.map((preset) => {
                  const IconComponent = emotiveIcons[preset.icon as keyof typeof emotiveIcons] || Heart;
                  return (
                    <motion.div
                      key={preset.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={selectedAmount === preset.amount ? "default" : "outline"}
                        className="h-20 flex flex-col items-center gap-2 relative"
                        onClick={() => {
                          setSelectedAmount(preset.amount);
                          setCustomAmount("");
                        }}
                      >
                        {preset.isPopular && (
                          <Badge className="absolute -top-2 -right-2 text-xs">Popular</Badge>
                        )}
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <div className="font-bold">${preset.amount}</div>
                          <div className="text-xs opacity-70">{preset.label}</div>
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-8"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                  />
                </div>
              </div>

              {/* Donation Type */}
              <div className="flex items-center space-x-4">
                <Button
                  variant={donationType === "one-time" ? "default" : "outline"}
                  onClick={() => setDonationType("one-time")}
                >
                  One-time
                </Button>
                <Button
                  variant={donationType === "monthly" ? "default" : "outline"}
                  onClick={() => setDonationType("monthly")}
                  className="relative"
                >
                  Monthly
                  <Badge className="ml-2 text-xs">2x Points</Badge>
                </Button>
              </div>

              {/* Reward Points Preview */}
              {getAmount() > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      You'll earn {calculateRewardPoints(getAmount())} reward points!
                    </span>
                  </div>
                  {donationType === "monthly" && (
                    <p className="text-sm text-yellow-700 mt-1">
                      Monthly donations earn 2x points + loyalty bonus!
                    </p>
                  )}
                </motion.div>
              )}

              {/* Optional Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Optional Message</label>
                <Textarea
                  placeholder="Share why you're donating or dedicate this gift..."
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
                <label htmlFor="anonymous" className="text-sm font-medium">
                  Make this donation anonymous
                </label>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                disabled={getAmount() < 1 || createDonationMutation.isPending}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {createDonationMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <Heart className="h-5 w-5 mr-2" />
                    Donate ${getAmount()} {donationType === "monthly" ? "Monthly" : ""}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`cursor-pointer transition-all ${
                  selectedCampaign === campaign.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCampaign(
                  selectedCampaign === campaign.id ? null : campaign.id
                )}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {campaign.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{campaign.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>${campaign.raisedAmount} of ${campaign.goalAmount}</span>
                        </div>
                        <Progress 
                          value={(campaign.raisedAmount / campaign.goalAmount) * 100} 
                          className="h-2"
                        />
                      </div>
                      {campaign.endDate && (
                        <p className="text-sm text-muted-foreground">
                          Ends {new Date(campaign.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {selectedCampaign && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Support This Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[25, 50, 100, 250].map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount("");
                        }}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={handleDonate}
                    disabled={getAmount() < 1 || createDonationMutation.isPending}
                    className="w-full"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Support Campaign - ${getAmount()}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Impact Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Your Donation Impact</CardTitle>
          <CardDescription>
            See how your contribution makes a real difference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">$25 provides</div>
              <div className="text-sm text-gray-600">One coaching session for a survivor</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">$50 supports</div>
              <div className="text-sm text-gray-600">A week of mental health resources</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">$100 funds</div>
              <div className="text-sm text-gray-600">A complete recovery program</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}