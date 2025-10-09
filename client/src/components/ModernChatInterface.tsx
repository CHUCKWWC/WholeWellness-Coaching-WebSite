import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, ChevronDown, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotionalTone?: 'positive' | 'neutral' | 'struggling' | 'crisis';
}

interface ModernChatInterfaceProps {
  coachName: string;
  coachAvatar: string;
  coachColor: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onRequestSummary?: () => void;
  onEscalateCrisis?: () => void;
  isLoading?: boolean;
}

export function ModernChatInterface({
  coachName,
  coachAvatar,
  coachColor,
  messages,
  onSendMessage,
  onRequestSummary,
  onEscalateCrisis,
  isLoading = false
}: ModernChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const getCoachInitials = () => {
    return coachName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'struggling': return 'text-amber-600 dark:text-amber-400';
      case 'crisis': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-offset-2" style={{ ringColor: coachColor }}>
            <AvatarFallback style={{ backgroundColor: coachColor }} className="text-white font-semibold">
              {getCoachInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{coachName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Active now
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9"
              aria-label="Chat options"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRequestSummary && (
              <DropdownMenuItem onClick={onRequestSummary} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Get Conversation Summary
              </DropdownMenuItem>
            )}
            {onEscalateCrisis && (
              <DropdownMenuItem onClick={onEscalateCrisis} className="gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                Request Human Support
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-60">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: coachColor + '20' }}
            >
              <Sparkles className="h-10 w-10" style={{ color: coachColor }} />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Welcome to {coachName}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
              I'm here to support you on your wellness journey. Share what's on your mind, and let's work together.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 group",
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarFallback style={{ backgroundColor: coachColor }} className="text-white text-xs">
                    {getCoachInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={cn(
                "flex flex-col max-w-[75%]",
                message.role === 'user' ? 'items-end' : 'items-start'
              )}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 shadow-sm",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-slate-700"
                  )}
                  style={message.role === 'assistant' ? { borderLeftColor: coachColor, borderLeftWidth: '3px' } : undefined}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.emotionalTone && message.role === 'user' && (
                    <span className={cn("text-xs", getToneColor(message.emotionalTone))}>
                      • {message.emotionalTone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback style={{ backgroundColor: coachColor }} className="text-white text-xs">
                {getCoachInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-slate-200 dark:border-slate-700" style={{ borderLeftColor: coachColor, borderLeftWidth: '3px' }}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-24 right-6">
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-lg"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
        <Card className="border-2 focus-within:border-primary transition-colors">
          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight(e);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-50 min-h-[40px] max-h-[120px]"
              aria-label="Message input"
              style={{ lineHeight: '1.5' }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: input.trim() && !isLoading ? coachColor : undefined }}
              aria-label="Send message"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
          {coachName} uses AI. For emergencies, call 988 (Suicide & Crisis Lifeline)
        </p>
      </div>
    </div>
  );
}
