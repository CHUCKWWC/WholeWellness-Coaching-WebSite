import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  Phone, 
  Shield, 
  Search, 
  Filter, 
  Star, 
  ExternalLink,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  PhoneCall,
  Globe,
  Smartphone,
  BookOpen,
  Video,
  Headphones,
  Activity,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface MentalWellnessResource {
  id: number;
  title: string;
  description: string;
  category: string;
  resourceType: string;
  url?: string;
  phoneNumber?: string;
  isEmergency: boolean;
  availability: string;
  languages: string[];
  costInfo: string;
  targetAudience: string;
  rating: number;
  usageCount: number;
  tags: string[];
  isFeatured: boolean;
}

interface EmergencyContact {
  id: number;
  name: string;
  organization?: string;
  phoneNumber: string;
  textSupport?: string;
  description: string;
  availability: string;
  languages: string[];
  specialty: string;
  website?: string;
}

interface WellnessAssessment {
  questions: {
    id: string;
    text: string;
    type: 'scale' | 'multiple' | 'boolean';
    options?: string[];
    required: boolean;
  }[];
}

const emergencyAlertData = {
  title: "Crisis Resources Available 24/7",
  description: "If you're experiencing a mental health crisis, help is available immediately",
  contacts: [
    { name: "National Suicide Prevention Lifeline", phone: "988", available: "24/7" },
    { name: "Crisis Text Line", phone: "Text HOME to 741741", available: "24/7" },
    { name: "SAMHSA National Helpline", phone: "1-800-662-4357", available: "24/7" }
  ]
};

const resourceTypeIcons = {
  hotline: PhoneCall,
  website: Globe,
  app: Smartphone,
  article: BookOpen,
  video: Video,
  meditation: Activity,
  exercise: Target,
  podcast: Headphones
};

export default function MentalWellnessHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, any>>({});
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [selectedResource, setSelectedResource] = useState<MentalWellnessResource | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch quick access resources
  const { data: quickAccess, isLoading: quickAccessLoading } = useQuery({
    queryKey: ['/api/mental-wellness/quick-access'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch filtered resources
  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/mental-wellness/resources', { 
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      audience: selectedAudience !== 'all' ? selectedAudience : undefined,
      type: selectedType !== 'all' ? selectedType : undefined
    }],
    staleTime: 5 * 60 * 1000,
  });

  // Fetch emergency contacts
  const { data: emergencyContacts } = useQuery({
    queryKey: ['/api/mental-wellness/emergency-contacts'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Track resource usage
  const trackUsageMutation = useMutation({
    mutationFn: async (data: { resourceId: number; duration?: number; wasHelpful?: boolean; feedback?: string }) => {
      const response = await fetch('/api/mental-wellness/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mental-wellness/resources'] });
    }
  });

  // Submit assessment
  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/mental-wellness/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mental-wellness/recommendations'] });
    }
  });

  const handleResourceClick = (resource: MentalWellnessResource) => {
    setSelectedResource(resource);
    trackUsageMutation.mutate({ resourceId: resource.id });
    
    // Open resource
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const handleEmergencyCall = (contact: EmergencyContact) => {
    trackUsageMutation.mutate({ 
      resourceId: 0, // Special tracking for emergency contacts
      followUpAction: 'contacted'
    });
    
    if (contact.phoneNumber.startsWith('http')) {
      window.open(contact.phoneNumber, '_blank');
    } else {
      window.location.href = `tel:${contact.phoneNumber}`;
    }
  };

  const filteredResources = resources?.filter((resource: MentalWellnessResource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }) || [];

  const assessmentQuestions = [
    {
      id: 'mood',
      text: 'How would you rate your overall mood in the past week?',
      type: 'scale' as const,
      options: ['Very Low', 'Low', 'Fair', 'Good', 'Very Good'],
      required: true
    },
    {
      id: 'stress',
      text: 'How stressed have you been feeling lately?',
      type: 'scale' as const,
      options: ['Not at all', 'Slightly', 'Moderately', 'Very', 'Extremely'],
      required: true
    },
    {
      id: 'sleep',
      text: 'How well have you been sleeping?',
      type: 'scale' as const,
      options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Very Good'],
      required: true
    },
    {
      id: 'support',
      text: 'Do you feel you have adequate support from friends and family?',
      type: 'boolean' as const,
      required: true
    },
    {
      id: 'goals',
      text: 'What type of support would be most helpful right now?',
      type: 'multiple' as const,
      options: [
        'Crisis support',
        'Stress management',
        'Anxiety help',
        'Depression support',
        'Relationship guidance',
        'Self-care resources',
        'Mindfulness/meditation',
        'Professional counseling'
      ],
      required: true
    }
  ];

  const handleAssessmentSubmit = () => {
    const score = calculateAssessmentScore();
    const riskLevel = determineRiskLevel(score);
    
    submitAssessmentMutation.mutate({
      type: 'mental-wellness-quick',
      responses: assessmentAnswers,
      score,
      riskLevel,
      recommendedResources: getRecommendedResources(assessmentAnswers, riskLevel)
    });
    
    setShowAssessment(false);
    setAssessmentStep(0);
    setAssessmentAnswers({});
  };

  const calculateAssessmentScore = () => {
    let score = 0;
    if (assessmentAnswers.mood) score += parseInt(assessmentAnswers.mood) || 0;
    if (assessmentAnswers.stress) score += 5 - (parseInt(assessmentAnswers.stress) || 0);
    if (assessmentAnswers.sleep) score += parseInt(assessmentAnswers.sleep) || 0;
    if (assessmentAnswers.support) score += assessmentAnswers.support ? 3 : 0;
    return score;
  };

  const determineRiskLevel = (score: number) => {
    if (score <= 6) return 'high';
    if (score <= 12) return 'medium';
    return 'low';
  };

  const getRecommendedResources = (answers: any, riskLevel: string) => {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push('crisis', 'professional');
    }
    
    if (answers.goals?.includes('Stress management')) {
      recommendations.push('stress');
    }
    
    if (answers.goals?.includes('Anxiety help')) {
      recommendations.push('anxiety');
    }
    
    if (answers.goals?.includes('Mindfulness/meditation')) {
      recommendations.push('mindfulness');
    }
    
    return recommendations;
  };

  const ResourceIcon = ({ type }: { type: string }) => {
    const Icon = resourceTypeIcons[type as keyof typeof resourceTypeIcons] || Globe;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            Mental Wellness Resource Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover personalized mental health resources, emergency support, and wellness tools 
            tailored to your unique needs
          </p>
        </motion.div>

        {/* Emergency Alert */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                If you're in crisis, help is available 24/7
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowEmergencyDialog(true)}
              >
                Get Help Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-200 rounded-lg">
                  <Target className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Quick Assessment</h3>
                  <p className="text-sm text-green-600">Get personalized recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Search className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">Browse Resources</h3>
                  <p className="text-sm text-blue-600">Explore by category or type</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800">Crisis Support</h3>
                  <p className="text-sm text-purple-600">Immediate help available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Resources */}
        {quickAccess && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Quick Access
            </h2>
            
            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="crisis">Crisis</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
              </TabsList>

              <TabsContent value="featured">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickAccess.featured?.map((resource: MentalWellnessResource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ResourceIcon type={resource.resourceType} />
                            {resource.title}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            {resource.rating}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{resource.category}</Badge>
                          {resource.costInfo && (
                            <Badge variant="outline" className="text-green-600">
                              {resource.costInfo}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleResourceClick(resource)}
                          className="w-full"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Access Resource
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="popular">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickAccess.popular?.map((resource: MentalWellnessResource) => (
                    <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ResourceIcon type={resource.resourceType} />
                          {resource.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{resource.usageCount} people helped</span>
                        </div>
                        <Button 
                          onClick={() => handleResourceClick(resource)}
                          className="w-full"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Access Resource
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="crisis">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickAccess.crisis?.map((resource: MentalWellnessResource) => (
                    <Card key={resource.id} className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                          <AlertCircle className="w-5 h-5" />
                          {resource.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-red-700 mb-3">{resource.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">{resource.availability}</span>
                        </div>
                        <Button 
                          onClick={() => handleResourceClick(resource)}
                          variant="destructive"
                          className="w-full"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Get Help Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="emergency">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickAccess.emergency?.map((contact: EmergencyContact) => (
                    <Card key={contact.id} className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                          <Phone className="w-5 h-5" />
                          {contact.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-red-700 mb-3">{contact.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">{contact.availability}</span>
                          </div>
                          {contact.specialty && (
                            <div className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">{contact.specialty}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleEmergencyCall(contact)}
                            variant="destructive"
                            className="flex-1"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call {contact.phoneNumber}
                          </Button>
                          {contact.textSupport && (
                            <Button 
                              onClick={() => window.location.href = `sms:${contact.textSupport}`}
                              variant="outline"
                              size="sm"
                            >
                              Text
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="crisis">Crisis</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="depression">Depression</SelectItem>
                  <SelectItem value="stress">Stress</SelectItem>
                  <SelectItem value="mindfulness">Mindfulness</SelectItem>
                  <SelectItem value="relationship">Relationship</SelectItem>
                  <SelectItem value="self-care">Self-Care</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hotline">Hotline</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="meditation">Meditation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource: MentalWellnessResource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ResourceIcon type={resource.resourceType} />
                    {resource.title}
                  </CardTitle>
                  {resource.rating && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="w-3 h-3 mr-1" />
                      {resource.rating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{resource.category}</Badge>
                  {resource.targetAudience !== 'general' && (
                    <Badge variant="outline">{resource.targetAudience}</Badge>
                  )}
                  {resource.costInfo && (
                    <Badge variant="outline" className="text-green-600">
                      {resource.costInfo}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {resource.availability}
                  </div>
                  {resource.languages.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4" />
                      {resource.languages.join(', ')}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleResourceClick(resource)}
                  className="w-full"
                  variant={resource.isEmergency ? "destructive" : "default"}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {resource.isEmergency ? 'Get Emergency Help' : 'Access Resource'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Dialog */}
        <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Emergency Mental Health Support
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  If you're having thoughts of self-harm or suicide, please reach out immediately. 
                  You're not alone, and help is available.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                {emergencyAlertData.contacts.map((contact, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-red-800">{contact.name}</h4>
                          <p className="text-sm text-red-600">{contact.available}</p>
                        </div>
                        <Button 
                          onClick={() => window.location.href = `tel:${contact.phone}`}
                          variant="destructive"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {contact.phone}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}