import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface GoalsAndNeedsStepProps {
  onValidChange: (isValid: boolean) => void;
}

const challengeOptions = [
  { id: 'domestic-violence', label: 'Recovering from domestic violence' },
  { id: 'divorce', label: 'Going through divorce or separation' },
  { id: 'grief', label: 'Dealing with loss or grief' },
  { id: 'trauma', label: 'Healing from past trauma' },
  { id: 'anxiety', label: 'Managing anxiety or stress' },
  { id: 'depression', label: 'Coping with depression' },
  { id: 'self-esteem', label: 'Building self-confidence' },
  { id: 'relationships', label: 'Improving relationships' },
  { id: 'life-transition', label: 'Navigating major life changes' },
  { id: 'wellness', label: 'Overall wellness and self-care' }
];

const urgencyLevels = [
  { value: 'immediate', label: 'I need support right away (within 24-48 hours)' },
  { value: 'soon', label: 'I\'d like to start soon (within a week)' },
  { value: 'flexible', label: 'I\'m flexible with timing' },
  { value: 'exploring', label: 'Just exploring options for now' }
];

export default function GoalsAndNeedsStep({ onValidChange }: GoalsAndNeedsStepProps) {
  const { data, updateData } = useOnboarding();
  const [primaryGoal, setPrimaryGoal] = useState(data.primaryGoal || '');
  const [challenges, setChallenges] = useState<string[]>(data.specificChallenges || []);
  const [previousSupport, setPreviousSupport] = useState(data.previousSupport || '');
  const [urgencyLevel, setUrgencyLevel] = useState(data.urgencyLevel || '');

  useEffect(() => {
    const isValid = primaryGoal.length >= 10 && 
                   challenges.length > 0 && 
                   urgencyLevel !== '';
    onValidChange(isValid);
  }, [primaryGoal, challenges, urgencyLevel, onValidChange]);

  useEffect(() => {
    updateData({
      primaryGoal,
      specificChallenges: challenges,
      previousSupport,
      urgencyLevel
    });
  }, [primaryGoal, challenges, previousSupport, urgencyLevel, updateData]);

  const toggleChallenge = (challengeId: string) => {
    setChallenges(prev => 
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your responses help us match you with the right support. There are no wrong answers.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="primary-goal">
          What brings you to Whole Wellness Coaching today? *
        </Label>
        <Textarea
          id="primary-goal"
          placeholder="Share what you hope to achieve through our coaching services..."
          value={primaryGoal}
          onChange={(e) => setPrimaryGoal(e.target.value)}
          className="min-h-[100px]"
        />
        <p className="text-sm text-gray-600">Minimum 10 characters</p>
      </div>

      <div className="space-y-3">
        <Label>Which areas would you like support with? * (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {challengeOptions.map((option) => (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-colors ${
                challenges.includes(option.id) ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => toggleChallenge(option.id)}
            >
              <CardContent className="flex items-center space-x-2 p-3">
                <Checkbox
                  checked={challenges.includes(option.id)}
                  onCheckedChange={() => toggleChallenge(option.id)}
                />
                <Label className="cursor-pointer flex-1">{option.label}</Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="previous-support">
          Have you worked with a coach or therapist before? (Optional)
        </Label>
        <Textarea
          id="previous-support"
          placeholder="If yes, what was helpful? What would you like to be different this time?"
          value={previousSupport}
          onChange={(e) => setPreviousSupport(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-3">
        <Label>How soon would you like to begin? *</Label>
        <RadioGroup value={urgencyLevel} onValueChange={setUrgencyLevel}>
          {urgencyLevels.map((level) => (
            <div key={level.value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
              <RadioGroupItem value={level.value} id={level.value} />
              <Label htmlFor={level.value} className="cursor-pointer flex-1">
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {urgencyLevel === 'immediate' && (
        <Alert className="bg-purple-50 border-purple-200">
          <Info className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            We understand you need immediate support. Our team will prioritize your request and reach out within 24 hours.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}