import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Video, Copy, Check } from "lucide-react";

const sessionSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  scheduledStartTime: z.string().min(1, "Please select a start time"),
  duration: z.string().min(1, "Please select duration"),
  recordingEnabled: z.boolean().default(true),
  transcriptEnabled: z.boolean().default(true),
  aiSummaryEnabled: z.boolean().default(true),
});

type SessionForm = z.infer<typeof sessionSchema>;

interface Client {
  id: string;
  name: string;
  email?: string;
}

interface StartVideoSessionDialogProps {
  clients?: Client[];
  trigger?: React.ReactNode;
  onSessionCreated?: (session: any) => void;
}

export default function StartVideoSessionDialog({
  clients = [],
  trigger,
  onSessionCreated,
}: StartVideoSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [sessionCreated, setSessionCreated] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      clientId: "",
      title: "",
      description: "",
      scheduledStartTime: "",
      duration: "60",
      recordingEnabled: true,
      transcriptEnabled: true,
      aiSummaryEnabled: true,
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionForm) => {
      const scheduledStartTime = new Date(data.scheduledStartTime);
      const durationMinutes = parseInt(data.duration);
      const scheduledEndTime = new Date(
        scheduledStartTime.getTime() + durationMinutes * 60000
      );

      const response = await apiRequest("POST", "/api/video/sessions/create", {
        clientId: data.clientId,
        sessionType: "one-on-one",
        title: data.title,
        description: data.description,
        scheduledStartTime: scheduledStartTime.toISOString(),
        scheduledEndTime: scheduledEndTime.toISOString(),
        maxParticipants: 1,
        recordingEnabled: data.recordingEnabled,
        transcriptEnabled: data.transcriptEnabled,
        aiSummaryEnabled: data.aiSummaryEnabled,
      });

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Session Created!",
        description: "Your video session has been created successfully.",
      });
      setSessionCreated(data);
      if (onSessionCreated) {
        onSessionCreated(data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SessionForm) => {
    createSessionMutation.mutate(data);
  };

  const handleCopyLink = () => {
    if (sessionCreated?.joinUrl) {
      const fullUrl = `${window.location.origin}${sessionCreated.joinUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Session link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSessionCreated(null);
    form.reset();
  };

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-start-video-session">
            <Video className="h-4 w-4 mr-2" />
            Start Video Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {!sessionCreated ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Start Video Session
              </DialogTitle>
              <DialogDescription>
                Create a new video coaching session with your client.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="demo-client" disabled>
                              No clients available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Weekly Check-in"
                          {...field}
                          data-testid="input-session-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Session notes or agenda..."
                          {...field}
                          data-testid="input-session-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            min={getMinDateTime()}
                            {...field}
                            data-testid="input-start-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-duration">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Session Features</p>
                    <p className="text-xs text-gray-500">
                      Recording, transcript, and AI summary are enabled by default
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSessionMutation.isPending}
                    data-testid="button-create-session"
                  >
                    {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Session Created Successfully!
              </DialogTitle>
              <DialogDescription>
                Share the link below with your client to join the session.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-2">Session Details</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">Title:</span>{" "}
                    {sessionCreated.session?.title}
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">Room Code:</span>{" "}
                    <span className="font-mono font-bold text-lg">
                      {sessionCreated.roomCode}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Join Link</p>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}${sessionCreated.joinUrl}`}
                    readOnly
                    data-testid="input-join-link"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                    data-testid="button-copy-link"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose} data-testid="button-close">
                  Close
                </Button>
                <Button
                  onClick={() => window.open(sessionCreated.joinUrl, "_blank")}
                  data-testid="button-join-session"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Session Now
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
