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
import { Copy, Check, Mail, Link2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const handleEmailInvite = () => {
    const subject = encodeURIComponent(`Join: ${sessionTitle}`);
    const body = encodeURIComponent(
      `You're invited to join a video coaching session!\n\n` +
      `Session: ${sessionTitle}\n\n` +
      `Join instantly by clicking this link:\n${shareableLink}\n\n` +
      `Or enter this room code: ${roomCode}\n` +
      `at ${baseUrl}/join\n\n` +
      `See you there!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
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

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleEmailInvite}
              data-testid="button-email-invite"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Invite
            </Button>
          </div>

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
