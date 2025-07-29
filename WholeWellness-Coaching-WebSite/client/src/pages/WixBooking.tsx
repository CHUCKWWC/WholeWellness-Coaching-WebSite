import React, { useState, useEffect } from 'react';
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Phone, Mail, MessageCircle, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

// Booking form schema
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

interface WixService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface WixBooking {
  _id: string;
  serviceId: string;
  userId: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

interface TimeSlot {
  startDateTime: string;
  endDateTime: string;
  duration: number;
  available: boolean;
}

export default function WixBooking() {
  const [selectedService, setSelectedService] = useState<WixService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
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

  // Fetch Wix services
  const { data: services = [], isLoading: servicesLoading } = useQuery<WixService[]>({
    queryKey: ['/api/wix/services'],
    retry: false,
  });

  // Fetch user's bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<WixBooking[]>({
    queryKey: ['/api/wix/bookings'],
    retry: false,
  });

  // Fetch available time slots
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ['/api/wix/services', selectedService?._id, 'slots', selectedDate],
    enabled: !!selectedService && !!selectedDate,
    retry: false,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingForm) => {
      const selectedSlot = timeSlots.find(slot => 
        slot.startDateTime === bookingData.selectedTime
      );
      
      if (!selectedSlot) {
        throw new Error('Selected time slot is no longer available');
      }

      const response = await apiRequest('/api/wix/bookings', 'POST', {
        serviceId: bookingData.serviceId,
        userId: 'temp-user-id', // Will be replaced with actual user ID
        contactDetails: {
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          phone: bookingData.phone,
        },
        slot: {
          startDateTime: selectedSlot.startDateTime,
          endDateTime: selectedSlot.endDateTime,
        },
        notes: bookingData.notes,
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Created Successfully!',
        description: 'Your appointment has been scheduled. You will receive a confirmation email shortly.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wix/bookings'] });
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

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiRequest(`/api/wix/bookings/${bookingId}`, 'DELETE');
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/wix/bookings'] });
    },
    onError: () => {
      toast({
        title: 'Cancellation Failed',
        description: 'There was an error cancelling your booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleServiceSelect = (service: WixService) => {
    setSelectedService(service);
    form.setValue('serviceId', service._id);
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

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return format(date, 'yyyy-MM-dd');
  });

  if (servicesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
        <p className="text-gray-600">Schedule a session with our professional coaches through our Wix booking system.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Select Service' },
            { step: 2, label: 'Choose Date' },
            { step: 3, label: 'Pick Time' },
            { step: 4, label: 'Your Details' },
          ].map((item, index) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= item.step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > item.step ? <CheckCircle className="w-4 h-4" /> : item.step}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= item.step ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </div>
              {index < 3 && <div className="flex-1 mx-4 h-0.5 bg-gray-200"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card key={service._id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="mt-1">{service.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{service.category?.name || service.category || 'General'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{service.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-semibold">${service.price}</span>
                      </div>
                    </div>
                    <Button onClick={() => handleServiceSelect(service)}>
                      Select Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose Date */}
      {step === 2 && selectedService && (
        <div>
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
                className="flex-col h-auto py-3"
              >
                <CalendarIcon className="w-4 h-4 mb-1" />
                <span className="text-sm font-medium">
                  {format(new Date(date), 'MMM d')}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(date), 'EEE')}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Pick Time */}
      {step === 3 && selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pick Time</h2>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedService?.name} - {format(new Date(selectedDate), 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
          </Card>

          {slotsLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.filter(slot => slot.available).map((slot) => (
                <Button
                  key={slot.startDateTime}
                  variant="outline"
                  onClick={() => handleTimeSelect(slot.startDateTime)}
                  className="flex items-center gap-2 h-auto py-3"
                >
                  <Clock className="w-4 h-4" />
                  {format(new Date(slot.startDateTime), 'h:mm a')}
                </Button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600">No available time slots for this date. Please select a different date.</p>
                <Button variant="outline" onClick={() => setStep(2)} className="mt-4">
                  Choose Different Date
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 4: Your Details */}
      {step === 4 && (
        <div>
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
                            <Input placeholder="John" {...field} />
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
                            <Input placeholder="Doe" {...field} />
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
                          <Input type="email" placeholder="john@example.com" {...field} />
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
                          <Input placeholder="(555) 123-4567" {...field} />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={createBookingMutation.isPending}
                  className="flex-1"
                >
                  {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Appointment'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Existing Bookings */}
      {!bookingsLoading && bookings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Your Upcoming Appointments</h2>
          <div className="space-y-4">
            {bookings.map((booking) => {
              const service = services.find(s => s._id === booking.serviceId);
              return (
                <Card key={booking._id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{service?.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format(new Date(booking.dateTime), 'MMMM d, yyyy')} at {format(new Date(booking.dateTime), 'h:mm a')}
                        </p>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelBookingMutation.mutate(booking._id)}
                        disabled={cancelBookingMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}