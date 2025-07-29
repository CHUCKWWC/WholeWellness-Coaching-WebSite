import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunityImpactDashboard from "@/components/CommunityImpactDashboard";
import MemberEngagementSystem from "@/components/MemberEngagementSystem";
import ImpactVisualization from "@/components/ImpactVisualization";
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  Activity,
  BarChart3,
  Sparkles,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

export default function Impact() {
  const [selectedView, setSelectedView] = useState('dashboard');

  const quickStats = [
    {
      title: "Total Lives Impacted",
      value: "2,847+",
      icon: <Heart className="h-8 w-8" />,
      color: "from-pink-500 to-rose-500",
      description: "Women supported through our programs"
    },
    {
      title: "Crisis Interventions",
      value: "1,234",
      icon: <Target className="h-8 w-8" />,
      color: "from-red-500 to-orange-500",
      description: "Emergency support sessions provided"
    },
    {
      title: "Financial Independence",
      value: "89%",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "from-green-500 to-emerald-500",
      description: "Success rate for financial stability goals"
    },
    {
      title: "Community Growth",
      value: "+156%",
      icon: <Users className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500",
      description: "Year-over-year membership increase"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Measuring Our <span className="text-yellow-300">Impact</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Real-time insights into how we're transforming lives and empowering women in crisis transitions
            </p>
            <div className="flex justify-center space-x-4">
              <Badge className="bg-white/20 text-white text-lg px-6 py-2">
                Live Data
              </Badge>
              <Badge className="bg-yellow-400/20 text-yellow-200 text-lg px-6 py-2">
                Updated Daily
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                        {stat.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                      <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Impact Analytics
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our real-time impact dashboard, member engagement metrics, and detailed visualization of how your support creates lasting change in our community.
            </p>
          </div>

          <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Live Dashboard
                </TabsTrigger>
                <TabsTrigger value="engagement" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Member Engagement
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-500" />
                      Real-Time Community Impact Dashboard
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Live metrics updating every 30 seconds showing our current community impact and engagement levels.
                    </p>
                  </CardHeader>
                </Card>
                <CommunityImpactDashboard />
              </motion.div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Member Engagement & Rewards System
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Track member progress, achievements, challenges, and our comprehensive reward system that recognizes community contributions.
                    </p>
                  </CardHeader>
                </Card>
                <MemberEngagementSystem />
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      Advanced Impact Analytics & Visualization
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Comprehensive data analysis showing trends, service utilization, success outcomes, and long-term impact measurements.
                    </p>
                  </CardHeader>
                </Card>
                <ImpactVisualization />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Be Part of Our Growing Impact
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Every donation, every coaching session, and every community interaction creates ripple effects that transform lives. Join us in building a stronger, more supportive community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-3">
                Make a Donation
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                Become a Volunteer
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                Join Our Community
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}