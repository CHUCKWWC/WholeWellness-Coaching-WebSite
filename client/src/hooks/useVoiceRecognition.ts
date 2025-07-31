import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseVoiceRecognitionReturn {
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  results: VoiceRecognitionResult[];
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Check if speech recognition is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSupported = typeof SpeechRecognition !== 'undefined';

export function useVoiceRecognition(config: VoiceRecognitionConfig = {}): UseVoiceRecognitionReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    maxAlternatives = 1
  } = config;

  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<VoiceRecognitionResult[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('[Voice] Recognition started');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('[Voice] Recognition ended');
    };

    recognition.onerror = (event) => {
      console.error('[Voice] Recognition error:', event.error);
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
      
      // Handle specific errors
      switch (event.error) {
        case 'no-speech':
          setError('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setError('Microphone not accessible. Please check permissions.');
          break;
        case 'not-allowed':
          setError('Microphone permission denied. Please allow access.');
          break;
        case 'network':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError(`Recognition error: ${event.error}`);
      }
    };

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      const currentResults: VoiceRecognitionResult[] = [];

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        currentResults.push({
          transcript,
          confidence,
          isFinal: result.isFinal
        });

        if (result.isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      setInterimTranscript(interimText);
      setFinalTranscript(prev => prev + finalText);
      setTranscript(finalText || interimText);
      setResults(prev => [...prev, ...currentResults]);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If we have a final result and not continuous, stop after a brief delay
      if (finalText && !continuous) {
        timeoutRef.current = setTimeout(() => {
          recognition.stop();
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      recognition.abort();
    };
  }, [continuous, interimResults, language, maxAlternatives]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      // Reset previous state
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      
      // Don't reset final transcript for continuous mode
      if (!continuous) {
        setFinalTranscript('');
        setResults([]);
      }

      recognitionRef.current.start();
    } catch (err) {
      console.error('[Voice] Failed to start recognition:', err);
      setError('Failed to start voice recognition');
    }
  }, [continuous]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setResults([]);
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported,
    error,
    results,
    startListening,
    stopListening,
    resetTranscript
  };
}