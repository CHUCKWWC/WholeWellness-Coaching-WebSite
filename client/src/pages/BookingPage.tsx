import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, ChevronsUpDown, Check, Video, ArrowLeft } from 'lucide-react';
import { format, addDays, parse } from 'date-fns';
import { Link } from 'wouter';

const bookingSchema = z.object({
  coachId: z.number().min(1, 'Please select a coach'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  selectedDate: z.date({ required_error: 'Please select a date' }),
  selectedTime: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  specializations?: string[];
}

interface AvailabilityResponse {
  availableSlots: string[];
}

interface BookingConfirmation {
  id: string;
  coachId: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  startDateTime: string;
  endDateTime: string;
  meetLink?: string;
}

export default function BookingPage() {
  const [coachOpen, setCoachOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);
  const { toast } = useToast();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      coachId: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      selectedTime: '',
      notes: '',
    },
  });

  const selectedCoachId = form.watch('coachId');
  const selectedDate = form.watch('selectedDate');

  const { data: coaches = [], isLoading: coachesLoading } = useQuery<Coach[]>({
    queryKey: ['/api/coaches'],
  });

  const { data: availabilityData } = useQuery<AvailabilityResponse>({
    queryKey: ['/api/booking/availability', selectedCoachId, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedCoachId || !selectedDate) return { availableSlots: [] };
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`/api/booking/availability?date=${dateStr}&coachId=${selectedCoachId}`, {
        credentials: 'include',
      });
      if (!response.ok) return { availableSlots: [] };
      return response.json();
    },
    enabled: !!selectedCoachId && !!selectedDate,
  });

  const availableSlots = availabilityData?.availableSlots || [];

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingForm) => {
      const timeSlot = bookingData.selectedTime;
      const dateStr = format(bookingData.selectedDate, 'yyyy-MM-dd');

      return await apiRequest('POST', '/api/bookings', {
        coachId: String(bookingData.coachId),
        fullName: `${bookingData.firstName} ${bookingData.lastName}`,
        email: bookingData.email,
        phone: bookingData.phone || '',
        coachingArea: 'Life Coaching',
        message: bookingData.notes || '',
        serviceType: 'individual',
        preferredDate: dateStr,
        preferredTime: timeSlot,
      });
    },
    onSuccess: (data) => {
      const timeSlot = form.getValues('selectedTime');
      const selectedDateValue = form.getValues('selectedDate');
      
      let startDateTime = new Date();
      if (selectedDateValue && timeSlot) {
        try {
          startDateTime = parse(timeSlot, 'hh:mm a', selectedDateValue);
        } catch {
          startDateTime = selectedDateValue;
        }
      }
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60000);

      setBookingConfirmation({
        id: String(data.id) || 'BOOKING-' + Date.now(),
        coachId: selectedCoachId,
        clientFirstName: form.getValues('firstName'),
        clientLastName: form.getValues('lastName'),
        clientEmail: form.getValues('email'),
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        meetLink: data.meetingUrl,
      });
      toast({
        title: 'Booking Created Successfully!',
        description: 'Your appointment has been confirmed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Booking Failed',
        description: error.message || 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const selectedCoach = coaches.find(c => c.id === selectedCoachId);

  const onSubmit = (data: BookingForm) => {
    createBookingMutation.mutate(data);
  };

  const disabledDays = [
    { before: addDays(new Date(), 1) },
    { after: addDays(new Date(), 60) },
  ];

  if (bookingConfirmation) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <Card className="border-green-200 dark:border-green-800" data-testid="booking-confirmation">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">Booking Confirmed!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your coaching session has been scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-3">Session Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Confirmation ID:</span>
                  <span className="font-mono text-sm font-medium text-right break-all max-w-[60%]" data-testid="confirmation-id">
                    {bookingConfirmation.id}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coach:</span>
                  <span className="font-medium">{selectedCoach?.firstName} {selectedCoach?.lastName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {format(new Date(bookingConfirmation.startDateTime), 'MMMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {format(new Date(bookingConfirmation.startDateTime), 'h:mm a')} - {format(new Date(bookingConfirmation.endDateTime), 'h:mm a')}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">60 minutes</span>
                </div>
              </div>
            </div>

            {bookingConfirmation.meetLink && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-300">Video Call Link</span>
                </div>
                <a 
                  href={bookingConfirmation.meetLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {bookingConfirmation.meetLink}
                </a>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              A confirmation email has been sent to {bookingConfirmation.clientEmail}
            </div>

            <div className="flex gap-4">
              <Link href="/member-portal" className="flex-1">
                <Button variant="outline" className="w-full min-h-[48px]" data-testid="button-go-to-portal">
                  Go to Member Portal
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  setBookingConfirmation(null);
                  form.reset();
                }}
                className="flex-1 min-h-[48px]"
                data-testid="button-book-another"
              >
                Book Another Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (coachesLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <Link href="/member-portal">
          <Button variant="ghost" className="mb-4 min-h-[44px]" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book Your Session</h1>
        <p className="text-muted-foreground">Schedule a one-on-one coaching session with one of our certified coaches.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Your Coach
              </CardTitle>
              <CardDescription>Choose a coach to book your session with</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="coachId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover open={coachOpen} onOpenChange={setCoachOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={coachOpen}
                            className={cn(
                              "w-full justify-between min-h-[48px]",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-select-coach"
                          >
                            {field.value && selectedCoach
                              ? `${selectedCoach.firstName} ${selectedCoach.lastName}`
                              : "Search for a coach..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Type a coach name..." data-testid="input-coach-search" />
                          <CommandList>
                            <CommandEmpty>No coach found.</CommandEmpty>
                            <CommandGroup>
                              {coaches.map((coach) => (
                                <CommandItem
                                  key={coach.id}
                                  value={`${coach.firstName} ${coach.lastName}`}
                                  onSelect={() => {
                                    form.setValue('coachId', coach.id);
                                    form.setValue('selectedTime', '');
                                    setCoachOpen(false);
                                  }}
                                  data-testid={`option-coach-${coach.id}`}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === coach.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                                      {coach.firstName?.[0]}{coach.lastName?.[0]}
                                    </div>
                                    <div>
                                      <div className="font-medium">{coach.firstName} {coach.lastName}</div>
                                      <div className="text-xs text-muted-foreground">{coach.email}</div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCoach && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-medium">
                      {selectedCoach.firstName?.[0]}{selectedCoach.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{selectedCoach.firstName} {selectedCoach.lastName}</div>
                      <div className="text-sm text-muted-foreground">{selectedCoach.email}</div>
                    </div>
                  </div>
                  {selectedCoach.bio && (
                    <p className="mt-3 text-sm text-muted-foreground">{selectedCoach.bio}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedCoachId > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Choose Date & Time
                </CardTitle>
                <CardDescription>Select when you'd like to have your session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="selectedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal min-h-[48px]",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-select-date"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.setValue('selectedTime', '');
                              setDateOpen(false);
                            }}
                            disabled={disabledDays}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedDate && (
                  <FormField
                    control={form.control}
                    name="selectedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Time Slots</FormLabel>
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                type="button"
                                variant={field.value === slot ? 'default' : 'outline'}
                                onClick={() => field.onChange(slot)}
                                className="min-h-[44px]"
                                data-testid={`button-time-${slot.replace(/[:\s]/g, '-')}`}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {slot}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground bg-muted/50 rounded-lg">
                            <p>No available time slots for this date.</p>
                            <p className="text-sm mt-1">Please select a different date.</p>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {selectedCoachId > 0 && selectedDate && form.watch('selectedTime') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Information</CardTitle>
                <CardDescription>Please provide your contact details</CardDescription>
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
                          <Input placeholder="Jane" {...field} className="min-h-[48px]" data-testid="input-firstname" />
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
                        <Input type="email" placeholder="jane@example.com" {...field} className="min-h-[48px]" data-testid="input-email" />
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
                      <FormLabel>Session Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any topics you'd like to discuss or goals for the session..." 
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
          )}

          {selectedCoachId > 0 && selectedDate && form.watch('selectedTime') && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coach:</span>
                  <span className="font-medium">{selectedCoach?.firstName} {selectedCoach?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{form.watch('selectedTime')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">60 minutes</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session Type:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    Video Call (Google Meet)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedCoachId > 0 && selectedDate && form.watch('selectedTime') && (
            <Button 
              type="submit" 
              disabled={createBookingMutation.isPending}
              className="w-full min-h-[52px] text-lg"
              data-testid="button-book-session"
            >
              {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Session'}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
