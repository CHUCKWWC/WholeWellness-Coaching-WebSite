import { useEffect, useState } from 'react';
import { useOnboarding } from '../../OnboardingContext';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video } from 'lucide-react';

interface CoachAvailabilityStepProps {
  onValidChange: (isValid: boolean) => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  available: boolean;
  slots: TimeSlot[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const timeSlots = [
  'Morning (8am-12pm)',
  'Afternoon (12pm-5pm)',
  'Evening (5pm-9pm)'
];

const sessionTypes = [
  { id: 'individual', label: 'Individual Sessions (1-on-1)', icon: Video },
  { id: 'group', label: 'Group Sessions', icon: Users },
  { id: 'crisis', label: 'Crisis Support', icon: Clock }
];

export default function CoachAvailabilityStep({ onValidChange }: CoachAvailabilityStepProps) {
  const { data, updateData } = useOnboarding();
  const [availability, setAvailability] = useState<DayAvailability[]>(
    (data as any).availability || daysOfWeek.map(day => ({
      day,
      available: false,
      slots: []
    }))
  );
  const [timezone, setTimezone] = useState((data as any).timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [sessionTypesOffered, setSessionTypesOffered] = useState<string[]>((data as any).sessionTypesOffered || []);
  const [minClientsPerWeek, setMinClientsPerWeek] = useState((data as any).minClientsPerWeek || '');
  const [maxClientsPerWeek, setMaxClientsPerWeek] = useState((data as any).maxClientsPerWeek || '');

  useEffect(() => {
    const hasAvailableDays = availability.some(day => day.available);
    const hasSessionTypes = sessionTypesOffered.length > 0;
    const hasClientCapacity = minClientsPerWeek !== '' && maxClientsPerWeek !== '';
    const isValid = hasAvailableDays && hasSessionTypes && hasClientCapacity;
    onValidChange(isValid);
  }, [availability, sessionTypesOffered, minClientsPerWeek, maxClientsPerWeek, onValidChange]);

  useEffect(() => {
    updateData({
      availability,
      timezone,
      sessionTypesOffered,
      minClientsPerWeek: parseInt(minClientsPerWeek) || 0,
      maxClientsPerWeek: parseInt(maxClientsPerWeek) || 0
    });
  }, [availability, timezone, sessionTypesOffered, minClientsPerWeek, maxClientsPerWeek, updateData]);

  const toggleDay = (dayIndex: number) => {
    setAvailability(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, available: !day.available } : day
    ));
  };

  const toggleSessionType = (typeId: string) => {
    setSessionTypesOffered(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Let us know when you're available to support clients. We'll match you with clients based on mutual availability.
        </AlertDescription>
      </Alert>

      {/* Weekly Availability */}
      <div className="space-y-3">
        <Label className="text-base">Weekly Availability</Label>
        <p className="text-sm text-gray-600">Select the days you're generally available for coaching sessions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availability.map((day, index) => (
            <Card 
              key={day.day} 
              className={`cursor-pointer transition-colors ${
                day.available ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleDay(index)}
            >
              <CardContent className="p-3 text-center">
                <Label className="cursor-pointer">
                  {day.day.substring(0, 3)}
                </Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Session Types */}
      <div className="space-y-3">
        <Label className="text-base">Session Types You Offer</Label>
        <div className="space-y-3">
          {sessionTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.id} 
                className={`cursor-pointer transition-colors ${
                  sessionTypesOffered.includes(type.id) ? 'border-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => toggleSessionType(type.id)}
              >
                <CardContent className="flex items-center space-x-3 p-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <Label className="cursor-pointer flex-1">{type.label}</Label>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Client Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Capacity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="min-clients">Minimum clients per week</Label>
            <input
              id="min-clients"
              type="number"
              placeholder="2"
              value={minClientsPerWeek}
              onChange={(e) => setMinClientsPerWeek(e.target.value)}
              min="1"
              max="50"
              className="w-24 mt-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <Label htmlFor="max-clients">Maximum clients per week</Label>
            <input
              id="max-clients"
              type="number"
              placeholder="10"
              value={maxClientsPerWeek}
              onChange={(e) => setMaxClientsPerWeek(e.target.value)}
              min="1"
              max="50"
              className="w-24 mt-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Timezone */}
      <div>
        <Label htmlFor="timezone">Your Timezone</Label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="America/Phoenix">Arizona Time</option>
          <option value="Pacific/Honolulu">Hawaii Time</option>
        </select>
      </div>
    </div>
  );
}