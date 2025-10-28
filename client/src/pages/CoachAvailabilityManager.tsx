import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.coerce.number().min(15, 'Minimum duration is 15 minutes'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  categoryId: z.string().optional(),
  minNoticeHours: z.coerce.number().min(0).default(24),
  maxAdvanceBookingDays: z.coerce.number().min(1).default(90),
});

const scheduleSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
});

const blockedTimeSchema = z.object({
  startDateTime: z.string(),
  endDateTime: z.string(),
  reason: z.string().min(1, 'Reason is required'),
  isAllDay: z.boolean().default(true),
});

type ServiceForm = z.infer<typeof serviceSchema>;
type ScheduleForm = z.infer<typeof scheduleSchema>;
type BlockedTimeForm = z.infer<typeof blockedTimeSchema>;

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CoachAvailabilityManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<any>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/booking/categories'],
  });

  const { data: myServices = [] } = useQuery({
    queryKey: ['/api/booking/services', user?.id],
    queryFn: async () => {
      const data = await apiRequest('GET', `/api/booking/services?coachId=${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: schedule = [] } = useQuery({
    queryKey: ['/api/booking/schedule', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/booking/schedule/${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: blockedTimes = [] } = useQuery({
    queryKey: ['/api/booking/blocked-times', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/booking/blocked-times/${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch blocked times');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const serviceForm = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 60,
      price: 0,
      categoryId: '',
      minNoticeHours: 24,
      maxAdvanceBookingDays: 90,
    },
  });

  const scheduleForm = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
    },
  });

  const blockedTimeForm = useForm<BlockedTimeForm>({
    resolver: zodResolver(blockedTimeSchema),
    defaultValues: {
      startDateTime: '',
      endDateTime: '',
      reason: '',
      isAllDay: true,
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      return await apiRequest('POST', '/api/booking/services', {
        ...data,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast({ title: 'Service created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/services', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/services'] });
      serviceForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create service', description: error.message, variant: 'destructive' });
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: ScheduleForm) => {
      return await apiRequest('POST', '/api/booking/schedule', {
        ...data,
        isActive: true,
      });
    },
    onSuccess: () => {
      toast({ title: 'Schedule added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/schedule', user?.id] });
      scheduleForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add schedule', description: error.message, variant: 'destructive' });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/booking/schedule/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Schedule entry deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/schedule', user?.id] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete schedule', description: error.message, variant: 'destructive' });
    },
  });

  const createBlockedTimeMutation = useMutation({
    mutationFn: async (data: BlockedTimeForm) => {
      return await apiRequest('POST', '/api/booking/blocked-times', data);
    },
    onSuccess: () => {
      toast({ title: 'Blocked time added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/blocked-times', user?.id] });
      blockedTimeForm.reset();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add blocked time', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBlockedTimeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/booking/blocked-times/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Blocked time removed' });
      queryClient.invalidateQueries({ queryKey: ['/api/booking/blocked-times', user?.id] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to remove blocked time', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Availability Management</h1>
        <p className="text-muted-foreground">Manage your services, schedule, and blocked times</p>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Times</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Service</CardTitle>
              <CardDescription>Add a bookable service for clients to schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit((data) => createServiceMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={serviceForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Career Coaching Session" {...field} className="min-h-[48px]" data-testid="input-service-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={serviceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your service..." {...field} data-testid="input-service-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={serviceForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="60" {...field} className="min-h-[48px]" data-testid="input-service-duration" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={serviceForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} className="min-h-[48px]" data-testid="input-service-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={serviceForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="min-h-[48px]" data-testid="select-service-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={serviceForm.control}
                      name="minNoticeHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Notice (hours)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="min-h-[48px]" data-testid="input-min-notice" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={serviceForm.control}
                      name="maxAdvanceBookingDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Advance Booking (days)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="min-h-[48px]" data-testid="input-max-advance" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={createServiceMutation.isPending} className="min-h-[48px]" data-testid="button-create-service">
                    <Plus className="w-4 h-4 mr-2" />
                    {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Services</h3>
            {myServices.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No services created yet. Create your first service above!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myServices.map((service: any) => (
                  <Card key={service.id} data-testid={`card-my-service-${service.id}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{service.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-semibold">${service.price}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Weekly Availability</CardTitle>
              <CardDescription>Set your recurring weekly schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...scheduleForm}>
                <form onSubmit={scheduleForm.handleSubmit((data) => createScheduleMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={scheduleForm.control}
                    name="dayOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger className="min-h-[48px]" data-testid="select-day-of-week">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day, index) => (
                              <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={scheduleForm.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time (HH:MM)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="min-h-[48px]" data-testid="input-start-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={scheduleForm.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time (HH:MM)</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="min-h-[48px]" data-testid="input-end-time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={createScheduleMutation.isPending} className="min-h-[48px]" data-testid="button-add-schedule">
                    <Plus className="w-4 h-4 mr-2" />
                    {createScheduleMutation.isPending ? 'Adding...' : 'Add Schedule'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Weekly Schedule</h3>
            {schedule.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No schedule set. Add your availability above!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {schedule.map((entry: any) => (
                  <Card key={entry.id} data-testid={`card-schedule-${entry.id}`}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{DAYS_OF_WEEK[entry.dayOfWeek]}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.startTime} - {entry.endTime}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScheduleMutation.mutate(entry.id)}
                          className="min-h-[48px]"
                          data-testid={`button-delete-schedule-${entry.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block Time Off</CardTitle>
              <CardDescription>Block specific dates when you're unavailable</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...blockedTimeForm}>
                <form onSubmit={blockedTimeForm.handleSubmit((data) => createBlockedTimeMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={blockedTimeForm.control}
                      name="startDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} className="min-h-[48px]" data-testid="input-blocked-start" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={blockedTimeForm.control}
                      name="endDateTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} className="min-h-[48px]" data-testid="input-blocked-end" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={blockedTimeForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Vacation, Conference" {...field} className="min-h-[48px]" data-testid="input-blocked-reason" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createBlockedTimeMutation.isPending} className="min-h-[48px]" data-testid="button-add-blocked-time">
                    <Plus className="w-4 h-4 mr-2" />
                    {createBlockedTimeMutation.isPending ? 'Adding...' : 'Block Time'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Blocked Times</h3>
            {blockedTimes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No blocked times. Add blocked times above!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {blockedTimes.map((blocked: any) => (
                  <Card key={blocked.id} data-testid={`card-blocked-time-${blocked.id}`}>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{blocked.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(blocked.startDateTime), 'MMM d, yyyy h:mm a')} - {format(new Date(blocked.endDateTime), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBlockedTimeMutation.mutate(blocked.id)}
                          className="min-h-[48px]"
                          data-testid={`button-delete-blocked-${blocked.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
