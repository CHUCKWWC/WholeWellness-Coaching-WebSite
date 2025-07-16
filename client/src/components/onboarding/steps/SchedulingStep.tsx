import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Video, ChevronRight, CheckCircle } from 'lucide-react';
import { format, addDays, startOfWeek, isWeekend } from 'date-fns';

interface SchedulingStepProps {
  onValidChange: (isValid: boolean) => void;
}

interface TimeSlot {
  id: string;
  date: Date;
  time: string;
  available: boolean;
}

export default function SchedulingStep({ onValidChange }: SchedulingStepProps) {
  const { data } = useOnboarding();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Generate available time slots based on user preferences
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startDate = startOfWeek(addDays(new Date(), selectedWeek * 7), { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dayName = format(date, 'EEEE');
      
      // Skip if day not in user's preferred days
      if (data.preferredDays && !data.preferredDays.includes(dayName)) continue;
      
      // Generate slots based on preferred times
      const timeSlots = [];
      if (data.preferredTimes?.includes('morning')) {
        timeSlots.push('9:00 AM', '10:00 AM', '11:00 AM');
      }
      if (data.preferredTimes?.includes('afternoon')) {
        timeSlots.push('1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM');
      }
      if (data.preferredTimes?.includes('evening')) {
        timeSlots.push('5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM');
      }
      
      timeSlots.forEach(time => {
        slots.push({
          id: `${format(date, 'yyyy-MM-dd')}-${time}`,
          date,
          time,
          available: Math.random() > 0.3 // Simulate availability
        });
      });
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  useEffect(() => {
    onValidChange(selectedSlot !== null);
  }, [selectedSlot, onValidChange]);

  return (
    <div className="space-y-6">
      <Alert>
        <Video className="h-4 w-4" />
        <AlertDescription>
          Schedule your free 30-minute discovery call. This is a chance to meet your potential coach and discuss your goals.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Available Times</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(selectedWeek - 1)}
            disabled={selectedWeek === 0}
          >
            Previous Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(selectedWeek + 1)}
          >
            Next Week
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedSlots).map(([dateKey, slots]) => {
          const date = new Date(dateKey);
          const hasAvailableSlots = slots.some(slot => slot.available);
          
          if (!hasAvailableSlots) return null;
          
          return (
            <Card key={dateKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(date, 'EEEE, MMMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {slots
                    .filter(slot => slot.available)
                    .map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {slot.time}
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedSlot && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Discovery Call Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-green-700">
              <p className="font-medium">
                {format(selectedSlot.date, 'EEEE, MMMM d, yyyy')} at {selectedSlot.time}
              </p>
              <p className="text-sm">
                Duration: 30 minutes • Format: {data.communicationPreference === 'video' ? 'Video Call' : 'Phone Call'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-base">What to expect in your discovery call:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span className="text-sm">Get to know your potential coach and their approach</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span className="text-sm">Discuss your goals and what you hope to achieve</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span className="text-sm">Learn about our coaching programs and pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
              <span className="text-sm">Ask any questions you have about the process</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {!selectedSlot && timeSlots.length === 0 && (
        <Alert>
          <AlertDescription>
            No available slots match your preferences this week. Try selecting a different week or we'll contact you to find a suitable time.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}