import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Minimize2, Maximize2, Lock, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  session_id: string;
  agent_type: string;
  title: string;
  started_at: string;
  last_activity: string;
  message_count: number;
}

interface ChatbotProps {
  webhookUrl?: string;
}

export default function Chatbot({ 
  webhookUrl = "https://wholewellnesscoaching.app.n8n.cloud/webhook/54619a3e-0c22-4288-a126-47dbf7a934dd/chat" 
}: ChatbotProps) {
  const { user, isAuthenticated, isPaidMember, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Life Coach from Whole Wellness Coaching. I'm here to provide personalized, science-backed guidance for your wellness journey. To give you the best support, I'll need access to your intake form data. Have you completed our Weight Loss Intake Questionnaire yet?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch user's chat sessions
  const { data: chatSessions } = useQuery<ChatSession[]>({
    queryKey: ['/api/chat/sessions', user?.id],
    enabled: isAuthenticated && !!user?.id,
    retry: false,
  });

  // Load session messages when currentSessionId changes
  const { data: sessionMessages } = useQuery<Message[]>({
    queryKey: ['/api/chat/messages', currentSessionId],
    enabled: !!currentSessionId,
    retry: false,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Generate session ID if not already set
      if (!currentSessionId) {
        setCurrentSessionId(`session_${user?.id}_${Date.now()}`);
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          userId: user?.id,
          userEmail: user?.email,
          sessionId: currentSessionId || `session_${user?.id}_${Date.now()}`,
          agentType: 'general',
          timestamp: new Date().toISOString(),
          user_data: {
            source: 'wholewellnesscoaching.org',
            membershipLevel: user?.membershipLevel,
            intake_form_url: 'https://wholewellnesscoaching.org/weight-loss-intake'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update current session ID from response if provided
      if (data.sessionId && data.sessionId !== currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm experiencing technical difficulties. Please ensure you've completed the intake form at https://wholewellnesscoaching.org/weight-loss-intake and try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const quickActions = [
    "I completed the intake form",
    "I need help with meal planning",
    "Tell me about your coaching process",
    "What supplements do you recommend?"
  ];

  // Don't show chatbot if auth is loading
  if (authLoading) {
    return null;
  }

  // Show member-only access button for non-members
  if (!isAuthenticated || !isPaidMember) {
    if (!isOpen) {
      return (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg z-50"
          size="icon"
        >
          <Lock className="h-6 w-6 text-white" />
        </Button>
      );
    }

    return (
      <Card className="fixed bottom-4 right-4 z-50 shadow-xl border-2 w-96 h-80">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-600 text-white rounded-t-lg">
          <CardTitle className="text-lg font-semibold">
            AI Life Coach - Members Only
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Lock className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">
            The AI Life Coach is available exclusively to our paid members. 
            Upgrade your membership to access personalized coaching guidance.
          </p>
          <div className="space-y-2 w-full">
            <Button 
              onClick={() => window.location.href = '/members'}
              className="w-full pl-[17px] pr-[17px] pt-[28px] pb-[28px] mt-[23px] mb-[23px] ml-[1px] mr-[1px] bg-blue-600 hover:bg-blue-700"
            >
              {isAuthenticated ? 'Upgrade Membership' : 'Login / Sign Up'}
            </Button>
            <Button 
              onClick={() => window.location.href = '/booking'}
              variant="outline"
              className="w-full pl-[17px] pr-[17px] pt-[28px] pb-[28px] mt-[23px] mb-[23px] ml-[1px] mr-[1px]"
            >
              Book Live Coach Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular chatbot for paid members
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 shadow-xl border-2 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold">
          {isMinimized ? 'AI Life Coach' : 'Whole Wellness AI Coach'}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 text-white hover:bg-blue-700"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-full p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-1">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(action)}
                    className="text-xs h-6 px-2"
                    disabled={isLoading}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your wellness journey..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Powered by Whole Wellness Coaching AI
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}