import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Mail, Link2, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ShareSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomCode: string;
  sessionId: string;
  sessionTitle?: string;
}

export default function ShareSessionDialog({
  open,
  onOpenChange,
  roomCode,
  sessionId,
  sessionTitle = "Video Session"
}: ShareSessionDialogProps) {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Generate shareable link
  const baseUrl = window.location.origin;
  const shareableLink = `${baseUrl}/join/${roomCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      toast({
        title: "Room Code Copied!",
        description: "Share this code with participants to join the session.",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopiedLink(true);
      toast({
        title: "Link Copied!",
        description: "Share this link with participants to join the session.",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleSendEmailInvite = async () => {
    if (!recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter the recipient's email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const response = await apiRequest({
        url: `/api/video/sessions/${sessionId}/invite`,
        method: "POST",
        data: {
          email: recipientEmail,
          recipientName: recipientName || undefined,
        },
      });

      toast({
        title: "Invitation Sent!",
        description: `Video session invite has been sent to ${recipientEmail}`,
      });

      // Reset form and hide
      setRecipientEmail("");
      setRecipientName("");
      setShowEmailForm(false);
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = "Could not send invitation email. Please try again.";
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.details) {
        errorMessage = error.response.data.details;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to Send Invite",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Invite Participants
          </DialogTitle>
          <DialogDescription>
            Share this session with your clients or colleagues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room Code Section */}
          <div className="space-y-2">
            <Label htmlFor="room-code" className="text-sm font-medium">
              Room Code
            </Label>
            <div className="flex gap-2">
              <Input
                id="room-code"
                value={roomCode}
                readOnly
                className="font-mono text-lg text-center tracking-widest"
                data-testid="input-room-code-display"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyCode}
                data-testid="button-copy-room-code"
              >
                {copiedCode ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this code for participants to join at {baseUrl}/join
            </p>
          </div>

          {/* Shareable Link Section */}
          <div className="space-y-2">
            <Label htmlFor="share-link" className="text-sm font-medium">
              Direct Join Link
            </Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareableLink}
                readOnly
                className="text-sm"
                data-testid="input-share-link"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                data-testid="button-copy-link"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              One-click join link - no code needed
            </p>
          </div>

          {/* Email Invite Section */}
          {!showEmailForm ? (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEmailForm(true)}
                data-testid="button-show-email-form"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email Invite
              </Button>
            </div>
          ) : (
            <div className="space-y-3 pt-2 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Send Invitation Email
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="recipient-email" className="text-sm">
                  Recipient Email *
                </Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="participant@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  disabled={isSendingEmail}
                  data-testid="input-recipient-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-name" className="text-sm">
                  Recipient Name (Optional)
                </Label>
                <Input
                  id="recipient-name"
                  type="text"
                  placeholder="John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  disabled={isSendingEmail}
                  data-testid="input-recipient-name"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendEmailInvite}
                  disabled={isSendingEmail || !recipientEmail}
                  className="flex-1"
                  data-testid="button-send-email-invite"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invite
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEmailForm(false);
                    setRecipientEmail("");
                    setRecipientName("");
                  }}
                  disabled={isSendingEmail}
                  data-testid="button-cancel-email-form"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              How to invite participants:
            </h4>
            <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Copy the link or room code above</li>
              <li>Send it via email, text, or messaging app</li>
              <li>Participants click the link or enter the code</li>
              <li>They join instantly - no account needed!</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
