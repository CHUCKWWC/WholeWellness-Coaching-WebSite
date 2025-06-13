import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Gift, Heart, Star, Trophy, TrendingUp, Users, Zap, Award, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserDashboardData {
  totalDonated: number;
  rewardPoints: number;
  membershipLevel: string;
  donationHistory: Donation[];
  impactMetrics: ImpactMetric[];
  nextMilestone: Milestone;
  memberBenefits: MemberBenefit[];
}

interface Donation {
  id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  campaignTitle?: string;
}

interface ImpactMetric {
  metric: string;
  value: number;
  description: string;
  icon: string;
}

interface Milestone {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  reward: string;
}

interface MemberBenefit {
  title: string;
  description: string;
  isUnlocked: boolean;
  requiredLevel: string;
}

export default function MemberPortal() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch member dashboard data
  const { data: dashboardData, isLoading } = useQuery<UserDashboardData>({
    queryKey: ["/api/member/dashboard"],
    enabled: isAuthenticated,
  });

  // Redeem reward points mutation
  const redeemPointsMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await fetch("/api/member/redeem-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rewardId }),
      });
      if (!response.ok) throw new Error("Failed to redeem points");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Points redeemed successfully!",
        description: "Your reward is being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/member/dashboard"] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Member Portal</h1>
        <p className="text-muted-foreground mb-8">Please log in to access your member dashboard</p>
        <Button onClick={() => window.location.href = "/login"}>
          Log In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  const getMembershipConfig = (level: string) => {
    const configs = {
      free: { 
        label: "Supporter", 
        color: "bg-blue-500", 
        gradient: "from-blue-400 to-blue-600",
        icon: Heart,
        description: "Thank you for supporting our cause!"
      },
      supporter: { 
        label: "Champion", 
        color: "bg-green-500", 
        gradient: "from-green-400 to-green-600",
        icon: Star,
        description: "Your ongoing support makes a real difference!"
      },
      champion: { 
        label: "Guardian", 
        color: "bg-purple-500", 
        gradient: "from-purple-400 to-purple-600",
        icon: Award,
        description: "You're a guardian angel for our community!"
      },
      guardian: { 
        label: "Hero", 
        color: "bg-yellow-500", 
        gradient: "from-yellow-400 to-yellow-600",
        icon: Trophy,
        description: "You're a hero changing lives every day!"
      },
    };
    return configs[level as keyof typeof configs] || configs.free;
  };

  const membershipConfig = getMembershipConfig(user?.membershipLevel || 'free');
  const IconComponent = membershipConfig.icon;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Member Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${membershipConfig.gradient} rounded-lg p-8 text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-white text-gray-800 text-xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-white/80">{membershipConfig.description}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-white text-gray-800 mb-2">
              <IconComponent className="h-4 w-4 mr-1" />
              {membershipConfig.label}
            </Badge>
            <div className="text-2xl font-bold">{dashboardData?.rewardPoints || 0} Points</div>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="impact">My Impact</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">${dashboardData?.totalDonated || 0}</div>
                <div className="text-sm text-muted-foreground">Total Donated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{dashboardData?.rewardPoints || 0}</div>
                <div className="text-sm text-muted-foreground">Reward Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {dashboardData?.impactMetrics?.find(m => m.metric === 'lives_impacted')?.value || 0}
                </div>
                <div className="text-sm text-muted-foreground">Lives Impacted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {dashboardData?.donationHistory?.filter(d => d.type === 'monthly').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Subscriptions</div>
              </CardContent>
            </Card>
          </div>

          {/* Next Milestone */}
          {dashboardData?.nextMilestone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Next Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{dashboardData.nextMilestone.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dashboardData.nextMilestone.description}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>
                        ${dashboardData.nextMilestone.currentAmount} / ${dashboardData.nextMilestone.targetAmount}
                      </span>
                    </div>
                    <Progress 
                      value={(dashboardData.nextMilestone.currentAmount / dashboardData.nextMilestone.targetAmount) * 100}
                      className="h-3"
                    />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Reward: {dashboardData.nextMilestone.reward}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Member Benefits</CardTitle>
              <CardDescription>
                Perks and privileges for {membershipConfig.label} members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {dashboardData?.memberBenefits?.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      benefit.isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-medium">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                    <Badge variant={benefit.isUnlocked ? "default" : "secondary"}>
                      {benefit.isUnlocked ? "Unlocked" : `Requires ${benefit.requiredLevel}`}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Impact Tab */}
        <TabsContent value="impact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Impact Metrics</CardTitle>
              <CardDescription>
                See the real difference your donations have made
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dashboardData?.impactMetrics?.map((metric, index) => {
                  const icons = {
                    lives_impacted: Users,
                    sessions_funded: Calendar,
                    programs_supported: Heart,
                    communities_helped: Target,
                  };
                  const IconComp = icons[metric.metric as keyof typeof icons] || TrendingUp;
                  
                  return (
                    <motion.div
                      key={metric.metric}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 text-center"
                    >
                      <IconComp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                      <div className="text-lg font-semibold text-gray-700 capitalize">
                        {metric.metric.replace('_', ' ')}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{metric.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Available Rewards
              </CardTitle>
              <CardDescription>
                Redeem your points for exclusive rewards and benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { id: "1", title: "Exclusive Coaching Session", points: 500, description: "One-on-one session with our expert coaches" },
                  { id: "2", title: "Digital Wellness Kit", points: 250, description: "Downloadable resources and guides" },
                  { id: "3", title: "Member T-Shirt", points: 750, description: "Limited edition supporter merchandise" },
                  { id: "4", title: "Virtual Event Access", points: 300, description: "Exclusive access to member-only events" },
                ].map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{reward.title}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{reward.points} points</span>
                      </div>
                    </div>
                    <Button
                      disabled={(dashboardData?.rewardPoints || 0) < reward.points || redeemPointsMutation.isPending}
                      onClick={() => redeemPointsMutation.mutate(reward.id)}
                    >
                      {(dashboardData?.rewardPoints || 0) >= reward.points ? "Redeem" : "Not Enough Points"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>
                View all your past donations and their impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.donationHistory?.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">${donation.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(donation.date).toLocaleDateString()} • {donation.type}
                        {donation.campaignTitle && ` • ${donation.campaignTitle}`}
                      </div>
                    </div>
                    <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                      {donation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}