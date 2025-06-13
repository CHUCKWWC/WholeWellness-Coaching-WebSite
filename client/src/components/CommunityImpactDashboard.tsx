import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  Target, 
  Calendar, 
  Award,
  DollarSign,
  MessageCircle,
  BookOpen,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

interface ImpactMetrics {
  totalDonations: number;
  livesImpacted: number;
  coachingSessions: number;
  resourcesAccessed: number;
  emergencySupport: number;
  communityMembers: number;
  successStories: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'donation' | 'session' | 'resource' | 'story';
  description: string;
  timestamp: Date;
  amount?: number;
  anonymous?: boolean;
}

export default function CommunityImpactDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');
  const [animatedNumbers, setAnimatedNumbers] = useState<Record<string, number>>({});

  // Fetch real-time impact data
  const { data: impactData, isLoading } = useQuery<ImpactMetrics>({
    queryKey: ['/api/community/impact'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const { data: recentActivity } = useQuery<RecentActivity[]>({
    queryKey: ['/api/community/activity'],
    refetchInterval: 10000, // Update every 10 seconds
  });

  // Animate numbers on load
  useEffect(() => {
    if (impactData) {
      const targets = {
        totalDonations: impactData.totalDonations,
        livesImpacted: impactData.livesImpacted,
        coachingSessions: impactData.coachingSessions,
        resourcesAccessed: impactData.resourcesAccessed,
        emergencySupport: impactData.emergencySupport,
        communityMembers: impactData.communityMembers,
        successStories: impactData.successStories,
      };

      Object.entries(targets).forEach(([key, target]) => {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimatedNumbers(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, 50);
      });
    }
  }, [impactData]);

  const impactCards = [
    {
      title: "Total Donations",
      value: animatedNumbers.totalDonations || 0,
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      prefix: "$",
      description: "Raised this year"
    },
    {
      title: "Lives Impacted",
      value: animatedNumbers.livesImpacted || 0,
      icon: <Heart className="h-6 w-6" />,
      color: "from-pink-500 to-rose-500",
      description: "Women supported"
    },
    {
      title: "Coaching Sessions",
      value: animatedNumbers.coachingSessions || 0,
      icon: <MessageCircle className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      description: "Sessions completed"
    },
    {
      title: "Resources Accessed",
      value: animatedNumbers.resourcesAccessed || 0,
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-purple-500 to-indigo-500",
      description: "Downloads & views"
    },
    {
      title: "Emergency Support",
      value: animatedNumbers.emergencySupport || 0,
      icon: <Shield className="h-6 w-6" />,
      color: "from-red-500 to-orange-500",
      description: "Crisis interventions"
    },
    {
      title: "Community Members",
      value: animatedNumbers.communityMembers || 0,
      icon: <Users className="h-6 w-6" />,
      color: "from-teal-500 to-green-500",
      description: "Active members"
    },
    {
      title: "Success Stories",
      value: animatedNumbers.successStories || 0,
      icon: <Award className="h-6 w-6" />,
      color: "from-yellow-500 to-orange-500",
      description: "Shared transformations"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} text-white`}>
                    {card.icon}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Live
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                  <div className="text-3xl font-bold text-gray-900">
                    {card.prefix}{card.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly Goal Progress */}
      {impactData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Monthly Impact Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  ${impactData.monthlyProgress.toLocaleString()} raised
                </span>
                <span className="text-sm text-gray-500">
                  Goal: ${impactData.monthlyGoal.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(impactData.monthlyProgress / impactData.monthlyGoal) * 100} 
                className="h-3"
              />
              <div className="text-center">
                <Badge 
                  variant={impactData.monthlyProgress >= impactData.monthlyGoal ? "default" : "secondary"}
                  className="text-sm"
                >
                  {Math.round((impactData.monthlyProgress / impactData.monthlyGoal) * 100)}% Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Impact This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>New Members</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coaching Sessions</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crisis Interventions</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Stories</span>
                    <span className="font-semibold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Weekly Growth</span>
                    <Badge className="bg-green-100 text-green-800">+12%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engagement Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retention Rate</span>
                    <Badge className="bg-purple-100 text-purple-800">94%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Donation Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$25</div>
                  <div className="text-sm text-gray-600">Funds 1 coaching session</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$100</div>
                  <div className="text-sm text-gray-600">Supports 1 week of crisis help</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$500</div>
                  <div className="text-sm text-gray-600">Provides monthly support package</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Daily Active Users</span>
                    <span className="font-semibold">234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Session Time</span>
                    <span className="font-semibold">18 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resource Downloads</span>
                    <span className="font-semibold">89 today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Coaching Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Financial Coach</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Relationship Coach</span>
                    <span className="font-semibold">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Career Coach</span>
                    <span className="font-semibold">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Community Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity?.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${
                      activity.type === 'donation' ? 'bg-green-100 text-green-600' :
                      activity.type === 'session' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'resource' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'donation' && <DollarSign className="h-4 w-4" />}
                      {activity.type === 'session' && <MessageCircle className="h-4 w-4" />}
                      {activity.type === 'resource' && <BookOpen className="h-4 w-4" />}
                      {activity.type === 'story' && <Award className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {activity.amount && (
                      <Badge variant="outline">
                        ${activity.amount}
                      </Badge>
                    )}
                  </motion.div>
                )) || (
                  <div className="text-center text-gray-500 py-8">
                    Loading recent activity...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}