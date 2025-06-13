import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Save, Image, FileText, Settings, Navigation } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Form schemas
const contentPageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
  pageType: z.enum(["page", "post", "service"]).default("page"),
});

const mediaSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  url: z.string().url("Valid URL is required"),
  altText: z.string().optional(),
  category: z.enum(["image", "document", "video"]).default("image"),
});

const siteSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  category: z.string().default("general"),
  description: z.string().optional(),
});

type ContentPageForm = z.infer<typeof contentPageSchema>;
type MediaForm = z.infer<typeof mediaSchema>;
type SiteSettingForm = z.infer<typeof siteSettingSchema>;

export default function CMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<any>(null);
  const [editingSetting, setEditingSetting] = useState<any>(null);

  // Queries
  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/cms/pages"],
  });

  const { data: media = [], isLoading: mediaLoading } = useQuery({
    queryKey: ["/api/cms/media"],
  });

  const { data: settings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/cms/settings"],
  });

  // Forms
  const pageForm = useForm<ContentPageForm>({
    resolver: zodResolver(contentPageSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      metaTitle: "",
      metaDescription: "",
      isPublished: false,
      pageType: "page",
    },
  });

  const mediaForm = useForm<MediaForm>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      fileName: "",
      url: "",
      altText: "",
      category: "image",
    },
  });

  const settingForm = useForm<SiteSettingForm>({
    resolver: zodResolver(siteSettingSchema),
    defaultValues: {
      key: "",
      value: "",
      category: "general",
      description: "",
    },
  });

  // Mutations
  const createPageMutation = useMutation({
    mutationFn: async (data: ContentPageForm) => {
      const response = await fetch("/api/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create page");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      pageForm.reset();
      toast({ title: "Success", description: "Page created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create page", variant: "destructive" });
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ContentPageForm> }) => {
      const response = await fetch(`/api/cms/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update page");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      setEditingPage(null);
      toast({ title: "Success", description: "Page updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update page", variant: "destructive" });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cms/pages/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete page");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Success", description: "Page deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete page", variant: "destructive" });
    },
  });

  const createMediaMutation = useMutation({
    mutationFn: async (data: MediaForm) => {
      const response = await fetch("/api/cms/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create media");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      mediaForm.reset();
      toast({ title: "Success", description: "Media item added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add media item", variant: "destructive" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async (data: SiteSettingForm) => {
      const response = await fetch(`/api/cms/settings/${data.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update setting");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/settings"] });
      setEditingSetting(null);
      settingForm.reset();
      toast({ title: "Success", description: "Setting updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update setting", variant: "destructive" });
    },
  });

  const onPageSubmit = (data: ContentPageForm) => {
    if (editingPage) {
      updatePageMutation.mutate({ id: editingPage.id, data });
    } else {
      createPageMutation.mutate(data);
    }
  };

  const onMediaSubmit = (data: MediaForm) => {
    createMediaMutation.mutate(data);
  };

  const onSettingSubmit = (data: SiteSettingForm) => {
    updateSettingMutation.mutate(data);
  };

  const startEditingPage = (page: any) => {
    setEditingPage(page);
    pageForm.reset({
      title: page.title,
      slug: page.slug,
      content: page.content || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished,
      pageType: page.pageType,
    });
  };

  const startEditingSetting = (setting: any) => {
    setEditingSetting(setting);
    settingForm.reset({
      key: setting.key,
      value: setting.value,
      category: setting.category || "general",
      description: setting.description || "",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Management System</h1>
        <p className="text-muted-foreground">Manage your website content, media, and settings</p>
      </div>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Navigation
          </TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Content Pages</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPage(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
                  <DialogDescription>
                    {editingPage ? "Update the page details below." : "Fill in the details to create a new page."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...pageForm}>
                  <form onSubmit={pageForm.handleSubmit(onPageSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={pageForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pageForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={pageForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={6} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={pageForm.control}
                        name="metaTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pageForm.control}
                        name="pageType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Page Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select page type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="page">Page</SelectItem>
                                <SelectItem value="post">Post</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={pageForm.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pageForm.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Published</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Make this page visible to visitors
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createPageMutation.isPending || updatePageMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingPage ? "Update Page" : "Create Page"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {pagesLoading ? (
            <div>Loading pages...</div>
          ) : (
            <div className="grid gap-4">
              {pages.map((page: any) => (
                <Card key={page.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{page.title}</CardTitle>
                      <CardDescription>/{page.slug}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.isPublished ? "default" : "secondary"}>
                        {page.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{page.pageType}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingPage(page)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePageMutation.mutate(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {page.metaDescription || "No description"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Media Library</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Media Item</DialogTitle>
                  <DialogDescription>
                    Add a new media item to your library.
                  </DialogDescription>
                </DialogHeader>
                <Form {...mediaForm}>
                  <form onSubmit={mediaForm.handleSubmit(onMediaSubmit)} className="space-y-4">
                    <FormField
                      control={mediaForm.control}
                      name="fileName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mediaForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input {...field} type="url" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mediaForm.control}
                      name="altText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mediaForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={createMediaMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Add Media
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {mediaLoading ? (
            <div>Loading media...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item: any) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.fileName}</CardTitle>
                    <Badge variant="outline">{item.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    {item.category === 'image' && (
                      <img 
                        src={item.url} 
                        alt={item.altText || item.fileName}
                        className="w-full h-32 object-cover rounded"
                      />
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {item.altText || "No description"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Site Settings</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingSetting(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Setting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSetting ? "Edit Setting" : "Create New Setting"}</DialogTitle>
                  <DialogDescription>
                    {editingSetting ? "Update the setting below." : "Add a new site setting."}
                  </DialogDescription>
                </DialogHeader>
                <Form {...settingForm}>
                  <form onSubmit={settingForm.handleSubmit(onSettingSubmit)} className="space-y-4">
                    <FormField
                      control={settingForm.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!!editingSetting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={updateSettingMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingSetting ? "Update Setting" : "Create Setting"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {settingsLoading ? (
            <div>Loading settings...</div>
          ) : (
            <div className="grid gap-4">
              {settings.map((setting: any) => (
                <Card key={setting.key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{setting.key}</CardTitle>
                      <CardDescription>{setting.category}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditingSetting(setting)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{setting.value}</p>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground mt-2">{setting.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Navigation Tab */}
        <TabsContent value="navigation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Navigation Menus</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Navigation management coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}