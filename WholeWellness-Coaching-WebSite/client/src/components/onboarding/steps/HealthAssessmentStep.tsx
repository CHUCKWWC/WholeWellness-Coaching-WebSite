import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Moon, Activity, AlertCircle } from 'lucide-react';

interface HealthAssessmentStepProps {
  onValidChange: (isValid: boolean) => void;
}

const healthConcernOptions = [
  { id: 'anxiety', label: 'Anxiety', icon: '😰' },
  { id: 'depression', label: 'Depression', icon: '😔' },
  { id: 'insomnia', label: 'Sleep difficulties', icon: '😴' },
  { id: 'fatigue', label: 'Chronic fatigue', icon: '😩' },
  { id: 'pain', label: 'Chronic pain', icon: '🤕' },
  { id: 'eating', label: 'Eating concerns', icon: '🍽️' },
  { id: 'substance', label: 'Substance use', icon: '🚫' },
  { id: 'none', label: 'None of the above', icon: '✅' }
];

const exerciseOptions = [
  { value: 'none', label: 'I don\'t currently exercise' },
  { value: 'minimal', label: '1-2 times per week' },
  { value: 'moderate', label: '3-4 times per week' },
  { value: 'regular', label: '5+ times per week' }
];

export default function HealthAssessmentStep({ onValidChange }: HealthAssessmentStepProps) {
  const { data, updateData } = useOnboarding();
  const [healthConcerns, setHealthConcerns] = useState<string[]>(data.healthConcerns || []);
  const [medications, setMedications] = useState(data.medications || '');
  const [sleepQuality, setSleepQuality] = useState(data.sleepQuality || 5);
  const [stressLevel, setStressLevel] = useState(data.stressLevel || 5);
  const [exerciseFrequency, setExerciseFrequency] = useState(data.exerciseFrequency || '');

  useEffect(() => {
    const isValid = healthConcerns.length > 0 && exerciseFrequency !== '';
    onValidChange(isValid);
  }, [healthConcerns, exerciseFrequency, onValidChange]);

  useEffect(() => {
    updateData({
      healthConcerns,
      medications,
      sleepQuality,
      stressLevel,
      exerciseFrequency
    });
  }, [healthConcerns, medications, sleepQuality, stressLevel, exerciseFrequency, updateData]);

  const toggleHealthConcern = (concernId: string) => {
    if (concernId === 'none') {
      setHealthConcerns(['none']);
    } else {
      setHealthConcerns(prev => {
        const filtered = prev.filter(id => id !== 'none');
        return filtered.includes(concernId)
          ? filtered.filter(id => id !== concernId)
          : [...filtered, concernId];
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          This information helps us provide holistic support. All information is confidential.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Label>Are you currently experiencing any of the following? * (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthConcernOptions.map((option) => (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-colors ${
                healthConcerns.includes(option.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleHealthConcern(option.id)}
            >
              <CardContent className="flex items-center space-x-3 p-3">
                <span className="text-2xl">{option.icon}</span>
                <Checkbox
                  checked={healthConcerns.includes(option.id)}
                  onCheckedChange={() => toggleHealthConcern(option.id)}
                />
                <Label className="cursor-pointer flex-1">{option.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications">
          Are you currently taking any medications? (Optional)
        </Label>
        <Textarea
          id="medications"
          placeholder="List any medications or supplements you're taking..."
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          className="min-h-[80px]"
        />
        <p className="text-sm text-gray-600">This helps us understand your overall health picture</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Sleep Quality
            </Label>
            <span className="text-sm font-medium">{sleepQuality}/10</span>
          </div>
          <Slider
            value={[sleepQuality]}
            onValueChange={(value) => setSleepQuality(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Current Stress Level
            </Label>
            <span className="text-sm font-medium">{stressLevel}/10</span>
          </div>
          <Slider
            value={[stressLevel]}
            onValueChange={(value) => setStressLevel(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          How often do you exercise? *
        </Label>
        <RadioGroup value={exerciseFrequency} onValueChange={setExerciseFrequency}>
          {exerciseOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="cursor-pointer flex-1">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {(stressLevel >= 8 || sleepQuality <= 3) && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            We notice you may be experiencing significant stress or sleep challenges. Our coaches specialize in holistic wellness approaches that can help.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}