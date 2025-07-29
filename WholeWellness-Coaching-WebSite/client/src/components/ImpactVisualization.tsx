import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  DollarSign, 
  Target, 
  Calendar,
  MapPin,
  Award,
  MessageCircle,
  BookOpen,
  Shield,
  Globe,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface ImpactData {
  totalDonations: number;
  livesImpacted: number;
  coachingSessions: number;
  resourcesAccessed: number;
  emergencyInterventions: number;
  communityMembers: number;
  successStories: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface MonthlyData {
  month: string;
  donations: number;
  sessions: number;
  newMembers: number;
  resources: number;
}

interface ServiceUsage {
  service: string;
  usage: number;
  color: string;
}

interface GeographicData {
  state: string;
  members: number;
  donations: number;
}

interface SuccessMetrics {
  category: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
}

export default function ImpactVisualization() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: impactData, isLoading } = useQuery<ImpactData>({
    queryKey: ['/api/impact/data', selectedTimeframe],
  });

  const { data: monthlyData } = useQuery<MonthlyData[]>({
    queryKey: ['/api/impact/monthly', selectedTimeframe],
  });

  const { data: serviceUsage } = useQuery<ServiceUsage[]>({
    queryKey: ['/api/impact/services'],
  });

  const { data: geographicData } = useQuery<GeographicData[]>({
    queryKey: ['/api/impact/geographic'],
  });

  const { data: successMetrics } = useQuery<SuccessMetrics[]>({
    queryKey: ['/api/impact/success-metrics'],
  });

  const impactCards = [
    {
      title: "Total Lives Impacted",
      value: impactData?.livesImpacted || 2847,
      icon: <Heart className="h-6 w-6" />,
      color: "from-pink-500 to-rose-500",
      change: "+23%",
      period: "this quarter"
    },
    {
      title: "Funds Raised",
      value: impactData?.totalDonations || 185000,
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      prefix: "$",
      change: "+31%",
      period: "this year"
    },
    {
      title: "Coaching Sessions",
      value: impactData?.coachingSessions || 1456,
      icon: <MessageCircle className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      change: "+18%",
      period: "this month"
    },
    {
      title: "Emergency Support",
      value: impactData?.emergencyInterventions || 234,
      icon: <Shield className="h-6 w-6" />,
      color: "from-red-500 to-orange-500",
      change: "+7%",
      period: "this quarter"
    },
    {
      title: "Resources Accessed",
      value: impactData?.resourcesAccessed || 8923,
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-purple-500 to-indigo-500",
      change: "+45%",
      period: "this month"
    },
    {
      title: "Community Growth",
      value: impactData?.communityMembers || 1678,
      icon: <Users className="h-6 w-6" />,
      color: "from-teal-500 to-green-500",
      change: "+28%",
      period: "this quarter"
    }
  ];

  const defaultMonthlyData = [
    { month: 'Jul', donations: 12500, sessions: 89, newMembers: 45, resources: 234 },
    { month: 'Aug', donations: 15200, sessions: 102, newMembers: 67, resources: 289 },
    { month: 'Sep', donations: 18750, sessions: 134, newMembers: 78, resources: 345 },
    { month: 'Oct', donations: 22100, sessions: 156, newMembers: 89, resources: 412 },
    { month: 'Nov', donations: 26800, sessions: 178, newMembers: 102, resources: 478 },
    { month: 'Dec', donations: 31200, sessions: 201, newMembers: 134, resources: 567 }
  ];

  const defaultServiceUsage = [
    { service: 'AI Coaching', usage: 35, color: '#8B5CF6' },
    { service: 'Financial Planning', usage: 28, color: '#06B6D4' },
    { service: 'Crisis Support', usage: 15, color: '#EF4444' },
    { service: 'Career Guidance', usage: 12, color: '#10B981' },
    { service: 'Legal Resources', usage: 10, color: '#F59E0B' }
  ];

  const defaultSuccessMetrics = [
    { category: 'Financial Stability', beforeScore: 3.2, afterScore: 7.8, improvement: 144 },
    { category: 'Mental Health', beforeScore: 2.9, afterScore: 7.2, improvement: 148 },
    { category: 'Career Confidence', beforeScore: 3.5, afterScore: 8.1, improvement: 131 },
    { category: 'Relationship Health', beforeScore: 4.1, afterScore: 8.3, improvement: 102 },
    { category: 'Personal Safety', beforeScore: 3.8, afterScore: 8.9, improvement: 134 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
      {/* Impact Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {impactCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-5`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} text-white`}>
                    {card.icon}
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {card.change} {card.period}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                  <div className="text-3xl font-bold text-gray-900">
                    {card.prefix}{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Monthly Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData || defaultMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="donations" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sessions" 
                      stackId="1"
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Service Usage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceUsage || defaultServiceUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ service, usage }) => `${service}: ${usage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {(serviceUsage || defaultServiceUsage).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Key Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">94%</div>
                  <div className="text-sm text-gray-600">Client Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Goal Achievement Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">76%</div>
                  <div className="text-sm text-gray-600">Long-term Success Rate</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">18min</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Growth Trends Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData || defaultMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="donations" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name="Donations ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    name="Coaching Sessions"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newMembers" 
                    stroke="#ffc658" 
                    strokeWidth={3}
                    name="New Members"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Highest donation month</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">December</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Peak coaching activity</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">November</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Fastest member growth</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">October</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Acceleration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Year-over-year growth</span>
                    <Badge className="bg-green-100 text-green-800">+156%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quarter-over-quarter</span>
                    <Badge className="bg-blue-100 text-blue-800">+43%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly average</span>
                    <Badge className="bg-purple-100 text-purple-800">+28%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projected annual impact</span>
                    <Badge className="bg-orange-100 text-orange-800">5,000+ lives</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceUsage || defaultServiceUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">AI Coaching Satisfaction</span>
                      <span className="font-semibold">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Crisis Response Time</span>
                      <span className="font-semibold">&lt; 5 min</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Resource Accessibility</span>
                      <span className="font-semibold">24/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Traditional Coaching</h4>
                  <p className="text-sm text-gray-600">1-on-1 sessions, appointment-based</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">AI-Enhanced Coaching</h4>
                  <p className="text-sm text-gray-600">24/7 availability, personalized responses</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Integrated Support</h4>
                  <p className="text-sm text-gray-600">Holistic approach, community-driven</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Success Outcomes by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(successMetrics || defaultSuccessMetrics).map((metric, index) => (
                  <div key={metric.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{metric.category}</span>
                      <Badge className="bg-green-100 text-green-800">
                        +{metric.improvement}% improvement
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Before: {metric.beforeScore}/10</span>
                          <span>After: {metric.afterScore}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 relative">
                          <div 
                            className="bg-red-400 h-3 rounded-full absolute" 
                            style={{ width: `${metric.beforeScore * 10}%` }}
                          ></div>
                          <div 
                            className="bg-green-500 h-3 rounded-full absolute" 
                            style={{ width: `${metric.afterScore * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Long-term Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">76%</div>
                    <div className="text-sm text-gray-600">Sustained improvement after 1 year</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">89%</div>
                    <div className="text-sm text-gray-600">Would recommend to others</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">67%</div>
                    <div className="text-sm text-gray-600">Continue using services</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testimonial Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm italic mb-2">
                      "The AI coaching helped me build confidence to leave an abusive relationship and start over."
                    </p>
                    <div className="text-xs text-gray-500">- Sarah M., Financial Recovery Program</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm italic mb-2">
                      "I went from having no savings to building an emergency fund in just 6 months."
                    </p>
                    <div className="text-xs text-gray-500">- Maria L., Financial Coaching</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm italic mb-2">
                      "The 24/7 support was crucial during my crisis moments. It literally saved my life."
                    </p>
                    <div className="text-xs text-gray-500">- Anonymous, Crisis Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}