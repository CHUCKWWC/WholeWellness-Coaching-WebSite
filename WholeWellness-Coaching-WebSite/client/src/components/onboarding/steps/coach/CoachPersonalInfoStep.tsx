import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboarding } from '../../OnboardingContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase } from 'lucide-react';

const coachPersonalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number'),
  linkedIn: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  bio: z.string().min(100, 'Please provide at least 100 characters about yourself'),
  location: z.string().min(2, 'Please enter your city and state')
});

type CoachPersonalInfoData = z.infer<typeof coachPersonalInfoSchema>;

interface CoachPersonalInfoStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function CoachPersonalInfoStep({ onValidChange }: CoachPersonalInfoStepProps) {
  const { data, updateData } = useOnboarding();
  
  const form = useForm<CoachPersonalInfoData>({
    resolver: zodResolver(coachPersonalInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phone: data.phone || '',
      linkedIn: (data as any).linkedIn || '',
      bio: (data as any).bio || '',
      location: (data as any).location || ''
    },
    mode: 'onChange'
  });

  const { watch, formState: { isValid } } = form;

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  useEffect(() => {
    const subscription = watch((values) => {
      updateData(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateData]);

  return (
    <div className="space-y-6">
      <Alert>
        <Briefcase className="h-4 w-4" />
        <AlertDescription>
          Thank you for your interest in joining our coaching team. We're looking for compassionate professionals dedicated to supporting women through life transitions.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
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
                <FormLabel>Professional Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane.doe@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  We'll use this for all coach communications
                </FormDescription>
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
                  <Input 
                    type="tel" 
                    placeholder="1234567890" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  10-digit number for urgent communications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="San Antonio, TX" {...field} />
                </FormControl>
                <FormDescription>
                  City and state where you're based
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/janedoe" {...field} />
                </FormControl>
                <FormDescription>
                  Helps us verify your professional background
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Share your coaching philosophy, experience with supporting women in transition, and what draws you to this work..."
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Tell us about yourself and your passion for coaching (minimum 100 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}