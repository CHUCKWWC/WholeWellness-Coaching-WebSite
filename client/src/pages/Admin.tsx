import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Users, DollarSign, Calendar, Settings, Sync, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WixService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive?: boolean;
}

interface WixUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  membershipLevel: 'free' | 'paid';
  profileImage?: string;
}

export default function Admin() {
  const { toast } = useToast();
  const [syncLoading, setSyncLoading] = useState(false);

  // Fetch Wix services
  const { data: wixServices = [], isLoading: servicesLoading, refetch: refetchServices } = useQuery<WixService[]>({
    queryKey: ["/api/wix/services"],
    retry: false,
  });

  // Mock data for demonstration (will be replaced by actual Wix data)
  const mockUsers: WixUser[] = [
    { _id: '1', email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Johnson', membershipLevel: 'paid' },
    { _id: '2', email: 'mike@example.com', firstName: 'Mike', lastName: 'Davis', membershipLevel: 'free' },
    { _id: '3', email: 'lisa@example.com', firstName: 'Lisa', lastName: 'Wilson', membershipLevel: 'paid' },
  ];

  const handleSyncData = async (type: 'users' | 'services') => {
    setSyncLoading(true);
    try {
      const response = await fetch(`/api/wix/sync/${type}`);
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message,
        });
        if (type === 'services') {
          refetchServices();
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Please check your Wix API credentials",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Whole Wellness Coaching platform</p>
        </div>
        <Button 
          onClick={() => window.open('https://manage.wix.com', '_blank')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Wix Admin
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockUsers.filter(u => u.membershipLevel === 'paid').length} paid members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wixServices.length}</div>
            <p className="text-xs text-muted-foreground">
              Services managed via Wix
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              New bookings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Chat Usage</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Sessions this week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Member Management</TabsTrigger>
          <TabsTrigger value="services">Services & Pricing</TabsTrigger>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Member Management</CardTitle>
              <Button 
                onClick={() => handleSyncData('users')}
                disabled={syncLoading}
                variant="outline"
              >
                <Sync className="h-4 w-4 mr-2" />
                Sync from Wix
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Membership</TableHead>
                    <TableHead>AI Access</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.membershipLevel === 'paid' ? 'default' : 'secondary'}>
                          {user.membershipLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.membershipLevel === 'paid' ? '✅ Enabled' : '❌ Disabled'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit in Wix
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services & Pricing</CardTitle>
              <Button 
                onClick={() => handleSyncData('services')}
                disabled={syncLoading}
                variant="outline"
              >
                <Sync className="h-4 w-4 mr-2" />
                Sync from Wix
              </Button>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <p>Loading services from Wix...</p>
              ) : wixServices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wixServices.map((service) => (
                      <TableRow key={service._id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>${service.price}</TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell>
                          <Badge variant={service.isActive !== false ? 'default' : 'secondary'}>
                            {service.isActive !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No services found. Set up your Wix integration first.</p>
                  <Button onClick={() => window.open('https://manage.wix.com', '_blank')}>
                    Configure in Wix
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <p className="text-sm text-gray-600">
                Manage website content through your Wix admin panel
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Hero Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Edit main page headline and description
                    </p>
                    <Button variant="outline" className="w-full">
                      Edit in Wix CMS
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Add and manage client testimonials
                    </p>
                    <Button variant="outline" className="w-full">
                      Manage Testimonials
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About Section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Update your story and qualifications
                    </p>
                    <Button variant="outline" className="w-full">
                      Edit Content
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload and organize coaching resources
                    </p>
                    <Button variant="outline" className="w-full">
                      Manage Resources
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wix Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wix-site-id">Wix Site ID</Label>
                  <Input 
                    id="wix-site-id" 
                    placeholder="Enter your Wix Site ID"
                    type="password"
                  />
                </div>
                
                <div>
                  <Label htmlFor="wix-api-key">Wix API Key</Label>
                  <Input 
                    id="wix-api-key" 
                    placeholder="Enter your Wix API Key"
                    type="password"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-sync" />
                  <Label htmlFor="auto-sync">Enable automatic synchronization</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="webhook-notifications" />
                  <Label htmlFor="webhook-notifications">Enable webhook notifications</Label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="mr-2">Save Settings</Button>
                <Button variant="outline">Test Connection</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Create your Wix admin site following the setup guide</li>
                <li>Configure database collections for members, services, and content</li>
                <li>Generate API credentials in Wix Developer Tools</li>
                <li>Add your API credentials to the settings above</li>
                <li>Test the connection and sync your data</li>
              </ol>
              <Button variant="link" className="mt-4 p-0">
                View Complete Setup Guide →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}