import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Heart, Briefcase, UserCheck } from 'lucide-react';

interface CoachingNeedsStepProps {
  onValidChange: (isValid: boolean) => void;
}

const coachingTypes = [
  { id: 'individual', label: 'Individual Coaching', icon: '👤', description: 'One-on-one personal coaching sessions' },
  { id: 'couple', label: 'Couple Coaching', icon: '💑', description: 'Support for relationships and partnerships' },
  { id: 'professional', label: 'Professional Coaching', icon: '💼', description: 'Career and professional development' },
  { id: 'wellness', label: 'Wellness Coaching', icon: '🌱', description: 'Holistic health and wellness support' }
];

const coachPreferences = [
  { id: 'gender_female', label: 'Female coach preferred' },
  { id: 'gender_male', label: 'Male coach preferred' },
  { id: 'gender_no_preference', label: 'No gender preference' },
  { id: 'age_similar', label: 'Similar age to me' },
  { id: 'age_older', label: 'Older/more experienced' },
  { id: 'age_no_preference', label: 'Age doesn\'t matter' },
  { id: 'background_similar', label: 'Similar cultural background' },
  { id: 'specialty_trauma', label: 'Trauma-informed approach' },
  { id: 'specialty_spiritual', label: 'Spiritually-oriented' },
  { id: 'specialty_practical', label: 'Practical/action-focused' }
];

export default function CoachingNeedsStep({ onValidChange }: CoachingNeedsStepProps) {
  const { data, updateData } = useOnboarding();
  const [coachingType, setCoachingType] = useState(data.coachingType || '');
  const [motivation, setMotivation] = useState(data.motivation || '');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(data.coachPreferences || []);

  useEffect(() => {
    const isValid = coachingType !== '' && motivation.length >= 20;
    onValidChange(isValid);
  }, [coachingType, motivation, onValidChange]);

  useEffect(() => {
    updateData({
      coachingType,
      motivation,
      coachPreferences: selectedPreferences
    });
  }, [coachingType, motivation, selectedPreferences, updateData]);

  const togglePreference = (prefId: string) => {
    setSelectedPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <UserCheck className="h-4 w-4" />
        <AlertDescription>
          Understanding your needs helps us find the perfect coach match for you.
        </AlertDescription>
      </Alert>

      {/* Coaching Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">What type of coaching are you seeking? *</Label>
        <RadioGroup value={coachingType} onValueChange={setCoachingType}>
          <div className="grid gap-3">
            {coachingTypes.map((type) => (
              <Card 
                key={type.id} 
                className={`cursor-pointer transition-colors ${
                  coachingType === type.id ? 'border-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => setCoachingType(type.id)}
              >
                <CardContent className="flex items-center space-x-3 p-4">
                  <RadioGroupItem value={type.id} />
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <Label className="cursor-pointer font-medium">{type.label}</Label>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Motivation */}
      <div className="space-y-2">
        <Label htmlFor="motivation" className="text-base font-semibold">
          What brings you to coaching at this time? *
        </Label>
        <Textarea
          id="motivation"
          placeholder="Please share what you hope to achieve through coaching and what challenges you're currently facing..."
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="min-h-[120px]"
        />
        <p className="text-sm text-gray-600">
          Minimum 20 characters. Be as specific as you're comfortable sharing.
        </p>
      </div>

      {/* Coach Preferences */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Coach preferences (optional)</Label>
        <p className="text-sm text-gray-600">
          Select any preferences that are important to you. We'll do our best to match these.
        </p>
        <div className="space-y-3">
          {coachPreferences.map((pref) => (
            <Card 
              key={pref.id}
              className={`cursor-pointer transition-colors ${
                selectedPreferences.includes(pref.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => togglePreference(pref.id)}
            >
              <CardContent className="flex items-center space-x-3 p-3">
                <Checkbox 
                  checked={selectedPreferences.includes(pref.id)}
                  onCheckedChange={() => togglePreference(pref.id)}
                />
                <Label className="cursor-pointer flex-1">{pref.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}