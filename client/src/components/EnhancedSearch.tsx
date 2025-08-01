import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  description?: string;
  url: string;
}

interface EnhancedSearchProps {
  placeholder?: string;
  onSelect?: (suggestion: SearchSuggestion) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

// Mock data - in real app this would come from API
const mockSuggestions: SearchSuggestion[] = [
  { id: '1', title: 'Book a Session', category: 'Actions', description: 'Schedule a coaching session', url: '/book-session' },
  { id: '2', title: 'AI Coach - Charlene', category: 'Coaches', description: 'Mindfulness and meditation coaching', url: '/coaches/charlene' },
  { id: '3', title: 'AI Coach - Lisa', category: 'Coaches', description: 'Behavior change specialist', url: '/coaches/lisa' },
  { id: '4', title: 'AI Coach - Dasha', category: 'Coaches', description: 'General wellness coaching', url: '/coaches/dasha' },
  { id: '5', title: 'Mental Health Assessment', category: 'Assessments', description: 'Evaluate your mental health', url: '/assessments/mental-health' },
  { id: '6', title: 'Weight Loss Journey', category: 'Programs', description: 'Personalized weight loss program', url: '/programs/weight-loss' },
  { id: '7', title: 'Relationship Coaching', category: 'Services', description: 'Improve your relationships', url: '/services/relationships' },
  { id: '8', title: 'Crisis Support', category: 'Support', description: '24/7 crisis support resources', url: '/crisis-support' },
  { id: '9', title: 'Resource Library', category: 'Resources', description: 'Access educational materials', url: '/resources' },
  { id: '10', title: 'Progress Tracking', category: 'Tools', description: 'Track your wellness journey', url: '/progress' }
];

export function EnhancedSearch({ placeholder = "Search coaches, resources, sessions...", onSelect, onSearch, className = "" }: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [debouncedQuery] = useDebouncedValue(query, 300);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter suggestions based on query
  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    
    return mockSuggestions
      .filter(item => 
        item.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 suggestions
  }, [debouncedQuery]);

  // Group suggestions by category
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, SearchSuggestion[]> = {};
    suggestions.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [suggestions]);

  useEffect(() => {
    if (onSearch && debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex]);
        } else if (query.trim()) {
          onSearch?.(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setIsOpen(false);
    onSelect?.(suggestion);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
          aria-label="Search"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Voice Search Button */}
        <button
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => {/* Voice search functionality */}}
          aria-label="Voice search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <ul ref={listRef} role="listbox" className="py-2">
            {Object.entries(groupedSuggestions).map(([category, items]) => (
              <React.Fragment key={category}>
                <li className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {category}
                </li>
                {items.map((suggestion, index) => {
                  const globalIndex = suggestions.findIndex(s => s.id === suggestion.id);
                  return (
                    <li
                      key={suggestion.id}
                      role="option"
                      aria-selected={selectedIndex === globalIndex}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        selectedIndex === globalIndex 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'hover:bg-gray-50 text-gray-900'
                      }`}
                      onClick={() => handleSelect(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {highlightMatch(suggestion.title, debouncedQuery)}
                          </div>
                          {suggestion.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {highlightMatch(suggestion.description, debouncedQuery)}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-xs text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </React.Fragment>
            ))}
          </ul>
          
          {/* No results message */}
          {debouncedQuery && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm">No results found for "{debouncedQuery}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for coaches, sessions, or resources</p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}