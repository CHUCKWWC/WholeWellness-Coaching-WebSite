import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Sparkles, Users, Award, ArrowRight, Star, Clock, CheckCircle } from 'lucide-react';

const quickActions = [
  {
    title: 'AI Coaching',
    description: 'Get instant support from our 6 specialized AI coaches',
    icon: <Brain className="h-6 w-6 text-blue-500" />,
    link: '/ai-coaching',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    time: '2 min',
    popularity: '95%'
  },
  {
    title: 'Wellness Journey',
    description: 'Create your personalized wellness plan with AI insights',
    icon: <Target className="h-6 w-6 text-green-500" />,
    link: '/wellness-journey',
    badge: 'New',
    badgeColor: 'bg-green-100 text-green-700',
    time: '5 min',
    popularity: '89%'
  },
  {
    title: 'Take Assessment',
    description: 'Discover your wellness needs with our comprehensive assessments',
    icon: <Sparkles className="h-6 w-6 text-purple-500" />,
    link: '/assessments',
    badge: 'Recommended',
    badgeColor: 'bg-purple-100 text-purple-700',
    time: '10 min',
    popularity: '92%'
  },
  {
    title: 'Live Coaching',
    description: 'Get matched with a professional coach for 1-on-1 sessions',
    icon: <Users className="h-6 w-6 text-red-500" />,
    link: '/digital-onboarding',
    badge: 'Premium',
    badgeColor: 'bg-red-100 text-red-700',
    time: '15 min setup',
    popularity: '87%'
  }
];

const features = [
  {
    title: 'Certification Courses',
    description: 'Professional development and skill enhancement',
    icon: <Award className="h-5 w-5 text-orange-500" />,
    link: '/coach-certifications'
  },
  {
    title: 'Personal Recommendations',
    description: 'AI-powered wellness recommendations just for you',
    icon: <Star className="h-5 w-5 text-yellow-500" />,
    link: '/personalized-recommendations'
  }
];

export default function QuickStartDashboard() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Your Wellness Journey Starts Here
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose how you'd like to begin. Every path is designed to meet you where you are.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.link}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                        {action.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${action.badgeColor}`}>
                            {action.badge}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {action.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {action.popularity} user satisfaction
                    </span>
                    <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                      Start Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Explore More Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Not sure where to start? Take our quick tour to explore all features.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              localStorage.removeItem('hasSeenTour');
              window.location.reload();
            }}
            className="bg-white hover:bg-blue-50"
          >
            Take Platform Tour
          </Button>
        </div>
      </div>
    </section>
  );
}