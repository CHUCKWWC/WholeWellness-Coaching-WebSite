import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Target, User } from 'lucide-react';

interface ProfilingGoalsStepProps {
  onValidChange: (isValid: boolean) => void;
}

const focusAreas = [
  { id: 'stress', label: 'Stress Management', icon: '😰' },
  { id: 'career', label: 'Career Goals', icon: '💼' },
  { id: 'balance', label: 'Work-Life Balance', icon: '⚖️' },
  { id: 'relationships', label: 'Relationship Skills', icon: '❤️' },
  { id: 'confidence', label: 'Self-Confidence', icon: '💪' },
  { id: 'anxiety', label: 'Anxiety Management', icon: '🧘' },
  { id: 'communication', label: 'Communication Skills', icon: '💬' },
  { id: 'trauma', label: 'Trauma Recovery', icon: '🌱' },
  { id: 'life_transition', label: 'Life Transitions', icon: '🔄' },
  { id: 'parenting', label: 'Parenting Support', icon: '👨‍👩‍👧' }
];

export default function ProfilingGoalsStep({ onValidChange }: ProfilingGoalsStepProps) {
  const { data, updateData } = useOnboarding();
  const [age, setAge] = useState(data.age || '');
  const [gender, setGender] = useState(data.gender || '');
  const [occupation, setOccupation] = useState(data.occupation || '');
  const [relationshipStatus, setRelationshipStatus] = useState(data.relationshipStatus || '');
  const [livingArrangement, setLivingArrangement] = useState(data.livingArrangement || '');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(data.focusAreas || []);
  const [previousSupport, setPreviousSupport] = useState(data.previousSupport || 'no');
  const [previousExperience, setPreviousExperience] = useState(data.previousExperience || '');
  const [inCrisis, setInCrisis] = useState<string>(data.inCrisis || 'no');

  useEffect(() => {
    const isValid = age !== '' && 
                   gender !== '' && 
                   occupation.length >= 2 &&
                   relationshipStatus !== '' &&
                   selectedFocusAreas.length > 0;
    onValidChange(isValid);
  }, [age, gender, occupation, relationshipStatus, selectedFocusAreas, onValidChange]);

  useEffect(() => {
    updateData({
      age,
      gender,
      occupation,
      relationshipStatus,
      livingArrangement,
      focusAreas: selectedFocusAreas,
      previousSupport,
      previousExperience,
      inCrisis
    });
  }, [age, gender, occupation, relationshipStatus, livingArrangement, selectedFocusAreas, previousSupport, previousExperience, inCrisis, updateData]);

  const toggleFocusArea = (areaId: string) => {
    setSelectedFocusAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <User className="h-4 w-4" />
        <AlertDescription>
          This information helps us understand your unique situation and match you with the right coach.
        </AlertDescription>
      </Alert>

      {/* Important Disclaimer */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Notice</AlertTitle>
        <AlertDescription>
          Coaching is not a substitute for clinical therapy or crisis services. If you are experiencing thoughts of self-harm or are in immediate danger, please contact emergency services (911) or the National Suicide Prevention Lifeline at 988.
        </AlertDescription>
      </Alert>

      {/* Crisis Check */}
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-3 block">
            Are you currently in crisis or experiencing severe distress? *
          </Label>
          <RadioGroup value={inCrisis} onValueChange={setInCrisis}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" />
              <Label>No, I'm seeking support for personal growth</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" />
              <Label>Yes, I need immediate help</Label>
            </div>
          </RadioGroup>
          {inCrisis === 'yes' && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>
                <strong>Please seek immediate help:</strong>
                <ul className="mt-2 ml-4 list-disc">
                  <li>Emergency Services: 911</li>
                  <li>National Suicide Prevention Lifeline: 988</li>
                  <li>Crisis Text Line: Text HOME to 741741</li>
                  <li>Domestic Violence Hotline: 1-800-799-7233</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Demographics */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="age">Age *</Label>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger id="age">
              <SelectValue placeholder="Select your age range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-24">18-24</SelectItem>
              <SelectItem value="25-34">25-34</SelectItem>
              <SelectItem value="35-44">35-44</SelectItem>
              <SelectItem value="45-54">45-54</SelectItem>
              <SelectItem value="55-64">55-64</SelectItem>
              <SelectItem value="65+">65+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="occupation">Occupation *</Label>
          <Input
            id="occupation"
            placeholder="e.g., Teacher, Engineer, Stay-at-home parent"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="relationship">Relationship Status *</Label>
          <Select value={relationshipStatus} onValueChange={setRelationshipStatus}>
            <SelectTrigger id="relationship">
              <SelectValue placeholder="Select your status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="partnered">In a relationship</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="separated">Separated</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="living">Living Arrangement</Label>
        <Select value={livingArrangement} onValueChange={setLivingArrangement}>
          <SelectTrigger id="living">
            <SelectValue placeholder="Select your living situation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alone">Living alone</SelectItem>
            <SelectItem value="partner">With partner/spouse</SelectItem>
            <SelectItem value="children">With children</SelectItem>
            <SelectItem value="family">With family</SelectItem>
            <SelectItem value="roommates">With roommates</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Focus Areas */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Areas of focus or concern * (Select all that apply)</Label>
        <div className="grid gap-3 md:grid-cols-2">
          {focusAreas.map((area) => (
            <Card 
              key={area.id}
              className={`cursor-pointer transition-colors ${
                selectedFocusAreas.includes(area.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleFocusArea(area.id)}
            >
              <CardContent className="flex items-center space-x-3 p-3">
                <Checkbox 
                  checked={selectedFocusAreas.includes(area.id)}
                  onCheckedChange={() => toggleFocusArea(area.id)}
                />
                <span className="text-xl">{area.icon}</span>
                <Label className="cursor-pointer flex-1">{area.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Previous Experience */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Have you had coaching or therapy before?</Label>
          <RadioGroup value={previousSupport} onValueChange={setPreviousSupport}>
            <div className="flex items-center space-x-2 mt-2">
              <RadioGroupItem value="no" />
              <Label>No, this is my first time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" />
              <Label>Yes, I have previous experience</Label>
            </div>
          </RadioGroup>
        </div>

        {previousSupport === 'yes' && (
          <div>
            <Label htmlFor="experience">Please share about your previous experience</Label>
            <Textarea
              id="experience"
              placeholder="What worked well? What didn't? What are you looking for this time?"
              value={previousExperience}
              onChange={(e) => setPreviousExperience(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}