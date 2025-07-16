import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MessageSquare, Video, Phone, Users } from 'lucide-react';

interface SupportPreferencesStepProps {
  onValidChange: (isValid: boolean) => void;
}

const coachingStyleOptions = [
  { id: 'gentle', label: 'Gentle & Nurturing', description: 'Supportive, patient, and understanding approach' },
  { id: 'structured', label: 'Structured & Goal-Oriented', description: 'Clear plans, accountability, and measurable progress' },
  { id: 'holistic', label: 'Holistic & Mind-Body', description: 'Integrating wellness, mindfulness, and self-care' },
  { id: 'direct', label: 'Direct & Action-Focused', description: 'Straightforward guidance and practical solutions' },
  { id: 'collaborative', label: 'Collaborative & Explorative', description: 'Working together to discover insights and solutions' }
];

const sessionFrequencyOptions = [
  { value: 'weekly', label: 'Weekly (Recommended for best results)' },
  { value: 'biweekly', label: 'Every two weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'as-needed', label: 'As needed / Flexible' }
];

const dayOptions = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timeOptions = [
  { id: 'morning', label: 'Morning (8am - 12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
  { id: 'evening', label: 'Evening (5pm - 9pm)' }
];

const communicationOptions = [
  { value: 'video', label: 'Video calls', icon: Video },
  { value: 'phone', label: 'Phone calls', icon: Phone },
  { value: 'messaging', label: 'Secure messaging', icon: MessageSquare },
  { value: 'group', label: 'Group sessions', icon: Users }
];

export default function SupportPreferencesStep({ onValidChange }: SupportPreferencesStepProps) {
  const { data, updateData } = useOnboarding();
  const [coachingStyle, setCoachingStyle] = useState<string[]>(data.coachingStyle || []);
  const [sessionFrequency, setSessionFrequency] = useState(data.sessionFrequency || '');
  const [preferredDays, setPreferredDays] = useState<string[]>(data.preferredDays || []);
  const [preferredTimes, setPreferredTimes] = useState<string[]>(data.preferredTimes || []);
  const [communicationPreference, setCommunicationPreference] = useState(data.communicationPreference || '');

  useEffect(() => {
    const isValid = coachingStyle.length > 0 && 
                   sessionFrequency !== '' && 
                   preferredDays.length > 0 && 
                   preferredTimes.length > 0 &&
                   communicationPreference !== '';
    onValidChange(isValid);
  }, [coachingStyle, sessionFrequency, preferredDays, preferredTimes, communicationPreference, onValidChange]);

  useEffect(() => {
    updateData({
      coachingStyle,
      sessionFrequency,
      preferredDays,
      preferredTimes,
      communicationPreference
    });
  }, [coachingStyle, sessionFrequency, preferredDays, preferredTimes, communicationPreference, updateData]);

  const toggleCoachingStyle = (styleId: string) => {
    setCoachingStyle(prev => 
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const toggleDay = (day: string) => {
    setPreferredDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleTime = (timeId: string) => {
    setPreferredTimes(prev => 
      prev.includes(timeId)
        ? prev.filter(t => t !== timeId)
        : [...prev, timeId]
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          Help us match you with a coach who fits your needs and schedule perfectly.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Label>What coaching style resonates with you? * (Select all that apply)</Label>
        <div className="space-y-3">
          {coachingStyleOptions.map((option) => (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-colors ${
                coachingStyle.includes(option.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleCoachingStyle(option.id)}
            >
              <CardContent className="flex items-start space-x-3 p-4">
                <Checkbox
                  checked={coachingStyle.includes(option.id)}
                  onCheckedChange={() => toggleCoachingStyle(option.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label className="cursor-pointer font-medium">{option.label}</Label>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          How often would you like to meet? *
        </Label>
        <RadioGroup value={sessionFrequency} onValueChange={setSessionFrequency}>
          {sessionFrequencyOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Which days work best for you? * (Select all that apply)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dayOptions.map((day) => (
            <Card 
              key={day} 
              className={`cursor-pointer transition-colors text-center ${
                preferredDays.includes(day) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleDay(day)}
            >
              <CardContent className="p-3">
                <Label className="cursor-pointer">{day}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          What times work best? * (Select all that apply)
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {timeOptions.map((option) => (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-colors text-center ${
                preferredTimes.includes(option.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleTime(option.id)}
            >
              <CardContent className="p-3">
                <Label className="cursor-pointer">{option.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>How would you prefer to connect? *</Label>
        <RadioGroup value={communicationPreference} onValueChange={setCommunicationPreference}>
          {communicationOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option.value} id={option.value} />
                <Icon className="h-4 w-4 text-gray-600" />
                <Label htmlFor={option.value} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
}