import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FolderSync, ExternalLink, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WixBooking() {
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleUrl, setScheduleUrl] = useState("");
  const [wixApiKey, setWixApiKey] = useState("");
  const { toast } = useToast();

  const { data: coach } = useQuery({
    queryKey: ['/api/coaches/1'],
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/coaches/1/sessions'],
  });

  const updateWixSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/coaches/1', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1'] });
      setIsEditing(false);
      toast({
        title: "Wix settings updated",
        description: "Your booking settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update Wix settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const syncBookingsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/wix/sync-bookings', {
        coachId: 1,
        wixApiKey: coach?.wixApiKey || process.env.WIX_API_KEY,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/coaches/1/sessions'] });
      toast({
        title: "Bookings synced",
        description: `Successfully synced ${data.count} bookings from Wix.`,
      });
    },
    onError: () => {
      toast({
        title: "FolderSync failed",
        description: "Failed to sync bookings from Wix. Check your API key.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    updateWixSettingsMutation.mutate({
      scheduleUrl,
      wixApiKey,
    });
  };

  const handleStartEdit = () => {
    setScheduleUrl(coach?.scheduleUrl || "");
    setWixApiKey(coach?.wixApiKey || "");
    setIsEditing(true);
  };

  const sessionTypes = [
    { name: "Initial Consultation", duration: "60 minutes", price: "$150" },
    { name: "Follow-up Session", duration: "45 minutes", price: "$120" },
    { name: "Group Session", duration: "90 minutes", price: "$200" },
  ];

  return (
    <Card className="wellness-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Wix Booking Integration</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => syncBookingsMutation.mutate()}
              disabled={syncBookingsMutation.isPending}
              className="text-[var(--wellness-teal)] border-[var(--wellness-teal)]"
            >
              <FolderSync className="w-4 h-4 mr-2" />
              {syncBookingsMutation.isPending ? "Syncing..." : "FolderSync Bookings"}
            </Button>
            <Button
              variant="outline"
              onClick={isEditing ? () => setIsEditing(false) : handleStartEdit}
              className="text-[var(--wellness-teal)] border-[var(--wellness-teal)]"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Settings"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Wix Configuration */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-4">Booking Settings</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduleUrl">Wix Booking URL</Label>
                <Input
                  id="scheduleUrl"
                  value={isEditing ? scheduleUrl : coach?.scheduleUrl || ""}
                  onChange={(e) => setScheduleUrl(e.target.value)}
                  placeholder="https://your-site.wixsite.com/booking"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : "wellness-input"}
                />
              </div>
              
              <div>
                <Label htmlFor="wixApiKey">Wix API Key (Optional)</Label>
                <Input
                  id="wixApiKey"
                  type="password"
                  value={isEditing ? wixApiKey : coach?.wixApiKey ? "••••••••" : ""}
                  onChange={(e) => setWixApiKey(e.target.value)}
                  placeholder="Enter your Wix API key for advanced features"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : "wellness-input"}
                />
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveSettings}
                    className="btn-primary"
                    disabled={updateWixSettingsMutation.isPending}
                  >
                    {updateWixSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="pt-4">
                <h5 className="font-medium text-gray-700 mb-3">Session Types</h5>
                <div className="space-y-2">
                  {sessionTypes.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-700">{type.name}</span>
                        <p className="text-sm text-gray-500">{type.duration} - {type.price}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Booking Widget Preview */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-4">Booking Widget Preview</h4>
            {coach?.scheduleUrl ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
                  <span className="text-sm text-gray-600">Booking Widget</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(coach.scheduleUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <iframe
                  src={coach.scheduleUrl}
                  className="w-full h-96 border-0"
                  title="Wix Booking Widget"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-[var(--wellness-teal)] mx-auto mb-4" />
                <h5 className="font-medium text-gray-700 mb-2">Connect Your Wix Booking</h5>
                <p className="text-gray-500 text-sm mb-4">
                  Add your Wix booking URL to display the booking widget here
                </p>
                <Button
                  className="btn-primary"
                  onClick={handleStartEdit}
                >
                  Add Booking URL
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Recent Bookings</h4>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">{session.clientName || "Client"}</p>
                    <p className="text-sm text-gray-500">{session.sessionType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--wellness-teal)]">
                      {new Date(session.scheduledAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">{session.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No recent bookings</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
