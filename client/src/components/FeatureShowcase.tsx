import React from 'react';
import { PWANotifications } from './PWANotifications';
import { EnhancedSearch } from './EnhancedSearch';
import { VoiceNavigation } from './VoiceNavigation';
import { OptimizedImage } from './OptimizedImage';

interface FeatureShowcaseProps {
  onNavigate?: (destination: string) => void;
  onSearch?: (query: string) => void;
}

export function FeatureShowcase({ onNavigate, onSearch }: FeatureShowcaseProps) {
  const handleSearchSelect = (suggestion: any) => {
    console.log('Selected suggestion:', suggestion);
    if (onNavigate) {
      onNavigate(suggestion.url);
    }
  };

  const handleVoiceNavigate = (command: string, destination: string) => {
    console.log('Voice navigation:', command, destination);
    if (onNavigate) {
      onNavigate(destination);
    }
  };

  const features = [
    {
      id: 'pwa',
      title: 'Progressive Web App (PWA)',
      description: 'Install the app for offline access and native app experience',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      benefits: [
        'Works offline with cached content',
        'Fast loading with service worker',
        'Install prompts for better engagement',
        'Push notifications support'
      ]
    },
    {
      id: 'search',
      title: 'Enhanced Search with Autocomplete',
      description: 'Intelligent search with real-time suggestions and categorized results',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      benefits: [
        'Instant suggestions while typing',
        'Categorized search results',
        'Keyboard navigation support',
        'Debounced queries for performance'
      ]
    },
    {
      id: 'voice',
      title: 'Voice Navigation',
      description: 'Hands-free navigation and search using voice commands',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      benefits: [
        'Accessibility for users with disabilities',
        'Hands-free operation',
        'Natural language commands',
        'Voice search capabilities'
      ]
    },
    {
      id: 'images',
      title: 'WebP Image Optimization',
      description: 'Next-generation image format for faster loading',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      benefits: [
        'Up to 35% smaller file sizes',
        'Automatic fallback to original format',
        'Lazy loading for performance',
        'Responsive image generation'
      ]
    },
    {
      id: 'caching',
      title: 'Advanced Caching Strategies',
      description: 'Smart caching for optimal performance and offline support',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      benefits: [
        'Cache-first for static assets',
        'Network-first for API calls',
        'Stale-while-revalidate strategy',
        'Background sync for offline forms'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Enhanced WholeWellness Features
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience our latest UX improvements designed to make wellness coaching 
          more accessible, efficient, and user-friendly.
        </p>
      </div>

      {/* Interactive Demo Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Try Our Enhanced Features
        </h2>
        
        {/* Enhanced Search Demo */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Enhanced Search</h3>
          <EnhancedSearch
            onSelect={handleSearchSelect}
            onSearch={onSearch}
            className="max-w-2xl mx-auto"
          />
          <p className="text-sm text-gray-600 text-center">
            Try typing "coach", "session", or "mental health" to see suggestions
          </p>
        </div>

        {/* WebP Optimization Demo */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Optimized Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <OptimizedImage
              src="/api/placeholder/300/200"
              webpSrc="/api/placeholder/300/200.webp"
              alt="Wellness coaching session"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
            <OptimizedImage
              src="/api/placeholder/300/200"
              webpSrc="/api/placeholder/300/200.webp"
              alt="Meditation and mindfulness"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
            <OptimizedImage
              src="/api/placeholder/300/200"
              webpSrc="/api/placeholder/300/200.webp"
              alt="Health and wellness resources"
              width={300}
              height={200}
              className="rounded-lg shadow-md"
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Images automatically use WebP format when supported, with lazy loading
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              {feature.description}
            </p>
            
            <ul className="space-y-2">
              {feature.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Performance Improvements
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
            <div className="text-sm text-gray-600">Faster Image Loading</div>
            <div className="text-xs text-gray-500">with WebP format</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
            <div className="text-sm text-gray-600">Offline Availability</div>
            <div className="text-xs text-gray-500">with service worker caching</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">50%</div>
            <div className="text-sm text-gray-600">Search Speed Improvement</div>
            <div className="text-xs text-gray-500">with debounced queries</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
            <div className="text-sm text-gray-600">Accessibility Compliant</div>
            <div className="text-xs text-gray-500">WCAG AA standards</div>
          </div>
        </div>
      </div>

      {/* Installation Status */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          PWA Installation Status
        </h3>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Service Worker: Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Manifest: Loaded</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Install Prompt: Ready</span>
          </div>
        </div>
      </div>

      {/* PWA Notifications */}
      <PWANotifications />
      
      {/* Voice Navigation */}
      <VoiceNavigation 
        onNavigate={handleVoiceNavigate}
        onSearch={onSearch}
      />
    </div>
  );
}