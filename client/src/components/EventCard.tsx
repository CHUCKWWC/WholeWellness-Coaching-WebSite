import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Star,
  DollarSign
} from "lucide-react";
import { type Event } from "@shared/schema";
import { Link } from "wouter";

interface EventCardProps {
  event: Event & {
    coach?: {
      name: string;
      profileImage?: string | null;
    };
    registrationCount?: number;
    spotsRemaining?: number | null;
  };
  compact?: boolean;
}

function EventCard({ event, compact = false }: EventCardProps) {
  const eventDate = new Date(event.startTime);
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
  const isPast = eventDate < new Date();
  const isFree = Number(event.price) === 0;

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      webinar: "Webinar",
      workshop: "Workshop",
      group_coaching: "Group Coaching",
      live_stream: "Live Stream",
      certification: "Certification",
    };
    return labels[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      webinar: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      workshop: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      group_coaching: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      live_stream: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      certification: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    };
    return colors[type] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-shadow ${
        compact ? "flex flex-row" : ""
      } ${isPast ? "opacity-60" : ""}`}
      data-testid={`event-card-${event.id}`}
    >
      {event.imageUrl && (
        <div className={compact ? "w-48 flex-shrink-0" : "w-full h-48"}>
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex-1">
        <CardHeader className={compact ? "pb-2" : ""}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-2">
              <Badge 
                className={getEventTypeColor(event.eventType)}
                data-testid="badge-event-type"
              >
                {getEventTypeLabel(event.eventType)}
              </Badge>
              {event.isFeatured && (
                <Badge variant="default" className="bg-teal-600" data-testid="badge-featured">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {isFull && (
                <Badge variant="destructive" data-testid="badge-full">Full</Badge>
              )}
              {isPast && (
                <Badge variant="secondary" data-testid="badge-past">Past Event</Badge>
              )}
            </div>
            {!isFree && (
              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold">
                <DollarSign className="w-4 h-4" />
                {event.price}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {event.title}
          </h3>
          
          {!compact && event.description && (
            <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className={compact ? "pb-2" : ""}>
          <div className="space-y-2">
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span className="text-sm">
                {eventDate.toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-sm">
                {eventDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </span>
            </div>

            {/* Participants */}
            {event.maxParticipants && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4 text-teal-600" />
                <span className="text-sm">
                  {event.currentParticipants} / {event.maxParticipants} participants
                  {event.spotsRemaining !== undefined && event.spotsRemaining > 0 && (
                    <span className="text-teal-600 ml-1">
                      ({event.spotsRemaining} spots left)
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {/* Coach */}
            {event.coach && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={event.coach.profileImage || undefined} />
                  <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
                    {event.coach.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  with {event.coach.name}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Link href={`/events/${event.id}`} className="w-full">
            <Button 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              disabled={isFull || isPast}
              data-testid="button-view-event"
            >
              {isFull ? "Event Full" : isPast ? "View Recording" : isFree ? "Join Free" : "Learn More"}
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}

export default EventCard;
export { EventCard };
