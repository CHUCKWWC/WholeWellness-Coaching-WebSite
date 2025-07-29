import { useEffect, useState } from 'react';
import { useOnboarding } from '../../OnboardingContext';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Brain, Users, Shield, Moon, Activity } from 'lucide-react';

interface CoachSpecializationsStepProps {
  onValidChange: (isValid: boolean) => void;
}

const specializationOptions = [
  { 
    id: 'trauma-recovery', 
    label: 'Trauma Recovery', 
    description: 'Supporting survivors of domestic violence and trauma',
    icon: Shield
  },
  { 
    id: 'grief-loss', 
    label: 'Grief & Loss', 
    description: 'Helping clients through bereavement and loss',
    icon: Heart
  },
  { 
    id: 'life-transitions', 
    label: 'Life Transitions', 
    description: 'Divorce, career changes, major life shifts',
    icon: Users
  },
  { 
    id: 'mental-health', 
    label: 'Mental Health Support', 
    description: 'Depression, anxiety, stress management',
    icon: Brain
  },
  { 
    id: 'wellness-nutrition', 
    label: 'Wellness & Nutrition', 
    description: 'Weight loss, healthy lifestyle, nutrition coaching',
    icon: Activity
  },
  { 
    id: 'relationships', 
    label: 'Relationships', 
    description: 'Communication, boundaries, healthy relationships',
    icon: Heart
  },
  { 
    id: 'self-care', 
    label: 'Self-Care & Mindfulness', 
    description: 'Meditation, stress reduction, self-compassion',
    icon: Moon
  }
];

export default function CoachSpecializationsStep({ onValidChange }: CoachSpecializationsStepProps) {
  const { data, updateData } = useOnboarding();
  const [specializations, setSpecializations] = useState<string[]>((data as any).specializations || []);

  useEffect(() => {
    const isValid = specializations.length >= 1 && specializations.length <= 4;
    onValidChange(isValid);
  }, [specializations, onValidChange]);

  useEffect(() => {
    updateData({ specializations });
  }, [specializations, updateData]);

  const toggleSpecialization = (specializationId: string) => {
    setSpecializations(prev => {
      if (prev.includes(specializationId)) {
        return prev.filter(id => id !== specializationId);
      } else if (prev.length < 4) {
        return [...prev, specializationId];
      }
      return prev;
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          Select 1-4 areas where you have experience and passion for helping others. These will be matched with client needs.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base">Your Coaching Specializations</Label>
          <span className="text-sm text-gray-600">
            {specializations.length}/4 selected
          </span>
        </div>

        <div className="grid gap-3">
          {specializationOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = specializations.includes(option.id);
            const isDisabled = !isSelected && specializations.length >= 4;

            return (
              <Card 
                key={option.id} 
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-purple-500 bg-purple-50' : ''
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && toggleSpecialization(option.id)}
              >
                <CardContent className="flex items-start space-x-3 p-4">
                  <div className={`mt-1 p-2 rounded-lg ${
                    isSelected ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isSelected ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => !isDisabled && toggleSpecialization(option.id)}
                      />
                      <Label className="cursor-pointer font-medium">
                        {option.label}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 ml-6">
                      {option.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {specializations.length === 0 && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="text-amber-800">
            Please select at least one specialization to continue.
          </AlertDescription>
        </Alert>
      )}

      {specializations.length === 4 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            You've selected the maximum number of specializations. Deselect one to choose a different area.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}