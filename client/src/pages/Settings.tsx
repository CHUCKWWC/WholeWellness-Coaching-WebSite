import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DigestPreferencesSettings from "@/components/DigestPreferencesSettings";
import { Bell, User, Shield, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Please log in to access settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and notifications
          </p>
        </div>

        <Tabs defaultValue="notifications" className="w-full" data-testid="settings-tabs">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid" data-testid="tabs-list">
            <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2" data-testid="tab-privacy">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2" data-testid="tab-appearance">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6" data-testid="content-notifications">
            <DigestPreferencesSettings />
          </TabsContent>

          <TabsContent value="profile" className="mt-6" data-testid="content-profile">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                <p className="text-muted-foreground">Profile settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-6" data-testid="content-privacy">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <p className="text-muted-foreground">Privacy settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6" data-testid="content-appearance">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                <p className="text-muted-foreground">Theme and appearance settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
