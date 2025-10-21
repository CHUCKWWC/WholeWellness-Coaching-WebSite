import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, MessageCircle, Shield, Clock, Users, Zap, Send, User, Bot, Settings, Palette, Heart, Dumbbell, ExternalLink, ArrowUp, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HelpBubble from "@/components/HelpBubble";
import { WithEmpatheticHelp } from "@/components/EmpatheticHelpProvider";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatUI } from "@/ui/ChatUIContext";
import LegalMenu from "@/components/chat/LegalMenu";

export default function AICoaching() {
  const { setChatActive } = useChatUI();
  
  useEffect(() => {
    setChatActive(true);
    return () => setChatActive(false);
  }, [setChatActive]);
  const [showChat, setShowChat] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date, sessionId?: string}>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentPersona, setCurrentPersona] = useState("supportive");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isPopup, setIsPopup] = useState(false);
  const [showSuggestedPrompts, setShowSuggestedPrompts] = useState(true);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check if opened in popup mode and load coach from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coachParam = urlParams.get('coach');
    const popupParam = urlParams.get('popup');
    
    if (popupParam === 'true') {
      setIsPopup(true);
    }
    
    if (coachParam) {
      try {
        const coachData = JSON.parse(decodeURIComponent(coachParam));
        setSelectedCoach(coachData);
        setShowChat(true);
        setMessages([{
          id: `welcome-${Date.now()}`,
          text: `Hello! I'm ${coachData.coach}. I'm here to help you with ${(coachData?.specialties ?? []).join(', ').toLowerCase()}. What would you like to work on today?`,
          isUser: false,
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Failed to parse coach data from URL:', error);
      }
    }
  }, []);

  // Persona configurations with brand colors
  const personaConfig = {
    supportive: {
      name: "Supportive & Empathetic",
      color: "#0D7377",
      description: "Warm, understanding, and encouraging approach",
      icon: Heart,
      sampleResponses: ["Let's explore that together with compassion", "I'm here to support you through this journey"]
    },
    motivational: {
      name: "Motivational & Energetic", 
      color: "#F7B801",
      description: "High-energy, inspiring, and goal-focused",
      icon: Zap,
      sampleResponses: ["You've got this! Let's make it happen!", "Time to turn those goals into reality!"]
    },
    analytical: {
      name: "Analytical & Strategic",
      color: "#5E9A62",
      description: "Data-driven, logical, and solution-oriented",
      icon: Brain,
      sampleResponses: ["Let's break this down systematically", "Based on the data, here's what I recommend"]
    },
    gentle: {
      name: "Gentle & Nurturing",
      color: "#8DB4C2",
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

  // Fallback responses for when AI is unavailable
  const getFallbackResponse = (coachType: string, persona: string) => {
    const fallbackResponses: Record<string, string[]> = {
      mindfulness: [
        "I'm here to support your mindfulness journey. While I process your request, remember to take a deep breath and be present in this moment.",
        "Mindfulness is about being present. Let's explore this together with patience and compassion.",
        "Thank you for sharing. I'm processing your message and will provide thoughtful guidance shortly."
      ],
      behavior: [
        "Your behavioral patterns are unique to you. I'm analyzing your message to provide personalized insights.",
        "Change happens one step at a time. Let's work together to identify positive patterns.",
        "I appreciate your openness. Processing your concerns to offer you the best behavioral strategies."
      ],
      wellness: [
        "Holistic wellness touches every part of your life. I'm considering all aspects of your question.",
        "Your wellness journey is important. Let me gather my thoughts to give you comprehensive guidance.",
        "Balance is key. I'm formulating a response that addresses your whole wellbeing."
      ],
      relationship: [
        "Relationships are complex and deserve careful consideration. I'm reflecting on your message.",
        "Building healthy connections takes time and understanding. Let me provide you with thoughtful insights.",
        "Thank you for trusting me with this. I'm preparing guidance for your relationship concerns."
      ],
      mentalhealth: [
        "Your mental health matters deeply. I'm processing your message with the care it deserves.",
        "It takes courage to reach out. I'm here to support you and will respond thoughtfully.",
        "Mental wellness is a journey. Let me provide you with supportive and evidence-based guidance."
      ],
      weightloss: [
        "Sustainable weight management is about lifestyle, not just diet. I'm considering all aspects of your goals.",
        "Every wellness journey is unique. I'm personalizing my response to your specific needs.",
        "Healthy habits take time to build. Let me provide you with practical, achievable guidance."
      ]
    };

    const responses = fallbackResponses[coachType] || [
      "Thank you for reaching out. I'm processing your message and will respond shortly with personalized guidance.",
      "I'm here to support you. Let me gather my thoughts to provide you with the best possible advice.",
      "Your question is important. I'm formulating a thoughtful response tailored to your needs."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // AI Chat mutation with memory and fallback support
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
      const fallbackText = isAuthenticated 
        ? getFallbackResponse(selectedCoach?.id || 'mindfulness', currentPersona)
        : "To get personalized AI coaching responses, please sign in to your account. In the meantime, I can share that your question is important and our AI coaches are designed to provide thoughtful, evidence-based guidance tailored to your unique needs.";
      
      const fallbackMessage = {
        id: `fallback-${Date.now()}`,
        text: fallbackText,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);

      if (isAuthenticated) {
        toast({
          title: "Service Temporarily Unavailable",
          description: "Using fallback response. Full AI features will return shortly.",
          variant: "default",
        });
      }
    },
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim() || !selectedCoach) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: message,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    sendMessage.mutate({
      message: message,
      coachType: selectedCoach.id,
      persona: currentPersona,
      sessionId: currentSessionId
    });

    setInputMessage("");
    setShowSuggestedPrompts(false);
  };

  const handlePersonaChange = (newPersona: string) => {
    setCurrentPersona(newPersona);
    const config = personaConfig[newPersona as keyof typeof personaConfig];
    
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

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    setShowSuggestedPrompts(false);
    inputRef.current?.focus();
  };

  const handleCoachSelect = (coach: any) => {
    setSelectedCoach(coach);
    setShowChat(true);
    setMessages([{
      id: `welcome-${Date.now()}`,
      text: `Hello! I'm ${coach.coach}. I'm here to help you with ${(coach?.specialties ?? []).join(', ').toLowerCase()}. What would you like to work on today?`,
      isUser: false,
      timestamp: new Date()
    }]);
  };

  const openChatInNewWindow = (coach: any) => {
    const coachData = encodeURIComponent(JSON.stringify({
      id: coach.id,
      name: coach.name,
      coach: coach.coach,
      avatar: coach.avatar,
      description: coach.description,
      specialties: coach.specialties,
      color: coach.color,
      suggestedPrompts: coach.suggestedPrompts
    }));
    
    const windowFeatures = 'width=800,height=600,resizable=yes,scrollbars=yes,status=yes';
    const newWindow = window.open(
      `/ai-coaching?coach=${coachData}&popup=true`,
      'AI_Coach_Chat',
      windowFeatures
    );
    
    if (newWindow) {
      newWindow.focus();
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to open chat in a new window.",
        variant: "destructive",
      });
    }
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
        "Help me develop a daily mindfulness practice"
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
        "Strategies for overcoming procrastination"
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
        "Developing a self-care routine"
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
        "Resolving conflicts constructively"
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
        "Building emotional resilience"
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
        "Track my progress and provide motivation"
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
      <div className={`bg-white dark:bg-gray-900 ${isPopup ? 'h-screen' : 'min-h-[calc(100vh-0px)]'} flex flex-col`}>
        {/* Chat Header with Exit and Legal */}
        {!isPopup && (
          <header className="h-14 flex items-center justify-between px-3 border-b bg-white dark:bg-gray-800">
            <div className="font-semibold text-gray-900 dark:text-white">AI Coaching - {selectedCoach.coach}</div>
            <div className="flex items-center gap-2">
              <a href="/" className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Exit chat</a>
              <LegalMenu />
            </div>
          </header>
        )}
        
        {/* ChatGPT-style Sub-Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isPopup && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setShowChat(false);
                    setSelectedCoach(null);
                    setMessages([]);
                  }}
                  className="mr-2"
                >
                  ←
                </Button>
              )}
              <div className="text-2xl">{selectedCoach.avatar}</div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{selectedCoach.coach}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentPersonaConfig.name}</p>
              </div>
            </div>
            
            <Select value={currentPersona} onValueChange={setCurrentPersona}>
              <SelectTrigger className="w-[180px] h-9 text-sm border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(personaConfig).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-3.5 w-3.5" style={{ color: config.color }} />
                        <span className="text-sm">{config.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subscription Notice */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/20">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">Unlock Unlimited AI Coaching</span> — Get personalized support 24/7 for $19.99/month with a 7-day free trial
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-secondary text-white whitespace-nowrap"
                onClick={() => window.open('https://buy.stripe.com/4gMdR992mfSabe601z3oA0', '_blank')}
                data-testid="button-subscribe"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>

        {/* Guest Preview Notice */}
        {!isAuthenticated && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="max-w-4xl mx-auto px-4 py-2">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-medium">Guest Preview:</span> <a href="/register" className="underline hover:no-underline">Sign up free</a> to save your conversation history.
              </p>
            </div>
          </div>
        )}

        {/* Messages Container - ChatGPT Style */}
        <div className="flex-1 overflow-y-auto" ref={messagesContainerRef}>
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message: any) => {
              if (message.isSystem) {
                return (
                  <div key={message.id} className="flex justify-center my-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400">
                      {message.text}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`group mb-6 ${message.isUser ? '' : 'bg-gray-50 dark:bg-gray-800/50'} ${message.isUser ? '' : '-mx-4 px-4 py-6'}`}
                >
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser 
                        ? 'bg-gray-900 dark:bg-gray-100' 
                        : 'bg-primary'
                    }`}>
                      {message.isUser ? (
                        <User className="w-5 h-5 text-white dark:text-gray-900" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {message.isUser ? 'You' : selectedCoach.coach}
                      </p>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {sendMessage.isPending && (
              <div className="group mb-6 bg-gray-50 dark:bg-gray-800/50 -mx-4 px-4 py-6">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedCoach.coach}
                    </p>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Prompts - Shows when no messages */}
            {showSuggestedPrompts && messages.length <= 1 && (
              <div className="mt-8 space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCoach.suggestedPrompts.slice(0, 4).map((prompt: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm text-gray-700 dark:text-gray-300"
                      data-testid={`prompt-${index}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ChatGPT-style Input Area - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message..."
                  className="resize-none min-h-[52px] max-h-[200px] pr-12 py-3 rounded-2xl border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputMessage);
                    }
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                  }}
                  data-testid="input-message"
                />
                <Button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || sendMessage.isPending}
                  size="sm"
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-lg bg-primary hover:bg-primary/90 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400"
                  data-testid="button-send"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
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
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-primary hover:bg-secondary text-white transition-colors"
                      onClick={() => handleCoachSelect(coach)}
                      data-testid={`button-start-chat-${coach.id}`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                    <Button 
                      variant="outline"
                      className="px-3 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                      onClick={() => openChatInNewWindow(coach)}
                      title="Open in new window"
                      data-testid={`button-open-window-${coach.id}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
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
                      data-testid={`button-coach-${coach.id}`}
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

      {/* Pricing & CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Unlock Unlimited AI Coaching
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get 24/7 access to all specialized AI coaches with unlimited conversations
            </p>
          </div>
          
          <Card className="max-w-2xl mx-auto border-2 border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                BEST VALUE
              </div>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">$19.99</span>
                <span className="text-gray-600 text-lg">/month</span>
              </div>
              <div className="text-primary font-semibold text-lg">
                7-Day Free Trial
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">✓</div>
                  <p className="text-gray-700">Unlimited conversations with all 6 specialized AI coaches</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">✓</div>
                  <p className="text-gray-700">24/7 availability - chat anytime, anywhere</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">✓</div>
                  <p className="text-gray-700">Personalized coaching across mindfulness, wellness, relationships, mental health & more</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">✓</div>
                  <p className="text-gray-700">Conversation history & progress tracking</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">✓</div>
                  <p className="text-gray-700">Cancel anytime - no commitments</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-secondary text-white font-semibold py-6 text-lg transition-all hover:shadow-lg"
                  onClick={() => window.open('https://buy.stripe.com/4gMdR992mfSabe601z3oA0', '_blank')}
                  data-testid="button-subscribe-main"
                >
                  Start Your Free Trial
                </Button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  7 days free, then $19.99/month. Cancel anytime.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('ai-coaches')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Explore AI Coaches First
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
