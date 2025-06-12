import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Send,
  MessageCircle,
  Heart,
  Users,
  Calendar
} from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (contact: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", contact);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed to Send",
        description: error.message || "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    contactMutation.mutate(data);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "info@wholewellness-coaching.org",
      description: "Send us an email anytime"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "(555) 123-4567",
      description: "Monday - Friday, 9AM - 6PM"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Office Hours",
      content: "Monday - Friday: 9AM - 6PM\nSaturday: 10AM - 2PM\nSunday: Closed",
      description: "We're here when you need us"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Virtual Services",
      content: "Available Worldwide",
      description: "Online coaching and support"
    }
  ];

  const supportOptions = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Schedule Consultation",
      description: "Book a free 30-minute consultation to discuss your needs and our services.",
      action: "Schedule Now",
      href: "/booking"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "General Inquiries",
      description: "Have questions about our programs, pricing, or services? We're here to help.",
      action: "Send Message",
      href: "#contact-form"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Crisis Support",
      description: "If you're in immediate danger, please call 911. For crisis support, contact the National Domestic Violence Hotline: 1-800-799-7233",
      action: "Learn More",
      href: "#crisis-resources"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Support",
      description: "Connect with our community programs, support groups, and volunteer opportunities.",
      action: "Join Community",
      href: "/programs"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            We're here to support you on your journey. Reach out with questions, 
            concerns, or to learn more about how we can help.
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600">Choose the best way to connect with us</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-3">{option.title}</h3>
                  <p className="text-gray-600 text-sm mb-6">{option.description}</p>
                  <Button 
                    className="bg-primary hover:bg-secondary w-full"
                    onClick={() => {
                      if (option.href.startsWith('#')) {
                        document.getElementById(option.href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = option.href;
                      }
                    }}
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary text-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">{info.title}</h3>
                  <p className="text-gray-700 font-medium mb-2 whitespace-pre-line">{info.content}</p>
                  <p className="text-gray-500 text-sm">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Send Us a Message</h2>
            <p className="text-lg text-gray-600">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
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
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <FormControl>
                          <Input placeholder="What is this regarding?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us how we can help you..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-primary text-white hover:bg-secondary transition-colors"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Crisis Resources */}
      <section id="crisis-resources" className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Crisis Resources</h2>
            <p className="text-lg text-red-700">
              If you or someone you know is in immediate danger, please reach out for help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-4">Emergency Services</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold">Emergency: 911</p>
                      <p className="text-sm text-gray-600">For immediate life-threatening emergencies</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-4">Crisis Hotlines</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold">National Domestic Violence Hotline</p>
                      <p className="text-red-700 font-medium">1-800-799-7233</p>
                      <p className="text-sm text-gray-600">24/7 confidential support</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold">National Suicide Prevention Lifeline</p>
                      <p className="text-red-700 font-medium">988</p>
                      <p className="text-sm text-gray-600">24/7 crisis support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about our services
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How much do your services cost?",
                answer: "We offer sliding scale pricing based on your financial situation. Our services range from free for those who qualify to $200 for full-service coaching. We believe cost should never be a barrier to getting support."
              },
              {
                question: "How do I know if coaching is right for me?",
                answer: "We offer free 30-minute consultations to help you understand if coaching aligns with your goals. Our coaches will assess your situation and recommend the best approach for your needs."
              },
              {
                question: "Are your services confidential?",
                answer: "Yes, absolutely. All coaching sessions and communications are completely confidential. We follow strict privacy guidelines to ensure your safety and trust."
              },
              {
                question: "Do you offer services for people outside the target groups?",
                answer: "While we specialize in supporting women who have survived domestic violence, are newly divorced or widowed, we welcome anyone seeking transformative support and personal growth."
              },
              {
                question: "How long does the coaching process typically take?",
                answer: "The duration varies based on individual goals and circumstances. Some clients see progress in a few sessions, while others benefit from longer-term support. We'll work with you to create a timeline that fits your needs."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-3">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
