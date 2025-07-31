import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, MessageCircle, Shield, Clock, Users, Zap, Send, User, Bot, Settings, Palette, Heart, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HelpBubble from "@/components/HelpBubble";
import { WithEmpatheticHelp } from "@/components/EmpatheticHelpProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AICoaching() {
  const [showChat, setShowChat] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date, sessionId?: string}>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentPersona, setCurrentPersona] = useState("supportive");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // Persona configurations with brand colors
  const personaConfig = {
    supportive: {
      name: "Supportive & Empathetic",
      color: "#0D7377", // Brand teal
      description: "Warm, understanding, and encouraging approach",
      icon: Heart,
      sampleResponses: ["Let's explore that together with compassion", "I'm here to support you through this journey"]
    },
    motivational: {
      name: "Motivational & Energetic", 
      color: "#F7B801", // Brand yellow
      description: "High-energy, inspiring, and goal-focused",
      icon: Zap,
      sampleResponses: ["You've got this! Let's make it happen!", "Time to turn those goals into reality!"]
    },
    analytical: {
      name: "Analytical & Strategic",
      color: "#5E9A62", // Brand green
      description: "Data-driven, logical, and solution-oriented",
      icon: Brain,
      sampleResponses: ["Let's break this down systematically", "Based on the data, here's what I recommend"]
    },
    gentle: {
      name: "Gentle & Nurturing",
      color: "#8DB4C2", // Soft blue-green
      description: "Calm, patient, and understanding approach",
      icon: Users,
      sampleResponses: ["Take your time, there's no rush", "Every small step counts"]
    }
  };

  // Get current persona configuration
  const currentPersonaConfig = personaConfig[currentPersona as keyof typeof personaConfig];

  // Load chat history for current session
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat/history', currentSessionId],
    enabled: !!currentSessionId,
  });

  // Load previous chat sessions
  const { data: chatSessions } = useQuery({
    queryKey: ['/api/chat/sessions', user?.id],
    enabled: !!user && isAuthenticated,
  });

  // AI Chat mutation with memory
  const sendMessage = useMutation({
    mutationFn: async (data: { message: string; coachType: string; persona?: string; sessionId?: string | null }) => {
      const response = await apiRequest("POST", "/api/ai-coaching/chat", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.response) {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !selectedCoach) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Send to AI with persona context
    sendMessage.mutate({
      message: message,
      coachType: selectedCoach.id,
      persona: currentPersona,
      sessionId: currentSessionId
    });

    setInputMessage("");
  };

  const handlePersonaChange = (newPersona: string) => {
    setCurrentPersona(newPersona);
    const config = personaConfig[newPersona as keyof typeof personaConfig];
    
    // Add system message about persona change
    const systemMessage = {
      id: `system-${Date.now()}`,
      text: `Coaching style changed to: ${config.name}`,
      isUser: false,
      timestamp: new Date(),
      isSystem: true
    };
    setMessages(prev => [...prev, systemMessage]);

    toast({
      title: "Coaching Style Updated",
      description: `Now using ${config.name} approach`,
    });
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100); // Small delay to ensure DOM is updated
    return () => clearTimeout(timer);
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleCoachSelect = (coach: any) => {
    setSelectedCoach(coach);
    setShowChat(true);
    setMessages([{
      id: `welcome-${Date.now()}`,
      text: `Hello! I'm ${coach.coach}. I'm here to help you with ${coach.specialties.join(', ').toLowerCase()}. What would you like to work on today?`,
      isUser: false,
      timestamp: new Date()
    }]);
  };

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Specialized AI Coaches",
      description: "Choose from expert AI coaches trained in finance, relationships, career, health, mindset, and life transitions."
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Personalized Conversations",
      description: "Engage in meaningful, contextual conversations tailored to your specific goals and challenges."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Safe & Confidential",
      description: "All conversations are private and secure, with medical disclaimers ensuring responsible guidance."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Availability",
      description: "Access coaching support whenever you need it, day or night, at your own pace."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Human Coaching Integration",
      description: "AI coaching complements our human coaching services for a comprehensive support system."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Insights",
      description: "Get immediate feedback, strategies, and actionable advice for your personal growth journey."
    }
  ];

  const aiCoaches = [
    {
      id: "mindfulness",
      name: "Mindfulness Coach",
      description: "Helping you find peace and clarity through meditation and mindful living",
      color: "bg-purple-100 text-purple-800",
      specialties: ["Meditation", "Stress Reduction", "Mindful Living", "Breathing Techniques"],
      avatar: "🧘‍♀️",
      coach: "Charlene - Mindfulness Coach",
      suggestedPrompts: [
        "Guide me through a 5-minute meditation",
        "How can I manage stress at work?",
        "Teach me mindful breathing techniques",
        "Help me develop a daily mindfulness practice",
        "Ways to stay present throughout the day"
      ]
    },
    {
      id: "behavior",
      name: "Behavior Coach",
      description: "Supporting positive behavior change and habit formation",
      color: "bg-blue-100 text-blue-800",
      specialties: ["Habit Formation", "Goal Setting", "Behavior Modification", "Accountability"],
      avatar: "🎯",
      coach: "Lisa - Behavior Coach",
      suggestedPrompts: [
        "Help me break a bad habit",
        "Create a morning routine for productivity",
        "How to stay consistent with my goals",
        "Strategies for overcoming procrastination",
        "Building healthy lifestyle habits"
      ]
    },
    {
      id: "wellness",
      name: "Wellness Coach",
      description: "Your guide to holistic health and well-being",
      color: "bg-green-100 text-green-800",
      specialties: ["Holistic Health", "Lifestyle Balance", "Self-Care", "Energy Management"],
      avatar: "✨",
      coach: "Dasha - Wellness Coach",
      suggestedPrompts: [
        "Create a balanced wellness plan for me",
        "How to improve my sleep quality",
        "Natural ways to boost energy",
        "Developing a self-care routine",
        "Balancing work and personal life"
      ]
    },
    {
      id: "relationship",
      name: "Relationship Coach",
      description: "Building stronger, healthier connections",
      color: "bg-pink-100 text-pink-800",
      specialties: ["Communication Skills", "Conflict Resolution", "Trust Building", "Intimacy"],
      avatar: "💕",
      coach: "Charles - Relationship Coach",
      suggestedPrompts: [
        "How to improve communication with my partner",
        "Dealing with trust issues in relationships",
        "Setting healthy boundaries",
        "Resolving conflicts constructively",
        "Building emotional intimacy"
      ]
    },
    {
      id: "mentalhealth",
      name: "Mental Health Support",
      description: "Compassionate support for your emotional well-being",
      color: "bg-indigo-100 text-indigo-800",
      specialties: ["Emotional Support", "Coping Strategies", "Mental Wellness", "Crisis Support"],
      avatar: "🤗",
      coach: "Bobby - Mental Health Support",
      suggestedPrompts: [
        "I'm feeling overwhelmed today",
        "Coping strategies for anxiety",
        "How to deal with negative thoughts",
        "Building emotional resilience",
        "Finding motivation when feeling down"
      ]
    },
    {
      id: "weightloss",
      name: "Weight Loss Coach",
      description: "Personalized guidance for sustainable weight management",
      color: "bg-emerald-100 text-emerald-800",
      specialties: ["Meal Planning", "Fitness Guidance", "Nutrition Education", "Motivation"],
      avatar: "🏃‍♀️",
      coach: "Aria - Weight Loss Coach",
      suggestedPrompts: [
        "Create a personalized meal plan for my goals",
        "Design a workout routine for beginners",
        "Help me overcome emotional eating",
        "Track my progress and provide motivation",
        "Suggest healthy snacks for busy days"
      ]
    }
  ];

  const coachingAreas = [
    {
      name: "Financial Wellness",
      description: "Budgeting, debt management, savings strategies, and building healthy money habits",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "Career Development",
      description: "Job search strategies, professional growth, career transitions, and workplace confidence",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Mindset & Mental Health",
      description: "Building resilience, overcoming limiting beliefs, emotional regulation, and personal growth",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Life Transitions",
      description: "Divorce recovery, grief support, career changes, and navigating major life shifts",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  if (showChat && selectedCoach) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowChat(false);
                setSelectedCoach(null);
                setMessages([]);
              }}
              className="mb-4"
            >
              ← Back to AI Coaching Overview
            </Button>
          </div>

          {/* Chat Interface - Mobile Optimized */}
          <Card className={`${isMobile ? 'h-[90vh]' : 'h-[700px]'} flex flex-col shadow-xl`}>
            <CardHeader 
              className={`border-b bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 ${isMobile ? 'p-3' : 'p-6'}`}
              style={{ 
                borderBottom: `3px solid ${currentPersonaConfig.color}`,
                background: `linear-gradient(135deg, ${currentPersonaConfig.color}15 0%, ${currentPersonaConfig.color}05 100%)`
              }}
            >
              <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                  <div className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>{selectedCoach.avatar}</div>
                  <div>
                    <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>{selectedCoach.name}</CardTitle>
                    <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{selectedCoach.coach}</CardDescription>
                  </div>
                </div>
                
                {/* Persona Selector in Chat Header - Mobile Responsive */}
                <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                  <Badge 
                    variant="outline" 
                    className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1'}`}
                    style={{ 
                      borderColor: currentPersonaConfig.color,
                      color: currentPersonaConfig.color,
                      backgroundColor: `${currentPersonaConfig.color}10`
                    }}
                  >
                    {isMobile ? currentPersonaConfig.name.split(' ')[0] : currentPersonaConfig.name}
                  </Badge>
                  <Select value={currentPersona} onValueChange={setCurrentPersona}>
                    <SelectTrigger className={`${isMobile ? 'w-[140px] text-xs' : 'w-[200px]'}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(personaConfig).map(([key, config]) => {
                        const IconComponent = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" style={{ color: config.color }} />
                              <span className={`${isMobile ? 'text-xs' : ''}`}>{config.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area - Mobile Optimized with Fixed Scrolling */}
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div 
                className={`flex-1 overflow-y-auto scroll-smooth ${isMobile ? 'p-2' : 'p-4'} ${isMobile ? 'space-y-2' : 'space-y-4'} bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900`}
                style={{
                  maxHeight: isMobile ? 'calc(90vh - 180px)' : 'calc(700px - 180px)',
                  minHeight: '300px'
                }}
                ref={messagesContainerRef}
              >
                {messages.map((message: any) => {
                  // Handle system messages differently
                  if (message.isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-xs text-gray-600 dark:text-gray-300">
                          {message.text}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-md ${
                          message.isUser 
                            ? 'text-white'
                            : 'text-white'
                        }`}
                        style={{
                          backgroundColor: message.isUser ? currentPersonaConfig.color : '#6B7280'
                        }}>
                          {message.isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={`rounded-2xl px-4 py-3 shadow-sm max-w-full ${
                          message.isUser 
                            ? 'text-white' 
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                        }`}
                        style={{
                          backgroundColor: message.isUser ? currentPersonaConfig.color : undefined
                        }}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                          <p className={`text-xs mt-2 ${
                            message.isUser ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {sendMessage.isPending && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gray-200">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="rounded-lg p-3 bg-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Prompts */}
              <div className="border-t p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested prompts:</p>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: currentPersonaConfig.color }}
                    ></div>
                    {currentPersonaConfig.name} style
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCoach.suggestedPrompts.map((prompt: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptClick(prompt)}
                      className="text-xs h-8 hover:shadow-sm transition-all duration-200"
                      style={{
                        borderColor: `${currentPersonaConfig.color}50`,
                        backgroundColor: 'white',
                        '--hover-bg': `${currentPersonaConfig.color}10`
                      } as any}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${currentPersonaConfig.color}10`;
                        e.currentTarget.style.borderColor = currentPersonaConfig.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = `${currentPersonaConfig.color}50`;
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Type your message here... (${currentPersonaConfig.name} style)`}
                      className="resize-none border-2 focus:border-current transition-colors pr-12"
                      style={{ borderColor: `${currentPersonaConfig.color}30` }}
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(inputMessage);
                        }
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = currentPersonaConfig.color;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = `${currentPersonaConfig.color}30`;
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || sendMessage.isPending}
                    className="self-end px-6 shadow-md hover:shadow-lg transition-all duration-200"
                    style={{ 
                      backgroundColor: currentPersonaConfig.color,
                      borderColor: currentPersonaConfig.color
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full">
              <Brain className="h-12 w-12" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <h1 className="text-4xl lg:text-6xl font-bold">
              AI Coaching Services
            </h1>
            <HelpBubble
              context="coaching-selection"
              trigger="auto"
              delay={2000}
              position="bottom"
              className="inline-block"
            />
          </div>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Access personalized coaching support 24/7 with our specialized AI coaches. 
            Get instant guidance for your personal growth journey in areas that matter most to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => document.getElementById('ai-coaches')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Choose Your AI Coach
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white hover:bg-white hover:text-primary text-[#121827]"
            >
              Learn More About AI Coaching
            </Button>
          </div>
        </div>
      </section>

      {/* Specialized AI Coaches Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Specialized AI Coaches
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start your personalized coaching journey with our expert AI coaches, each trained in specific areas to help you achieve your goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {aiCoaches.map((coach, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{coach.avatar}</div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">{coach.name}</CardTitle>
                      <p className="text-primary font-medium">{coach.coach}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 mb-4 text-base">
                    {coach.description}
                  </CardDescription>
                  
                  <div className="mb-6">
                    <p className="font-semibold text-gray-900 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className={coach.color}>
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-secondary text-white transition-colors"
                    onClick={() => handleCoachSelect(coach)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat with {coach.coach.split(' - ')[0]}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Coaching?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI coaching platform combines cutting-edge technology with proven coaching methodologies 
              to provide personalized support for your unique journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Coaches Section */}
      <section id="ai-coaches" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your AI Coach
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from our specialized AI coaches, each trained to provide expert guidance 
              in their specific area of expertise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiCoaches.map((coach, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{coach.avatar}</div>
                    <div>
                      <CardTitle className="text-lg">{coach.name}</CardTitle>
                      <p className="text-sm text-gray-600">{coach.coach}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                    {coach.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {coach.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary" className={`text-xs ${coach.color}`}>
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleCoachSelect(coach)}
                      className="w-full"
                      variant="default"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat with {coach.coach.split(' - ')[0]}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Areas Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Additional Coaching Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform also supports guidance in these important life areas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coachingAreas.map((area, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <Badge className={area.color}>
                      Coming Soon
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {area.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Disclaimer Section */}
      <section className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-amber-200 bg-white">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-xl text-amber-800">
                  Important Medical Disclaimer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our AI coaching services are designed for general wellness and personal development support. 
                <strong> These services are not a substitute for professional medical, mental health, or therapeutic care.</strong>
              </p>
              <div className="bg-amber-100 p-4 rounded-lg">
                <p className="text-amber-800 font-medium text-sm">
                  Before starting any coaching session, you will be required to read and accept our medical disclaimer. 
                  If you have specific health concerns, mental health needs, or are in crisis, please consult with 
                  qualified healthcare professionals.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Emergency: If you are in crisis or having thoughts of self-harm, please call 911 or 988 (Suicide & Crisis Lifeline) immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Start Your AI Coaching Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Choose your specialized AI coach and begin personalized conversations 
            that support your growth and transformation.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8 mx-auto max-w-md">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$299</div>
              <div className="text-white/90 text-sm">6 AI Coaching Sessions</div>
              <div className="text-white/80 text-xs">50% off live coaching rates</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => document.getElementById('ai-coaches')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary hover:bg-gray-100"
            >
              Choose Your AI Coach
            </Button>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white"
              onClick={() => window.location.href = '/subscribe?plan=ai_coaching'}
            >
              Purchase AI Package - $299
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}