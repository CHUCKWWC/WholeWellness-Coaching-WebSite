import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Clock, Calendar, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? "12:00 AM" : i < 12 ? `${i}:00 AM` : i === 12 ? "12:00 PM" : `${i - 12}:00 PM`
}));

export default function DigestPreferencesSettings() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['/api/digest/preferences'],
    enabled: !!user,
  });

  // Local state for form
  const [frequency, setFrequency] = useState(preferences?.frequency || "weekly");
  const [preferredDay, setPreferredDay] = useState(preferences?.preferredDay || "monday");
  const [preferredHour, setPreferredHour] = useState(preferences?.preferredHour || 9);
  const [timezone, setTimezone] = useState(preferences?.timezone || "America/New_York");
  const [emailEnabled, setEmailEnabled] = useState(preferences?.emailEnabled ?? true);
  const [includeActionItems, setIncludeActionItems] = useState(preferences?.includeActionItems ?? true);
  const [includeInsights, setIncludeInsights] = useState(preferences?.includeInsights ?? true);
  const [includeProgress, setIncludeProgress] = useState(preferences?.includeProgress ?? true);

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      setFrequency(preferences.frequency);
      setPreferredDay(preferences.preferredDay || "monday");
      setPreferredHour(preferences.preferredHour || 9);
      setTimezone(preferences.timezone);
      setEmailEnabled(preferences.emailEnabled ?? true);
      setIncludeActionItems(preferences.includeActionItems ?? true);
      setIncludeInsights(preferences.includeInsights ?? true);
      setIncludeProgress(preferences.includeProgress ?? true);
    }
  }, [preferences]);

  // Save preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/digest/preferences', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/digest/preferences'] });
      toast({
        title: "Preferences saved",
        description: "Your digest preferences have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving preferences",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      frequency,
      preferredDay,
      preferredHour,
      timezone,
      emailEnabled,
      includeActionItems,
      includeInsights,
      includeProgress,
    });
  };

  if (isLoading) {
    return (
      <Card data-testid="digest-settings-loading">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="digest-settings-card" className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-teal-600" />
          <CardTitle className="text-lg sm:text-xl">Email Digest Preferences</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Get personalized summaries of your coaching conversations with action items and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        {/* Email Enable/Disable */}
        <div className="flex items-center justify-between rounded-lg border p-3 sm:p-4" data-testid="email-enabled-toggle">
          <div className="flex items-center gap-2 sm:gap-3">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 flex-shrink-0" />
            <div>
              <Label className="text-sm sm:text-base font-medium">Email Digests</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">Receive digest emails</p>
            </div>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
            data-testid="switch-email-enabled"
          />
        </div>

        {emailEnabled && (
          <>
            {/* Frequency */}
            <div className="space-y-2" data-testid="frequency-select">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600" />
                Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger data-testid="select-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(freq => (
                    <SelectItem key={freq.value} value={freq.value} data-testid={`option-frequency-${freq.value}`}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Day (for weekly/biweekly/monthly) */}
            {(frequency === "weekly" || frequency === "biweekly" || frequency === "monthly") && (
              <div className="space-y-2" data-testid="day-select">
                <Label>Preferred Day</Label>
                <Select value={preferredDay} onValueChange={setPreferredDay}>
                  <SelectTrigger data-testid="select-day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value} data-testid={`option-day-${day.value}`}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preferred Time */}
            <div className="space-y-2" data-testid="time-select">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600" />
                Preferred Time
              </Label>
              <Select value={preferredHour.toString()} onValueChange={(val) => setPreferredHour(parseInt(val))}>
                <SelectTrigger data-testid="select-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map(hour => (
                    <SelectItem key={hour.value} value={hour.value.toString()} data-testid={`option-time-${hour.value}`}>
                      {hour.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div className="space-y-2" data-testid="timezone-select">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value} data-testid={`option-timezone-${tz.value}`}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content Options */}
            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Include in Digest</h4>
              
              <div className="flex items-center justify-between" data-testid="action-items-toggle">
                <Label className="text-sm font-normal">Action Items</Label>
                <Switch
                  checked={includeActionItems}
                  onCheckedChange={setIncludeActionItems}
                  data-testid="switch-action-items"
                />
              </div>

              <div className="flex items-center justify-between" data-testid="insights-toggle">
                <Label className="text-sm font-normal">AI Insights & Progress</Label>
                <Switch
                  checked={includeInsights}
                  onCheckedChange={setIncludeInsights}
                  data-testid="switch-insights"
                />
              </div>

              <div className="flex items-center justify-between" data-testid="progress-toggle">
                <Label className="text-sm font-normal">Progress Summary</Label>
                <Switch
                  checked={includeProgress}
                  onCheckedChange={setIncludeProgress}
                  data-testid="switch-progress"
                />
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={saveMutation.isPending}
          data-testid="button-save-preferences"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
