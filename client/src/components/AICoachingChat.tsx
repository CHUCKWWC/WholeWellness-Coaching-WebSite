import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  agentType?: string;
}

interface AIAgent {
  id: string;
  name: string;
  specialization: string;
  description: string;
  color: string;
  icon: string;
}

const AI_AGENTS: AIAgent[] = [
  {
    id: "finance-coach",
    name: "Financial Wellness Coach",
    specialization: "Finance & Money Management",
    description: "Helping you build healthy financial habits, budgeting, and debt management strategies",
    color: "bg-green-500",
    icon: "💰"
  },
  {
    id: "relationship-coach", 
    name: "Relationship Coach",
    specialization: "Relationships & Communication",
    description: "Supporting your journey in building healthy relationships and communication skills",
    color: "bg-pink-500",
    icon: "💕"
  },
  {
    id: "career-coach",
    name: "Career Development Coach", 
    specialization: "Career & Professional Growth",
    description: "Guiding your career transitions, job search, and professional development",
    color: "bg-blue-500",
    icon: "🚀"
  },
  {
    id: "health-coach",
    name: "Health & Wellness Coach",
    specialization: "Health & Lifestyle",
    description: "Supporting your physical wellness, nutrition, and healthy lifestyle choices",
    color: "bg-emerald-500",
    icon: "🌱"
  },
  {
    id: "mindset-coach",
    name: "Mindset & Mental Wellness Coach",
    specialization: "Mental Health & Personal Growth", 
    description: "Helping you develop resilience, confidence, and emotional well-being",
    color: "bg-purple-500",
    icon: "🧠"
  },
  {
    id: "life-transition-coach",
    name: "Life Transition Coach",
    specialization: "Major Life Changes",
    description: "Supporting you through divorce, loss, career changes, and other major transitions",
    color: "bg-orange-500",
    icon: "🦋"
  }
];

interface AICoachingChatProps {
  selectedAgent?: AIAgent;
  onAgentChange?: (agent: AIAgent) => void;
}

export default function AICoachingChat({ selectedAgent, onAgentChange }: AICoachingChatProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AIAgent | null>(selectedAgent || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAgentSelect = (agent: AIAgent) => {
    if (!disclaimerAccepted) {
      setShowDisclaimer(true);
      setCurrentAgent(agent);
      return;
    }
    
    setCurrentAgent(agent);
    onAgentChange?.(agent);
    
    // Add welcome message from the selected agent
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      content: `Hello! I'm your ${agent.name}. ${agent.description}. How can I support you today?`,
      sender: 'ai',
      timestamp: new Date(),
      agentType: agent.id
    };
    
    setMessages([welcomeMessage]);
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
    
    if (currentAgent) {
      onAgentChange?.(currentAgent);
      
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        content: `Hello! I'm your ${currentAgent.name}. ${currentAgent.description}. How can I support you today?`,
        sender: 'ai',
        timestamp: new Date(),
        agentType: currentAgent.id
      };
      
      setMessages([welcomeMessage]);
    }
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
    setCurrentAgent(null);
    toast({
      title: "Disclaimer Required",
      description: "You must accept the medical disclaimer to use AI coaching services.",
      variant: "destructive",
    });
  };

  const sendMessageToN8N = async (message: string, agentId: string) => {
    try {
      const response = await fetch('https://wholewellness-coaching.app.n8n.cloud/webhook/54619a3e-0c22-4288-a126-47dbf7a934dd/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          agentType: agentId,
          userId: user?.id,
          userEmail: user?.email,
          timestamp: new Date().toISOString(),
          sessionId: `session-${user?.id}-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "I apologize, but I'm having trouble processing your request right now. Please try again.";
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentAgent || !isAuthenticated) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToN8N(newMessage, currentAgent.id);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        agentType: currentAgent.id
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the AI coaching service. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        agentType: currentAgent.id
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to access AI coaching services.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Agent Selection */}
        {!currentAgent && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your AI Coach</CardTitle>
              <p className="text-sm text-gray-600">
                Select a specialized AI coach based on your current needs and goals.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AI_AGENTS.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start text-left space-y-2 hover:shadow-md transition-shadow"
                    onClick={() => handleAgentSelect(agent)}
                  >
                    <div className="flex items-center space-x-2 w-full">
                      <span className="text-2xl">{agent.icon}</span>
                      <Badge className={`${agent.color} text-white text-xs`}>
                        {agent.specialization}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{agent.name}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        {currentAgent && disclaimerAccepted && (
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{currentAgent.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{currentAgent.name}</CardTitle>
                    <Badge className={`${currentAgent.color} text-white text-xs`}>
                      {currentAgent.specialization}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setCurrentAgent(null);
                    setMessages([]);
                  }}
                >
                  Change Coach
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.sender === 'ai' && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.sender === 'user' && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
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
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ask your ${currentAgent.name} anything...`}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimer
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
        type="coaching"
        title="AI Coaching Services - Medical Disclaimer"
      />
    </>
  );
}