import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users, MapPin, Video, DollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { format, isAfter, isBefore, addHours } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  eventType: string;
  coachName: string;
  imageUrl?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  maxParticipants: number | null;
  currentParticipants: number;
  price: string;
  isPaid: boolean;
  isPublic: boolean;
  streamUrl?: string;
  streamProvider?: string;
  meetingLink?: string;
  tags: string[];
  category: string;
  isFeatured: boolean;
  status: string;
}

export default function ComingEvents() {
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await apiRequest("POST", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've been registered for this event!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "webinar": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "workshop": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "group_coaching": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "live_stream": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "certification": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isEventFull = (event: Event) => {
    return event.maxParticipants !== null && event.currentParticipants >= event.maxParticipants;
  };

  const isEventSoon = (event: Event) => {
    const eventStart = new Date(event.startTime);
    const now = new Date();
    return isAfter(eventStart, now) && isBefore(eventStart, addHours(now, 48));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingEvents = events?.filter(e => e.status === 'upcoming') || [];
  const featuredEvents = upcomingEvents.filter(e => e.isFeatured);
  const regularEvents = upcomingEvents.filter(e => !e.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Live Events & Workshops</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Coming Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our upcoming wellness workshops, webinars, and group coaching sessions. 
            Connect with expert coaches and community members.
          </p>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Tag className="h-6 w-6 text-primary" />
              Featured Events
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow" data-testid={`event-card-${event.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getEventTypeColor(event.eventType)} data-testid={`event-type-${event.id}`}>
                        {formatEventType(event.eventType)}
                      </Badge>
                      {isEventSoon(event) && (
                        <Badge variant="destructive" className="animate-pulse">
                          Starting Soon
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl" data-testid={`event-title-${event.id}`}>{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.startTime), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.startTime), "p")} - {format(new Date(event.endTime), "p")} {event.timezone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {event.maxParticipants 
                          ? `${event.currentParticipants} / ${event.maxParticipants} registered`
                          : `${event.currentParticipants} registered`
                        }
                      </span>
                    </div>
                    {event.coachName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Coach: {event.coachName}</span>
                      </div>
                    )}
                    {event.streamProvider && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Video className="h-4 w-4 text-primary" />
                        <span>Live Stream ({event.streamProvider})</span>
                      </div>
                    )}
                    {event.isPaid && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>${parseFloat(event.price).toFixed(2)}</span>
                      </div>
                    )}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {event.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => registerMutation.mutate(event.id)}
                      disabled={registerMutation.isPending || isEventFull(event)}
                      className="w-full bg-primary hover:bg-primary/90"
                      data-testid={`button-register-${event.id}`}
                    >
                      {isEventFull(event) ? "Event Full" : event.isPaid ? "Register & Pay" : "Register Free"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Events */}
        {regularEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              All Upcoming Events
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getEventTypeColor(event.eventType)} data-testid={`event-type-${event.id}`}>
                        {formatEventType(event.eventType)}
                      </Badge>
                      {isEventSoon(event) && (
                        <Badge variant="destructive" className="text-xs">
                          Soon
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2" data-testid={`event-title-${event.id}`}>{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.startTime), "PP")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{format(new Date(event.startTime), "p")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-xs">
                        {event.maxParticipants 
                          ? `${event.currentParticipants}/${event.maxParticipants}`
                          : event.currentParticipants
                        }
                      </span>
                    </div>
                    {event.isPaid && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>${parseFloat(event.price).toFixed(2)}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => registerMutation.mutate(event.id)}
                      disabled={registerMutation.isPending || isEventFull(event)}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="sm"
                      data-testid={`button-register-${event.id}`}
                    >
                      {isEventFull(event) ? "Full" : "Register"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {upcomingEvents.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Upcoming Events</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check back soon for new wellness workshops and coaching sessions!
              </p>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-notify">
                Notify Me of New Events
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
