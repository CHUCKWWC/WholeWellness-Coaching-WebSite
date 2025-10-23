// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Users, Clock, Plus, Edit, Trash2, Eye, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Event } from "@shared/schema";

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  category: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
  maxParticipants: number | null;
  price: string;
  imageUrl: string;
  learningObjectives: string[];
  isFeatured: boolean;
  isPublished: boolean;
}

export default function CoachEventManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [objectives, setObjectives] = useState<string[]>([""]);

  // Fetch coach's events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/coach/events'],
    enabled: !!user,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: Partial<EventFormData>) => {
      return apiRequest("POST", "/api/events", {
        ...data,
        learningObjectives: objectives.filter(o => o.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Event Created!",
        description: "Your event has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Event",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EventFormData> }) => {
      return apiRequest("PUT", `/api/events/${id}`, {
        ...data,
        learningObjectives: objectives.filter(o => o.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setEditingEvent(null);
      resetForm();
      toast({
        title: "Event Updated!",
        description: "Your event has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Event",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return apiRequest("DELETE", `/api/events/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coach/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event Deleted",
        description: "The event has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Event",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setObjectives([""]);
    setEditingEvent(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<EventFormData> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      eventType: formData.get("eventType") as string,
      category: formData.get("category") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      timezone: formData.get("timezone") as string || "America/New_York",
      location: formData.get("location") as string,
      maxParticipants: formData.get("maxParticipants") ? parseInt(formData.get("maxParticipants") as string) : null,
      price: formData.get("price") as string || "0",
      imageUrl: formData.get("imageUrl") as string,
      isFeatured: formData.get("isFeatured") === "on",
      isPublished: formData.get("isPublished") === "on",
    };

    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, data });
    } else {
      createEventMutation.mutate(data);
    }
  };

  const upcomingEvents = events.filter(e => new Date(e.startTime) > new Date());
  const pastEvents = events.filter(e => new Date(e.startTime) <= new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your workshops and group sessions</p>
        </div>
        <Dialog open={showCreateDialog || !!editingEvent} onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingEvent(null);
            resetForm();
          } else {
            setShowCreateDialog(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700" data-testid="button-create-event">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update your event details" : "Fill in the details for your new event or workshop"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingEvent?.title}
                  placeholder="e.g., Mindfulness Workshop"
                  required
                  data-testid="input-event-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingEvent?.description || ""}
                  placeholder="Describe what participants will learn and experience"
                  rows={3}
                  required
                  data-testid="textarea-event-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <Select name="eventType" defaultValue={editingEvent?.eventType || "workshop"} required>
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="group_coaching">Group Coaching</SelectItem>
                      <SelectItem value="live_stream">Live Stream</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select name="category" defaultValue={editingEvent?.category || "wellness"} required>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="relationships">Relationships</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Date & Time *</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    defaultValue={editingEvent?.startTime ? new Date(editingEvent.startTime).toISOString().slice(0, 16) : ""}
                    required
                    data-testid="input-start-time"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Date & Time *</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    defaultValue={editingEvent?.endTime ? new Date(editingEvent.endTime).toISOString().slice(0, 16) : ""}
                    required
                    data-testid="input-end-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={editingEvent?.location || ""}
                    placeholder="Online or physical address"
                    data-testid="input-location"
                  />
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    defaultValue={editingEvent?.maxParticipants || ""}
                    placeholder="Leave empty for unlimited"
                    data-testid="input-max-participants"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  defaultValue={editingEvent?.price || "0"}
                  placeholder="0.00"
                  data-testid="input-price"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  defaultValue={editingEvent?.imageUrl || ""}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-image-url"
                />
              </div>

              <div>
                <Label>Learning Objectives</Label>
                {objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index] = e.target.value;
                        setObjectives(newObjectives);
                      }}
                      placeholder={`Objective ${index + 1}`}
                      data-testid={`input-objective-${index}`}
                    />
                    {objectives.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setObjectives(objectives.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setObjectives([...objectives, ""])}
                  data-testid="button-add-objective"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Objective
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch id="isFeatured" name="isFeatured" defaultChecked={editingEvent?.isFeatured} />
                  <Label htmlFor="isFeatured">Featured Event</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isPublished" name="isPublished" defaultChecked={editingEvent?.isPublished !== false} />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  data-testid="button-submit-event"
                >
                  {createEventMutation.isPending || updateEventMutation.isPending
                    ? "Saving..."
                    : editingEvent
                    ? "Update Event"
                    : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{upcomingEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div>Loading events...</div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first event to start engaging with clients
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                        </div>
                        {event.isFeatured && (
                          <Badge className="bg-amber-100 text-amber-700">Featured</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {event.maxParticipants && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            {event.currentParticipants || 0} / {event.maxParticipants} participants
                          </div>
                        )}
                        {Number(event.price) > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            ${event.price}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`/events/${event.id}`, '_blank')}
                          data-testid={`button-view-${event.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingEvent(event);
                            setObjectives(event.learningObjectives || [""]);
                          }}
                          data-testid={`button-edit-${event.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this event?")) {
                              deleteEventMutation.mutate(event.id);
                            }
                          }}
                          data-testid={`button-delete-${event.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Past Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map((event) => (
                  <Card key={event.id} className="opacity-75">
                    <CardHeader>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.currentParticipants || 0} participants
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
