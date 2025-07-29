import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  User, 
  Lock, 
  Star, 
  Download, 
  Video, 
  Users, 
  Calendar,
  BookOpen,
  Award,
  Heart,
  MessageCircle,
  Shield,
  CheckCircle2
} from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Members() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const onLogin = (data: LoginForm) => {
    // Mock login for demo - in real app this would call the API
    setIsLoggedIn(true);
  };

  const onRegister = (data: RegisterForm) => {
    // Mock registration for demo - in real app this would call the API
    setIsLoggedIn(true);
  };

  const memberBenefits = [
    {
      icon: <Download className="w-8 h-8" />,
      title: "Resource Library Access",
      description: "Download all worksheets, guides, and educational materials"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Exclusive Content",
      description: "Access member-only videos, webinars, and coaching sessions"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Forum",
      description: "Connect with other members in our private support community"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Priority Booking",
      description: "Get first access to workshops, events, and coaching sessions"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Discounted Services",
      description: "Receive special member pricing on all coaching services"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Member Support",
      description: "Access to member-only support channels and resources"
    }
  ];

  const memberStats = [
    { label: "Active Members", value: "1,200+" },
    { label: "Resources Available", value: "150+" },
    { label: "Monthly Events", value: "12+" },
    { label: "Success Stories", value: "500+" }
  ];

  if (isLoggedIn) {
    return <MemberDashboard />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            Member Portal
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Join our supportive community and access exclusive resources, support groups, 
            and member-only content designed for your growth journey.
          </p>
        </div>
      </section>

      {/* Member Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Member Benefits</h2>
            <p className="text-lg text-gray-600">
              Exclusive access to resources and community support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {memberBenefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Member Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {memberStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login/Register Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Member Login</TabsTrigger>
                  <TabsTrigger value="register">Join Community</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6 mt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-secondary mb-2">Welcome Back</h3>
                    <p className="text-gray-600">Sign in to access your member benefits</p>
                  </div>

                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-secondary">
                        <Lock className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </form>
                  </Form>

                  <div className="text-center">
                    <Button variant="link" className="text-primary">
                      Forgot your password?
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-6 mt-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-secondary mb-2">Join Our Community</h3>
                    <p className="text-gray-600">Create your account to access member benefits</p>
                  </div>

                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-secondary">
                        <User className="w-4 h-4 mr-2" />
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Membership Options</h2>
            <p className="text-lg text-gray-600">
              Choose the membership level that best fits your needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Basic Member</h3>
                  <div className="text-3xl font-bold text-primary mb-4">Free</div>
                  <p className="text-gray-600 mb-6">Access to essential resources and community</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Community forum access",
                    "Basic resource downloads",
                    "Monthly newsletter",
                    "Support group invitations"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Join Free
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Premium Member</h3>
                  <div className="text-3xl font-bold text-primary mb-4">$25/month</div>
                  <p className="text-gray-600 mb-6">Enhanced support and exclusive content</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "All Basic Member benefits",
                    "Premium resource library",
                    "Weekly group coaching",
                    "Priority booking",
                    "Direct coach messaging",
                    "Exclusive workshops"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-primary hover:bg-secondary">
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-secondary mb-2">Supporter</h3>
                  <div className="text-3xl font-bold text-primary mb-4">$50/month</div>
                  <p className="text-gray-600 mb-6">Support our mission while receiving premium benefits</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "All Premium Member benefits",
                    "1-on-1 monthly check-in",
                    "Sponsor others' memberships",
                    "Special recognition",
                    "Annual appreciation event",
                    "Impact reports"
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-primary hover:bg-secondary">
                  Become a Supporter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

function MemberDashboard() {
  const recentResources = [
    { title: "Setting Boundaries in Relationships", type: "Article", date: "2 days ago" },
    { title: "Career Transition Worksheet", type: "Worksheet", date: "5 days ago" },
    { title: "Mindfulness for Stress Relief", type: "Video", date: "1 week ago" },
    { title: "Building Self-Confidence", type: "Podcast", date: "1 week ago" }
  ];

  const upcomingEvents = [
    { title: "Weekly Support Group", date: "Tomorrow, 7:00 PM", type: "Group Session" },
    { title: "Career Planning Workshop", date: "Friday, 6:00 PM", type: "Workshop" },
    { title: "Mindfulness Monday", date: "Next Monday, 12:00 PM", type: "Meditation" },
    { title: "Monthly Member Meetup", date: "Next Saturday, 2:00 PM", type: "Community" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah!</h1>
              <p className="text-lg opacity-90">Ready to continue your growth journey?</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge className="bg-white text-primary text-lg px-4 py-2">
                Premium Member
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="bg-primary hover:bg-secondary h-auto py-4 flex-col">
                    <Calendar className="w-6 h-6 mb-2" />
                    <span className="text-sm">Book Session</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span className="text-sm">Resources</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    <span className="text-sm">Community</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col">
                    <MessageCircle className="w-6 h-6 mb-2" />
                    <span className="text-sm">Support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Resources */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">Recently Added Resources</h2>
                <div className="space-y-4">
                  {recentResources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary text-white rounded-full p-2">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-secondary">{resource.title}</h3>
                          <p className="text-sm text-gray-600">{resource.type} • {resource.date}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">Your Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">Sessions Completed</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">25</div>
                    <div className="text-sm text-gray-600">Resources Downloaded</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">Events Attended</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h3 className="font-medium text-secondary">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.date}</p>
                      <Badge variant="secondary" className="mt-2">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Highlights */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">Community Highlights</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-warm rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-medium">Success Story</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      "Thanks to the coaching and support, I've started my own business and feel more confident than ever!"
                    </p>
                    <p className="text-xs text-gray-500 mt-2">- Maria L.</p>
                  </div>
                  
                  <div className="p-4 bg-warm rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Member Spotlight</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Congratulations to Jennifer K. for completing her career transition program!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-secondary mb-4">Need Support?</h2>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message a Coach
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Crisis Resources
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Join Support Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
