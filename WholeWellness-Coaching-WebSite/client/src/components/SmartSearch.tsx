import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Clock, Star, Sparkles } from 'lucide-react';
import { Link } from 'wouter';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  tags: string[];
  popularity: 'high' | 'medium' | 'low';
  isNew?: boolean;
  estimatedTime?: string;
}

const searchableContent: SearchResult[] = [
  {
    id: 'ai-coaching',
    title: 'AI Coaching',
    description: 'Get instant support from 6 specialized AI coaches for nutrition, fitness, wellness, and more.',
    category: 'Coaching',
    link: '/ai-coaching',
    tags: ['AI', 'coaching', 'nutrition', 'fitness', 'wellness', 'instant', 'chat'],
    popularity: 'high',
    estimatedTime: '2 min'
  },
  {
    id: 'wellness-journey',
    title: 'Wellness Journey Planner',
    description: 'Create personalized wellness plans with goal tracking, milestones, and AI insights.',
    category: 'Planning',
    link: '/wellness-journey',
    tags: ['wellness', 'goals', 'tracking', 'personalized', 'AI insights', 'milestones'],
    popularity: 'high',
    isNew: true,
    estimatedTime: '5 min'
  },
  {
    id: 'assessments',
    title: 'Wellness Assessments',
    description: 'Complete comprehensive assessments for weight loss, mental health, and attachment style.',
    category: 'Assessment',
    link: '/assessments',
    tags: ['assessment', 'evaluation', 'weight loss', 'mental health', 'attachment'],
    popularity: 'high',
    estimatedTime: '10 min'
  },
  {
    id: 'certification',
    title: 'Certification Courses',
    description: 'Professional development courses with progress tracking and digital certificates.',
    category: 'Education',
    link: '/coach-certifications',
    tags: ['certification', 'courses', 'professional', 'development', 'certificates'],
    popularity: 'medium',
    estimatedTime: '2-4 weeks'
  },
  {
    id: 'live-coaching',
    title: 'Live Coaching Sessions',
    description: 'Get matched with professional coaches for personalized 1-on-1 sessions.',
    category: 'Coaching',
    link: '/digital-onboarding',
    tags: ['live', 'coaching', 'professional', 'sessions', 'personalized', 'matching'],
    popularity: 'high',
    estimatedTime: '15 min setup'
  },
  {
    id: 'recommendations',
    title: 'Personal Recommendations',
    description: 'AI-powered wellness recommendations tailored to your unique needs and goals.',
    category: 'Recommendations',
    link: '/personalized-recommendations',
    tags: ['recommendations', 'personalized', 'AI', 'wellness', 'tailored'],
    popularity: 'medium',
    estimatedTime: '3 min'
  }
];

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchableContent.filter(item => {
        const searchText = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.description.toLowerCase().includes(searchText) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
          item.category.toLowerCase().includes(searchText)
        );
      }).sort((a, b) => {
        // Prioritize by popularity and relevance
        if (a.popularity === 'high' && b.popularity !== 'high') return -1;
        if (b.popularity === 'high' && a.popularity !== 'high') return 1;
        return 0;
      });
      
      setResults(searchResults);
      setShowSuggestions(true);
    } else {
      setResults(searchableContent.slice(0, 4)); // Show popular items when no query
      setShowSuggestions(query === '');
    }
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    onClose();
    // Track search usage
    localStorage.setItem(`searched_${result.id}`, 'true');
  };

  const popularSuggestions = ['AI coaching', 'wellness plan', 'assessment', 'certification'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for features, tools, or help..."
              className="pl-10 pr-4 py-2 text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!query && (
            <div className="p-4 border-b">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Popular searches</h4>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <Link key={result.id} href={result.link}>
                    <Card 
                      className="cursor-pointer hover:bg-gray-50 transition-colors border-0 shadow-none"
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">
                                {result.title}
                              </h4>
                              {result.isNew && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  New
                                </Badge>
                              )}
                              {result.popularity === 'high' && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {result.description}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {result.category}
                              </span>
                              {result.estimatedTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {result.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center text-gray-500">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try searching for "AI coaching", "wellness", or "assessment"</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-3 border-t bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Escape</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}