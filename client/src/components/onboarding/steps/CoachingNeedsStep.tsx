import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Sparkles } from 'lucide-react';
import FormFieldHelp from '../FormFieldHelp';
import { motion } from 'framer-motion';

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
  { id: 'gender_female', label: 'Female coach preferred', category: 'gender' },
  { id: 'gender_male', label: 'Male coach preferred', category: 'gender' },
  { id: 'gender_no_preference', label: 'No gender preference', category: 'gender' },
  { id: 'age_similar', label: 'Similar age to me', category: 'age' },
  { id: 'age_older', label: 'Older/more experienced', category: 'age' },
  { id: 'age_no_preference', label: 'Age doesn\'t matter', category: 'age' },
  { id: 'background_similar', label: 'Similar cultural background', category: 'background' },
  { id: 'specialty_trauma', label: 'Trauma-informed approach', category: 'specialty' },
  { id: 'specialty_spiritual', label: 'Spiritually-oriented', category: 'specialty' },
  { id: 'specialty_practical', label: 'Practical/action-focused', category: 'specialty' }
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
    <div className="space-y-8">
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
        <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <AlertDescription className="text-purple-800 dark:text-purple-200">
          Understanding your needs helps us find the perfect coach match for you.
        </AlertDescription>
      </Alert>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center">
          <Label className="text-base font-semibold">
            What type of coaching are you seeking?
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <FormFieldHelp content="Choose the coaching style that best matches your current needs. You can always adjust this later based on your progress." />
        </div>
        
        <RadioGroup value={coachingType} onValueChange={setCoachingType}>
          <div className="grid gap-3 sm:grid-cols-2">
            {coachingTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    coachingType === type.id 
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  }`}
                  onClick={() => setCoachingType(type.id)}
                  data-testid={`card-coaching-type-${type.id}`}
                >
                  <CardContent className="flex items-center space-x-4 p-4">
                    <RadioGroupItem value={type.id} className="sr-only" />
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1 min-w-0">
                      <Label className="cursor-pointer font-medium text-gray-900 dark:text-white block">
                        {type.label}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {type.description}
                      </p>
                    </div>
                    {coachingType === type.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </RadioGroup>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center">
          <Label htmlFor="motivation" className="text-base font-semibold">
            What brings you to coaching at this time?
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <FormFieldHelp content="Share what's motivating you to seek coaching. This helps us understand your situation and find a coach with relevant experience." />
        </div>
        <Textarea
          id="motivation"
          placeholder="Please share what you hope to achieve through coaching and what challenges you're currently facing..."
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          className="min-h-[120px] text-base resize-none"
          data-testid="input-motivation"
        />
        <div className="flex justify-between text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Be as specific as you're comfortable sharing.
          </p>
          <p className={`${motivation.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
            {motivation.length}/20 min
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center">
          <Label className="text-base font-semibold">
            Coach preferences
            <span className="text-gray-400 ml-2 text-sm font-normal">(optional)</span>
          </Label>
          <FormFieldHelp content="These are preferences, not requirements. We'll do our best to match them, but sometimes the best coach might be different from what you initially expect." />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select any preferences that are important to you.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {coachPreferences.map((pref, index) => (
            <motion.div
              key={pref.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.03 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedPreferences.includes(pref.id) 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
                onClick={() => togglePreference(pref.id)}
                data-testid={`card-preference-${pref.id}`}
              >
                <CardContent className="flex items-center space-x-3 p-3">
                  <Checkbox 
                    checked={selectedPreferences.includes(pref.id)}
                    onCheckedChange={() => togglePreference(pref.id)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <Label className="cursor-pointer flex-1 text-sm font-normal">
                    {pref.label}
                  </Label>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
