import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Trophy,
  Video,
  Heart,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MemberDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Member Dashboard</h1>
        <p className="text-muted-foreground mb-8">Please log in to access your dashboard</p>
        <Button onClick={() => window.location.href = "/login"}>
          Log In
        </Button>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Book a Session",
      description: "Schedule a coaching session",
      icon: Calendar,
      href: "/booking",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "AI Coaching",
      description: "Chat with AI coaches",
      icon: MessageSquare,
      href: "/ai-coaching",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Resources",
      description: "Explore wellness resources",
      icon: BookOpen,
      href: "/resources",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Events",
      description: "Join workshops & events",
      icon: Users,
      href: "/events",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const statsCards = [
    {
      title: "Total Sessions",
      value: "0",
      description: "Coaching sessions completed",
      icon: Video,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Wellness Journey",
      value: "0%",
      description: "Progress towards your goals",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Achievements",
      value: "0",
      description: "Milestones reached",
      icon: Trophy,
      color: "text-yellow-600 dark:text-yellow-400"
    },
    {
      title: "Impact Points",
      value: user?.rewardPoints || "0",
      description: "Community contribution",
      icon: Heart,
      color: "text-red-600 dark:text-red-400"
    }
  ];

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || 'M';

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-white/20 text-white text-xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Member'}!
            </h1>
            <p className="text-white/80">
              Continue your wellness journey today
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Take these steps to make the most of your membership
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Complete Your Profile</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Add your information to get personalized recommendations
              </p>
              <Link href="/user-profile">
                <Button variant="outline" size="sm">Update Profile</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Try AI Coaching</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Get instant support from our AI wellness coaches
              </p>
              <Link href="/ai-coaching">
                <Button variant="outline" size="sm">Start Chatting</Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Book Your First Session</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Connect with a professional coach for personalized guidance
              </p>
              <Link href="/booking">
                <Button variant="outline" size="sm">Browse Coaches</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
