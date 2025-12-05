import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "@/components/EventCard";
import { Search, Filter, Calendar, Sparkles } from "lucide-react";
import { type Event } from "@shared/schema";

const categories = [
  "All Categories",
  "health",
  "relationships",
  "career",
  "mindfulness",
  "wellness",
  "nutrition",
];

const eventTypes = [
  "All Types",
  "webinar",
  "workshop",
  "group_coaching",
  "live_stream",
  "certification",
];

export default function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("All Types");
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

  // Fetch events
  const { data: events = [], isLoading } = useQuery<(Event & {
    coach?: { name: string; profileImage?: string | null };
    registrationCount?: number;
    spotsRemaining?: number | null;
  })[]>({
    queryKey: [
      '/api/events',
      selectedCategory !== "All Categories" ? selectedCategory : undefined,
      selectedType !== "All Types" ? selectedType : undefined,
      showOnlyFeatured ? "true" : undefined,
    ],
    queryFn: async ({ queryKey }) => {
      const params = new URLSearchParams();
      if (queryKey[1]) params.append('category', queryKey[1] as string);
      if (queryKey[2]) params.append('eventType', queryKey[2] as string);
      if (queryKey[3]) params.append('isFeatured', queryKey[3] as string);
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  // Filter events by search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.coach?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group events: featured and regular
  const featuredEvents = filteredEvents.filter(e => e.isFeatured);
  const regularEvents = filteredEvents.filter(e => !e.isFeatured);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="w-16 h-16" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Upcoming Events & Workshops
            </h1>
            <p className="text-xl text-teal-50 max-w-2xl mx-auto">
              Join our live workshops, webinars, and group coaching sessions led by expert coaches
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events, coaches, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-events"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-48" data-testid="select-type">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Featured Toggle */}
            <Button
              variant={showOnlyFeatured ? "default" : "outline"}
              onClick={() => setShowOnlyFeatured(!showOnlyFeatured)}
              className={showOnlyFeatured ? "bg-teal-600 hover:bg-teal-700" : ""}
              data-testid="button-toggle-featured"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Featured
            </Button>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or check back later for new events
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-teal-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Featured Events
                  </h2>
                  <Badge className="bg-teal-600">
                    {featuredEvents.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Events */}
            {regularEvents.length > 0 && (
              <div>
                {featuredEvents.length > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      All Events
                    </h2>
                    <Badge variant="secondary">
                      {regularEvents.length}
                    </Badge>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-teal-50 to-white dark:from-gray-800 dark:to-gray-900 py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of individuals on their wellness journey. Register for an event today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Browse Events
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.location.href = '/booking'}
            >
              Book 1-on-1 Session
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
