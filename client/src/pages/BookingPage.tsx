import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, CheckCircle, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { format, addDays, setHours, setMinutes, startOfDay, isBefore, isAfter, parseISO } from 'date-fns';

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  selectedDate: z.string().min(1, 'Please select a date'),
  selectedTime: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface BookingService {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  categoryId: string;
  coachId: string;
  isActive: boolean;
}

interface BookingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface CoachSchedule {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface CoachBlockedTime {
  id: string;
  coachId: string;
  startDateTime: string;
  endDateTime: string;
  reason: string;
}

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<BookingService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      selectedDate: '',
      selectedTime: '',
      notes: '',
    },
  });

  const { data: categories = [] } = useQuery<BookingCategory[]>({
    queryKey: ['/api/booking/categories'],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<BookingService[]>({
    queryKey: ['/api/booking/services'],
  });

  const { data: schedule = [] } = useQuery<CoachSchedule[]>({
    queryKey: ['/api/booking/schedule', selectedService?.coachId],
    queryFn: async () => {
      if (!selectedService?.coachId) return [];
      const response = await fetch(`/api/booking/schedule/${selectedService.coachId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch schedule');
      return response.json();
    },
    enabled: !!selectedService?.coachId,
  });

  const { data: blockedTimes = [] } = useQuery<CoachBlockedTime[]>({
    queryKey: ['/api/booking/blocked-times', selectedService?.coachId],
    queryFn: async () => {
      if (!selectedService?.coachId) return [];
      const response = await fetch(`/api/booking/blocked-times/${selectedService.coachId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch blocked times');
      return response.json();
    },
    enabled: !!selectedService?.coachId,
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingForm) => {
      if (!selectedService) throw new Error('No service selected');

      const startDateTime = new Date(bookingData.selectedTime);
      const endDateTime = new Date(startDateTime.getTime() + selectedService.duration * 60000);

      return await apiRequest('POST', '/api/booking/appointments', {
        serviceId: bookingData.serviceId,
        coachId: selectedService.coachId,
        clientFirstName: bookingData.firstName,
        clientLastName: bookingData.lastName,
        clientEmail: bookingData.email,
        clientPhone: bookingData.phone,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        price: selectedService.price,
        notes: bookingData.notes,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Booking Created Successfully!',
        description: 'Your appointment has been scheduled. You will receive a confirmation email shortly.',
      });
      form.reset();
      setStep(1);
      setSelectedService(null);
      setSelectedDate('');
    },
    onError: (error: any) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const generateAvailableSlots = (date: string): string[] => {
    if (!selectedService || !schedule.length) return [];

    const selectedDay = new Date(date);
    const dayOfWeek = selectedDay.getDay();

    const daySchedule = schedule.filter(s => s.dayOfWeek === dayOfWeek && s.isActive);
    if (!daySchedule.length) return [];

    const slots: string[] = [];

    daySchedule.forEach(sched => {
      const [startHour, startMin] = sched.startTime.split(':').map(Number);
      const [endHour, endMin] = sched.endTime.split(':').map(Number);

      let currentSlot = setMinutes(setHours(selectedDay, startHour), startMin);
      const endTime = setMinutes(setHours(selectedDay, endHour), endMin);

      while (currentSlot.getTime() + selectedService.duration * 60000 <= endTime.getTime()) {
        const isBlocked = blockedTimes.some(blocked => {
          const blockedStart = new Date(blocked.startDateTime);
          const blockedEnd = new Date(blocked.endDateTime);
          return currentSlot >= blockedStart && currentSlot < blockedEnd;
        });

        if (!isBlocked && isAfter(currentSlot, new Date())) {
          slots.push(currentSlot.toISOString());
        }

        currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
      }
    });

    return slots;
  };

  const availableSlots = selectedDate ? generateAvailableSlots(selectedDate) : [];

  const handleServiceSelect = (service: BookingService) => {
    setSelectedService(service);
    form.setValue('serviceId', service.id);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    form.setValue('selectedDate', date);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    form.setValue('selectedTime', time);
    setStep(4);
  };

  const onSubmit = (data: BookingForm) => {
    createBookingMutation.mutate(data);
  };

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  if (servicesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book Your Appointment</h1>
        <p className="text-muted-foreground">Schedule a session with our professional coaches.</p>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {[
            { step: 1, label: 'Select Service' },
            { step: 2, label: 'Choose Date' },
            { step: 3, label: 'Pick Time' },
            { step: 4, label: 'Your Details' },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center flex-1">
              <div className="flex items-center flex-1">
                <div className={`min-w-[2rem] h-8 rounded-full flex items-center justify-center ${
                  step >= item.step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step > item.step ? <CheckCircle className="w-4 h-4" /> : item.step}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= item.step ? 'font-medium' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </div>
              {index < 3 && <div className="hidden sm:block flex-1 mx-4 h-0.5 bg-muted"></div>}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.filter(s => s.isActive).map((service) => {
              const category = categories.find(c => c.id === service.categoryId);
              return (
                <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow" data-testid={`card-service-${service.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <CardDescription className="mt-1">{service.description}</CardDescription>
                      </div>
                      {category && <Badge variant="secondary">{category.name}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{service.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-semibold">${service.price}</span>
                        </div>
                      </div>
                      <Button onClick={() => handleServiceSelect(service)} className="min-h-[48px]" data-testid={`button-select-service-${service.id}`}>
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && selectedService && (
        <div>
          <Button variant="ghost" onClick={() => setStep(1)} className="mb-4 min-h-[48px]" data-testid="button-back-to-services">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Button>
          <h2 className="text-xl font-semibold mb-4">Choose Date</h2>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Selected Service: {selectedService.name}</CardTitle>
              <CardDescription>Duration: {selectedService.duration} minutes | Price: ${selectedService.price}</CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? 'default' : 'outline'}
                onClick={() => handleDateSelect(date)}
                className="flex-col h-auto py-3 min-h-[48px]"
                data-testid={`button-select-date-${date}`}
              >
                <CalendarIcon className="w-4 h-4 mb-1" />
                <span className="text-sm font-medium">
                  {format(new Date(date), 'MMM d')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(date), 'EEE')}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && selectedDate && (
        <div>
          <Button variant="ghost" onClick={() => setStep(2)} className="mb-4 min-h-[48px]" data-testid="button-back-to-dates">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dates
          </Button>
          <h2 className="text-xl font-semibold mb-4">Pick Time</h2>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedService?.name} - {format(new Date(selectedDate), 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
          </Card>

          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant="outline"
                  onClick={() => handleTimeSelect(slot)}
                  className="flex items-center justify-center gap-2 h-auto py-3 min-h-[48px]"
                  data-testid={`button-select-time-${slot}`}
                >
                  <Clock className="w-4 h-4" />
                  {format(new Date(slot), 'h:mm a')}
                </Button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No available time slots for this date. Please select a different date.</p>
                <Button variant="outline" onClick={() => setStep(2)} className="mt-4 min-h-[48px]" data-testid="button-choose-different-date">
                  Choose Different Date
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <Button variant="ghost" onClick={() => setStep(3)} className="mb-4 min-h-[48px]" data-testid="button-back-to-times">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Times
          </Button>
          <h2 className="text-xl font-semibold mb-4">Your Details</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span className="font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{format(new Date(selectedDate), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {form.watch('selectedTime') && format(new Date(form.watch('selectedTime')), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{selectedService?.duration} minutes</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold text-lg">${selectedService?.price}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} className="min-h-[48px]" data-testid="input-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} className="min-h-[48px]" data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="min-h-[48px]" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} className="min-h-[48px]" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific topics or concerns you'd like to discuss..." 
                            className="min-h-[100px]"
                            {...field}
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={createBookingMutation.isPending}
                  className="flex-1 min-h-[48px]"
                  data-testid="button-book-appointment"
                >
                  {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
