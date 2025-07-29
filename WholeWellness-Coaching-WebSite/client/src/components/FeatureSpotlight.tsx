import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Lightbulb, ArrowRight, Star } from 'lucide-react';
import { Link } from 'wouter';

interface SpotlightFeature {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
}

const spotlightFeatures: SpotlightFeature[] = [
  {
    id: 'wellness-journey',
    title: 'New: AI-Powered Wellness Journey',
    description: 'Create personalized wellness plans with goal tracking, milestones, and AI insights tailored to your unique needs.',
    ctaText: 'Explore Wellness Journey',
    ctaLink: '/wellness-journey',
    badge: 'New Feature',
    badgeColor: 'bg-green-100 text-green-700',
    icon: <Star className="h-5 w-5 text-green-500" />
  },
  {
    id: 'ai-coaching',
    title: 'Meet Your AI Coaches',
    description: 'Get instant support from 6 specialized AI coaches including nutrition, fitness, behavior, and wellness experts.',
    ctaText: 'Start AI Coaching',
    ctaLink: '/ai-coaching',
    badge: 'Most Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: <Lightbulb className="h-5 w-5 text-blue-500" />
  },
  {
    id: 'certification',
    title: 'Professional Development',
    description: 'Access certification courses for personal and professional growth. Now available to all users.',
    ctaText: 'Browse Courses',
    ctaLink: '/coach-certifications',
    badge: 'Now Open',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: <Star className="h-5 w-5 text-purple-500" />
  }
];

export default function FeatureSpotlight() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenSpotlight = localStorage.getItem('hasSeenFeatureSpotlight');
    if (!hasSeenSpotlight) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show spotlight after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentFeature((prev) => (prev + 1) % spotlightFeatures.length);
      }, 6000); // Rotate every 6 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const dismissSpotlight = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenFeatureSpotlight', 'true');
  };

  if (!isVisible) return null;

  const feature = spotlightFeatures[currentFeature];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2 duration-500">
      <Card className="border-2 border-blue-200 shadow-lg bg-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {feature.icon}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Feature Spotlight
                  </span>
                  {feature.badge && (
                    <Badge className={`text-xs ${feature.badgeColor}`}>
                      {feature.badge}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissSpotlight}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-2">
            {feature.title}
          </h4>
          
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {feature.description}
          </p>
          
          <div className="flex items-center justify-between">
            <Link href={feature.ctaLink}>
              <Button 
                size="sm" 
                className="flex items-center gap-2"
                onClick={dismissSpotlight}
              >
                {feature.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <div className="flex gap-1">
              {spotlightFeatures.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentFeature ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}