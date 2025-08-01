import React, { useState, useEffect, useRef } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface VoiceNavigationProps {
  onNavigate?: (command: string, destination: string) => void;
  onSearch?: (query: string) => void;
}

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: string[]) => void;
  description: string;
  example: string;
}

export function VoiceNavigation({ onNavigate, onSearch }: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  
  const { 
    transcript, 
    isSupported, 
    startListening, 
    stopListening, 
    resetTranscript 
  } = useVoiceRecognition({
    continuous: false,
    interimResults: false
  });

  // Define voice commands
  const commands: VoiceCommand[] = [
    {
      pattern: /^(go to|navigate to|open) (home|dashboard)$/i,
      action: () => handleNavigation('navigate', '/'),
      description: 'Navigate to home page',
      example: 'Go to home'
    },
    {
      pattern: /^(book|schedule) (a |)session$/i,
      action: () => handleNavigation('navigate', '/book-session'),
      description: 'Book a coaching session',
      example: 'Book a session'
    },
    {
      pattern: /^(show|open) (my |)coaches$/i,
      action: () => handleNavigation('navigate', '/coaches'),
      description: 'View available coaches',
      example: 'Show my coaches'
    },
    {
      pattern: /^(talk to|chat with) coach (.+)$/i,
      action: (matches) => handleNavigation('navigate', `/coaches/${matches[2].toLowerCase()}`),
      description: 'Start chat with specific coach',
      example: 'Talk to coach Charlene'
    },
    {
      pattern: /^(take|start) assessment$/i,
      action: () => handleNavigation('navigate', '/assessments'),
      description: 'Start an assessment',
      example: 'Take assessment'
    },
    {
      pattern: /^(show|view) (my |)progress$/i,
      action: () => handleNavigation('navigate', '/progress'),
      description: 'View progress tracking',
      example: 'Show my progress'
    },
    {
      pattern: /^(search for|find) (.+)$/i,
      action: (matches) => handleSearch(matches[2]),
      description: 'Search for resources or information',
      example: 'Search for mental health resources'
    },
    {
      pattern: /^(help|crisis|emergency)$/i,
      action: () => handleNavigation('navigate', '/crisis-support'),
      description: 'Access crisis support resources',
      example: 'Help'
    },
    {
      pattern: /^(show|list) commands$/i,
      action: () => setShowCommands(true),
      description: 'Show available voice commands',
      example: 'Show commands'
    },
    {
      pattern: /^(close|hide) commands$/i,
      action: () => setShowCommands(false),
      description: 'Hide voice commands list',
      example: 'Close commands'
    }
  ];

  useEffect(() => {
    if (transcript) {
      processVoiceCommand(transcript);
      setLastCommand(transcript);
      resetTranscript();
    }
  }, [transcript]);

  const processVoiceCommand = (text: string) => {
    const normalizedText = text.trim().toLowerCase();
    
    for (const command of commands) {
      const match = normalizedText.match(command.pattern);
      if (match) {
        try {
          command.action(match);
          setFeedback(`✓ Command executed: "${text}"`);
          setTimeout(() => setFeedback(''), 3000);
          return;
        } catch (error) {
          console.error('Voice command error:', error);
          setFeedback(`❌ Failed to execute: "${text}"`);
          setTimeout(() => setFeedback(''), 3000);
          return;
        }
      }
    }
    
    // If no command matched, treat it as a search
    if (normalizedText.length > 2) {
      handleSearch(text);
      setFeedback(`🔍 Searching for: "${text}"`);
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(`❓ Command not recognized: "${text}"`);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleNavigation = (command: string, destination: string) => {
    onNavigate?.(command, destination);
    // Fallback navigation if no handler provided
    if (!onNavigate && window) {
      window.location.href = destination;
    }
  };

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow activation with spacebar when focused
    if (e.code === 'Space' && e.target === e.currentTarget) {
      e.preventDefault();
      toggleListening();
    }
  };

  if (!isSupported) {
    return null; // Don't render if voice recognition is not supported
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Voice Commands Help Panel */}
      {showCommands && (
        <div className="mb-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Voice Commands</h3>
            <button
              onClick={() => setShowCommands(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close commands"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {commands.map((command, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-gray-700">{command.description}</div>
                <div className="text-gray-500 text-xs mt-1">
                  Example: "{command.example}"
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Click the microphone or press spacebar to start listening
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {feedback && (
        <div className="mb-4 w-80 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-700">{feedback}</div>
        </div>
      )}

      {/* Voice Control Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCommands(!showCommands)}
          className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
          aria-label="Show voice commands"
          title="Voice Commands Help"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <button
          onClick={toggleListening}
          onKeyDown={handleKeyDown}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
          title={isListening ? 'Stop listening (Press spacebar)' : 'Start voice command (Press spacebar)'}
          tabIndex={0}
        >
          {isListening ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Status indicator */}
      {isListening && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      )}
      
      {/* Last command display */}
      {lastCommand && !isListening && (
        <div className="absolute -top-12 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-md whitespace-nowrap opacity-75">
          "{lastCommand}"
        </div>
      )}
    </div>
  );
}