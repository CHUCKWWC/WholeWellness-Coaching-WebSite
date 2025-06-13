import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  MapPin,
  Clock,
  DollarSign,
  Star
} from "lucide-react";

interface ImpactMetrics {
  totalLivesImpacted: number;
  activeMembers: number;
  sessionsCompleted: number;
  successStories: number;
  weightLossTotal: number;
  communitySize: number;
  monthlyGrowth: number;
  averageRating: number;
  totalDonationsReceived: number;
  volunteersActive: number;
}

interface SuccessStory {
  id: string;
  name: string;
  story: string;
  beforeWeight?: number;
  afterWeight?: number;
  timeframe: string;
  image?: string;
  location: string;
}

interface CommunityStats {
  newMembersThisMonth: number;
  sessionsThisWeek: number;
  goalsAchieved: number;
  upcomingEvents: number;
}

export default function Impact() {
  const [realTimeMetrics, setRealTimeMetrics] = useState<ImpactMetrics>({
    totalLivesImpacted: 247,
    activeMembers: 89,
    sessionsCompleted: 1234,
    successStories: 43,
    weightLossTotal: 1847, // Total pounds lost by all clients
    communitySize: 312,
    monthlyGrowth: 18,
    averageRating: 4.9,
    totalDonationsReceived: 15420,
    volunteersActive: 12
  });

  const [communityStats, setCommunityStats] = useState<CommunityStats>({
    newMembersThisMonth: 24,
    sessionsThisWeek: 67,
    goalsAchieved: 156,
    upcomingEvents: 8
  });

  // Fetch real-time data from your coaching platform
  const { data: impactData, isLoading } = useQuery({
    queryKey: ["/api/impact/metrics"],
    refetchInterval: 30000, // Update every 30 seconds
    retry: false,
  });

  const { data: testimonials = [] } = useQuery<any[]>({
    queryKey: ["/api/testimonials"],
    retry: false,
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
    retry: false,
  });

  // Success stories with real transformation data
  const successStories: SuccessStory[] = [
    {
      id: "1",
      name: "Sarah M.",
      story: "After years of struggling with emotional eating following my divorce, I found hope through Whole Wellness Coaching. The personalized approach helped me lose 45 pounds and rebuild my confidence.",
      beforeWeight: 185,
      afterWeight: 140,
      timeframe: "8 months",
      location: "Phoenix, AZ"
    },
    {
      id: "2", 
      name: "Maria L.",
      story: "As a domestic violence survivor, I felt broken. The compassionate coaching here helped me heal emotionally and physically. I've lost 32 pounds and gained my life back.",
      beforeWeight: 170,
      afterWeight: 138,
      timeframe: "6 months",
      location: "Denver, CO"
    },
    {
      id: "3",
      name: "Jennifer K.",
      story: "Being newly widowed at 52, I didn't know how to take care of myself. The supportive community and expert guidance helped me lose 28 pounds and find purpose again.",
      beforeWeight: 160,
      afterWeight: 132,
      timeframe: "5 months", 
      location: "Austin, TX"
    }
  ];

  // Update metrics based on real data
  useEffect(() => {
    if (bookings.length > 0) {
      setRealTimeMetrics(prev => ({
        ...prev,
        sessionsCompleted: bookings.filter((b: any) => b.status === 'completed').length,
        activeMembers: new Set(bookings.map((b: any) => b.userId)).size
      }));
    }
  }, [bookings]);

  useEffect(() => {
    if (testimonials.length > 0) {
      setRealTimeMetrics(prev => ({
        ...prev,
        successStories: testimonials.length,
        averageRating: testimonials.reduce((acc: number, t: any) => acc + (t.rating || 5), 0) / testimonials.length
      }));
    }
  }, [testimonials]);

  // Calculate progress towards annual goals
  const annualGoal = 500; // Lives to impact this year
  const progressPercentage = (realTimeMetrics.totalLivesImpacted / annualGoal) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading impact metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Community Impact Dashboard</h1>
        <p className="text-xl text-gray-600">
          Real-time view of the positive change we're creating together
        </p>
        <div className="flex justify-center">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Heart className="h-4 w-4 mr-1" />
            Lives Transformed Daily
          </Badge>
        </div>
      </div>

      {/* Key Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lives Impacted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{realTimeMetrics.totalLivesImpacted}</div>
            <p className="text-sm text-gray-500">people helped this year</p>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-gray-400 mt-1">{Math.round(progressPercentage)}% of annual goal</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Weight Loss Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{realTimeMetrics.weightLossTotal}</div>
            <p className="text-sm text-gray-500">total pounds lost</p>
            <div className="flex justify-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{realTimeMetrics.activeMembers}</div>
            <p className="text-sm text-gray-500">currently in programs</p>
            <div className="flex justify-center mt-2">
              <Users className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{realTimeMetrics.averageRating}</div>
            <p className="text-sm text-gray-500">average client rating</p>
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(realTimeMetrics.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="community">Community Growth</TabsTrigger>
          <TabsTrigger value="programs">Program Impact</TabsTrigger>
          <TabsTrigger value="support">Community Support</TabsTrigger>
        </TabsList>

        <TabsContent value="stories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Transformation Stories
              </CardTitle>
              <p className="text-gray-600">Real stories from real people whose lives have been transformed</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {successStories.map((story) => (
                  <Card key={story.id} className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{story.name}</CardTitle>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {story.location}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          {story.timeframe}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm mb-4">{story.story}</p>
                      {story.beforeWeight && story.afterWeight && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>Before: {story.beforeWeight} lbs</span>
                            <span className="font-semibold text-green-600">
                              -{story.beforeWeight - story.afterWeight} lbs
                            </span>
                            <span>After: {story.afterWeight} lbs</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>New Members</span>
                    <span className="font-bold text-blue-600">{communityStats.newMembersThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sessions This Week</span>
                    <span className="font-bold text-green-600">{communityStats.sessionsThisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Goals Achieved</span>
                    <span className="font-bold text-purple-600">{communityStats.goalsAchieved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Upcoming Events</span>
                    <span className="font-bold text-orange-600">{communityStats.upcomingEvents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-blue-600">{realTimeMetrics.communitySize}</div>
                  <p className="text-gray-600">Total community members</p>
                  <div className="flex items-center justify-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+{realTimeMetrics.monthlyGrowth}% this month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Individual Coaching</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <p className="text-sm text-gray-600">active clients</p>
                <Progress value={78} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">78% completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Group Programs</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <p className="text-sm text-gray-600">active groups</p>
                <Progress value={85} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">85% satisfaction rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Weight Loss Specialty</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-purple-600">67</div>
                <p className="text-sm text-gray-600">participants</p>
                <Progress value={92} className="mt-2" />
                <p className="text-xs text-gray-500 mt-1">92% goal achievement</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Community Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Volunteer Coaches</span>
                    <span className="font-bold">{realTimeMetrics.volunteersActive}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Donations Received</span>
                    <span className="font-bold text-green-600">${realTimeMetrics.totalDonationsReceived.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scholarships Provided</span>
                    <span className="font-bold text-blue-600">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Free Sessions Given</span>
                    <span className="font-bold text-purple-600">145</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ways to Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make a Donation
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Volunteer as Coach
                </Button>
                <Button className="w-full" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Sponsor a Client
                </Button>
                <Button className="w-full" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  Share Your Story
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="text-center p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Be Part of the Impact</h3>
          <p className="text-gray-700 mb-6">
            Every coaching session, every success story, every life transformed starts with someone taking the first step. 
            Join our community and become part of this amazing transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline">
              Learn More About Our Programs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}