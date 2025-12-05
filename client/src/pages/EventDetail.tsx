import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Star,
  CheckCircle,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function EventDetail() {
  const { eventId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [notes, setNotes] = useState("");

  // Fetch event details
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['/api/events', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return response.json();
    },
    enabled: !!eventId,
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/events/${eventId}/register`, { notes });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      setShowRegisterDialog(false);
      setNotes("");
      toast({
        title: "Registration Successful!",
        description: "You're registered for this event. Check your email for confirmation.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShare = () => {
    const url = `${window.location.origin}/events/${eventId}`;
    if (navigator.share) {
      navigator.share({
        title: eventData?.title,
        text: eventData?.description,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Event link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(eventData.startTime);
  const endDate = new Date(eventData.endTime);
  const isFull = eventData.maxParticipants && eventData.currentParticipants >= eventData.maxParticipants;
  const isPast = eventDate < new Date();
  const isFree = Number(eventData.price) === 0;
  const isRegistered = !!eventData.userRegistration;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/events">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>

        {/* Event Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
          {eventData.imageUrl && (
            <img 
              src={eventData.imageUrl} 
              alt={eventData.title}
              className="w-full h-64 object-cover"
            />
          )}
          
          <div className="p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-teal-600">{eventData.eventType}</Badge>
              {eventData.category && <Badge variant="outline">{eventData.category}</Badge>}
              {eventData.isFeatured && (
                <Badge className="bg-amber-100 text-amber-700">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {isRegistered && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Registered
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {eventData.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {eventData.description}
            </p>

            {/* Event Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-semibold">
                    {eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">Date</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-semibold">
                    {eventDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })} - {endDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">Time ({eventData.timezone})</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="font-semibold">
                    {eventData.currentParticipants} {eventData.maxParticipants && `/ ${eventData.maxParticipants}`} participants
                  </p>
                  <p className="text-sm text-gray-500">
                    {eventData.spotsRemaining ? `${eventData.spotsRemaining} spots left` : "Spots available"}
                  </p>
                </div>
              </div>

              {eventData.location && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <div>
                    <p className="font-semibold">{eventData.location}</p>
                    <p className="text-sm text-gray-500">Location</p>
                  </div>
                </div>
              )}
            </div>

            {/* Coach Info */}
            {eventData.coach && (
              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-semibold mb-3">Hosted by</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={eventData.coach.profileImage || undefined} />
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {eventData.coach.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {eventData.coach.name}
                    </p>
                    {eventData.coach.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {eventData.coach.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isRegistered && !isPast && !isFull && (
                <Button
                  size="lg"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => isAuthenticated ? setShowRegisterDialog(true) : window.location.href = '/login'}
                  data-testid="button-register"
                >
                  {isFree ? "Register for Free" : `Register - $${eventData.price}`}
                </Button>
              )}
              {isRegistered && (
                <Button
                  size="lg"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled
                  data-testid="button-registered"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  You're Registered
                </Button>
              )}
              {isFull && !isRegistered && (
                <Button size="lg" className="flex-1" disabled>
                  Event Full
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                data-testid="button-share"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Event Details */}
        {eventData.learningObjectives && eventData.learningObjectives.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {eventData.learningObjectives.map((objective: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Event</DialogTitle>
            <DialogDescription>
              Confirm your registration for {eventData.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Any questions or special requirements?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                data-testid="textarea-notes"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRegisterDialog(false)}
                className="flex-1"
                data-testid="button-cancel-registration"
              >
                Cancel
              </Button>
              <Button
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
                data-testid="button-confirm-registration"
              >
                {registerMutation.isPending ? "Registering..." : "Confirm Registration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
