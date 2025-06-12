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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const coachingAreas = [
  "Domestic Violence Recovery",
  "Divorce & Widowhood Support", 
  "Career Development",
  "Life Balance Coaching",
  "Relationship Coaching",
  "Personal Development"
];

export default function BookingForm() {
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
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (booking: InsertBooking) => {
      const response = await apiRequest("POST", "/api/bookings", booking);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Submitted Successfully!",
        description: "Thank you for your interest! We will contact you within 24 hours to schedule your free consultation.",
      });
      form.reset();
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

  const onSubmit = (data: InsertBooking) => {
    bookingMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-secondary mb-6">What to Expect</h3>
          <div className="space-y-4">
            {[
              "30-minute confidential conversation",
              "Assessment of your current situation and goals",
              "Explanation of our coaching approach",
              "Discussion of payment options and financial assistance",
              "No pressure, no obligation"
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-primary text-white rounded-full p-1 flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
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
              
              <Button 
                type="submit" 
                className="w-full bg-primary text-white hover:bg-secondary transition-colors"
                disabled={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? "Submitting..." : "Schedule Free Consultation"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
