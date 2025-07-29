import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Target } from 'lucide-react';

interface LifestyleSchedulingStepProps {
  onValidChange: (isValid: boolean) => void;
}

const timeSlots = [
  { id: 'early_morning', label: 'Early Morning (6 AM - 9 AM)', icon: '🌅' },
  { id: 'morning', label: 'Morning (9 AM - 12 PM)', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon (12 PM - 5 PM)', icon: '🌤️' },
  { id: 'evening', label: 'Evening (5 PM - 8 PM)', icon: '🌆' },
  { id: 'night', label: 'Night (8 PM - 10 PM)', icon: '🌙' }
];

const days = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

export default function LifestyleSchedulingStep({ onValidChange }: LifestyleSchedulingStepProps) {
  const { data, updateData } = useOnboarding();
  const [goals, setGoals] = useState(data.coachingGoals || '');
  const [sessionFrequency, setSessionFrequency] = useState(data.sessionFrequency || '');
  const [preferredTimes, setPreferredTimes] = useState<string[]>(data.preferredTimeSlots || []);
  const [preferredDays, setPreferredDays] = useState<string[]>(data.preferredDays || []);
  const [timezone, setTimezone] = useState(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const isValid = goals.length >= 20 && 
                   sessionFrequency !== '' && 
                   preferredTimes.length > 0 &&
                   preferredDays.length > 0;
    onValidChange(isValid);
  }, [goals, sessionFrequency, preferredTimes, preferredDays, onValidChange]);

  useEffect(() => {
    updateData({
      coachingGoals: goals,
      sessionFrequency,
      preferredTimeSlots: preferredTimes,
      preferredDays,
      timezone
    });
  }, [goals, sessionFrequency, preferredTimes, preferredDays, timezone, updateData]);

  const toggleTime = (timeId: string) => {
    setPreferredTimes(prev => 
      prev.includes(timeId) 
        ? prev.filter(id => id !== timeId)
        : [...prev, timeId]
    );
  };

  const toggleDay = (dayId: string) => {
    setPreferredDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Help us understand your schedule and goals to ensure coaching fits seamlessly into your life.
        </AlertDescription>
      </Alert>

      {/* Goals */}
      <div className="space-y-2">
        <Label htmlFor="goals" className="text-base font-semibold">
          What are your specific goals for coaching? *
        </Label>
        <Textarea
          id="goals"
          placeholder="What would you like to achieve? What would success look like for you?"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          className="min-h-[120px]"
        />
        <p className="text-sm text-gray-600">
          Be specific about what you want to accomplish (minimum 20 characters)
        </p>
      </div>

      {/* Session Frequency */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          How often would you like to have coaching sessions? *
        </Label>
        <RadioGroup value={sessionFrequency} onValueChange={setSessionFrequency}>
          <Card className="cursor-pointer" onClick={() => setSessionFrequency('weekly')}>
            <CardContent className="flex items-center space-x-3 p-4">
              <RadioGroupItem value="weekly" />
              <div className="flex-1">
                <Label className="cursor-pointer font-medium">Weekly</Label>
                <p className="text-sm text-gray-600">Most effective for rapid progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setSessionFrequency('biweekly')}>
            <CardContent className="flex items-center space-x-3 p-4">
              <RadioGroupItem value="biweekly" />
              <div className="flex-1">
                <Label className="cursor-pointer font-medium">Every Two Weeks</Label>
                <p className="text-sm text-gray-600">Good balance of support and independence</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setSessionFrequency('monthly')}>
            <CardContent className="flex items-center space-x-3 p-4">
              <RadioGroupItem value="monthly" />
              <div className="flex-1">
                <Label className="cursor-pointer font-medium">Monthly</Label>
                <p className="text-sm text-gray-600">For maintenance and check-ins</p>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Preferred Times */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Preferred session times * (Select all that work for you)
        </Label>
        <p className="text-sm text-gray-600">Your timezone: {timezone}</p>
        <div className="space-y-2">
          {timeSlots.map((slot) => (
            <Card 
              key={slot.id}
              className={`cursor-pointer transition-colors ${
                preferredTimes.includes(slot.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleTime(slot.id)}
            >
              <CardContent className="flex items-center space-x-3 p-3">
                <Checkbox 
                  checked={preferredTimes.includes(slot.id)}
                  onCheckedChange={() => toggleTime(slot.id)}
                />
                <span className="text-xl">{slot.icon}</span>
                <Label className="cursor-pointer flex-1">{slot.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Preferred Days */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Available days * (Select all that work for you)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {days.map((day) => (
            <Card 
              key={day.id}
              className={`cursor-pointer transition-colors ${
                preferredDays.includes(day.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleDay(day.id)}
            >
              <CardContent className="flex items-center space-x-2 p-3">
                <Checkbox 
                  checked={preferredDays.includes(day.id)}
                  onCheckedChange={() => toggleDay(day.id)}
                />
                <Label className="cursor-pointer text-sm">{day.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Note:</strong> While we can't guarantee specific time slots at this stage, providing multiple options helps us find the best match for your schedule.
        </AlertDescription>
      </Alert>
    </div>
  );
}