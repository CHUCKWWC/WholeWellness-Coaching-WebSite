import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertBookingSchema, type InsertBooking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TimeSlotPicker from "@/components/TimeSlotPicker";

const coachingAreas = [
  "Domestic Violence Recovery",
  "Divorce & Widowhood Support", 
  "Career Development",
  "Life Balance Coaching",
  "Relationship Coaching",
  "Personal Development",
  "Weight Loss Coaching"
];

interface BookingFormProps {
  serviceId?: string;
  serviceName?: string;
}

export default function BookingForm({ serviceId, serviceName }: BookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      coachingArea: "",
      message: "",
      serviceType: serviceId || "",
      preferredDate: "",
      preferredTime: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "Booking Confirmed!",
        description: `Your ${serviceName || 'session'} is scheduled for ${selectedDate?.toLocaleDateString()} at ${selectedTime}. Check your email for confirmation details.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTimeSelection = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    form.setValue("preferredDate", date.toISOString());
    form.setValue("preferredTime", time);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: InsertBooking) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a time",
        description: "You need to select both a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }
    bookingMutation.mutate({
      ...data,
      serviceType: serviceId || data.serviceType || "consultation",
      preferredDate: selectedDate.toISOString(),
      preferredTime: selectedTime,
    });
  };

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Booking Confirmed!
          </h3>
          <p className="text-green-700 mb-4">
            Your {serviceName || 'session'} is scheduled for{' '}
            <strong>{selectedDate?.toLocaleDateString()} at {selectedTime}</strong>
          </p>
          <p className="text-sm text-green-600">
            You'll receive a confirmation email with meeting details shortly.
          </p>
          <Button 
            onClick={() => {
              setIsComplete(false);
              setCurrentStep(1);
              form.reset();
              setSelectedDate(null);
              setSelectedTime(null);
            }}
            variant="outline"
            className="mt-4"
          >
            Book Another Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  const steps = [
    { number: 1, title: "Service", description: "Select your service" },
    { number: 2, title: "Time", description: "Pick date & time" },
    { number: 3, title: "Details", description: "Your information" },
  ];

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
              currentStep >= step.number 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step.number}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-primary' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
              <p className={`text-xs ${
                currentStep >= step.number ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {step.description}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 mx-4 h-px ${
                currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {renderProgressBar()}
      
      {currentStep === 1 && (
        <div>
          <h3 className="text-xl font-semibold text-secondary mb-6">
            {serviceName ? `Booking: ${serviceName}` : 'Select Service Type'}
          </h3>
          <div className="space-y-4">
            {serviceName ? (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">{serviceName}</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Ready to proceed with this service selection.
                  </p>
                  <Button onClick={nextStep} className="w-full">
                    Continue to Time Selection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="coachingArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What area would you like coaching support with? *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a coaching area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {coachingAreas.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  onClick={nextStep}
                  disabled={!form.watch("coachingArea")}
                  className="w-full mt-4"
                >
                  Continue to Time Selection
                </Button>
              </Form>
            )}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <h3 className="text-xl font-semibold text-secondary mb-6">Select Date & Time</h3>
          <TimeSlotPicker
            onTimeSelect={handleTimeSelection}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={previousStep} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={nextStep}
              disabled={!selectedDate || !selectedTime}
              className="flex-1"
            >
              Continue to Details
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <h3 className="text-xl font-semibold text-secondary mb-6">Your Information</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coachingArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Coaching Area of Interest</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coachingAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell us a bit about your situation (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share what's prompting you to seek coaching support..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4 mt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={previousStep} 
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-white hover:bg-secondary transition-colors"
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? "Submitting..." : "Schedule Session"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
