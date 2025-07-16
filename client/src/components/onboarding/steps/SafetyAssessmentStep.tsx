import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Phone, AlertTriangle, Heart } from 'lucide-react';

interface SafetyAssessmentStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function SafetyAssessmentStep({ onValidChange }: SafetyAssessmentStepProps) {
  const { data, updateData } = useOnboarding();
  const [emergencyName, setEmergencyName] = useState(data.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(data.emergencyContact?.phone || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(data.emergencyContact?.relationship || '');
  const [safetyLevel, setSafetyLevel] = useState(data.currentSafetyLevel || 8);
  const [needsImmediate, setNeedsImmediate] = useState(data.needsImmediateSupport ? 'yes' : 'no');

  useEffect(() => {
    const isValid = emergencyName.length >= 2 && 
                   emergencyPhone.length === 10 && 
                   emergencyRelationship.length >= 2;
    onValidChange(isValid);
  }, [emergencyName, emergencyPhone, emergencyRelationship, onValidChange]);

  useEffect(() => {
    updateData({
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRelationship
      },
      currentSafetyLevel: safetyLevel,
      needsImmediateSupport: needsImmediate === 'yes'
    });
  }, [emergencyName, emergencyPhone, emergencyRelationship, safetyLevel, needsImmediate, updateData]);

  const getSafetyMessage = () => {
    if (safetyLevel <= 3) {
      return {
        type: 'destructive' as const,
        title: 'Immediate Support Available',
        message: 'Your safety is our top priority. We have crisis resources available immediately.',
        icon: AlertTriangle
      };
    } else if (safetyLevel <= 6) {
      return {
        type: 'default' as const,
        title: 'We\'re Here to Help',
        message: 'We understand you may be facing challenges. Our coaches are trained to provide appropriate support.',
        icon: Heart
      };
    }
    return null;
  };

  const safetyMessage = getSafetyMessage();

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This information helps us ensure your safety and provide appropriate support when needed.
        </AlertDescription>
      </Alert>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergency-name">Contact Name *</Label>
            <Input
              id="emergency-name"
              placeholder="Jane Smith"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emergency-phone">Contact Phone *</Label>
            <Input
              id="emergency-phone"
              placeholder="1234567890"
              value={emergencyPhone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setEmergencyPhone(value);
              }}
            />
            <p className="text-sm text-gray-600 mt-1">10-digit number without spaces or dashes</p>
          </div>

          <div>
            <Label htmlFor="emergency-relationship">Relationship *</Label>
            <Input
              id="emergency-relationship"
              placeholder="Friend, Family member, etc."
              value={emergencyRelationship}
              onChange={(e) => setEmergencyRelationship(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety Assessment */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              How safe do you currently feel in your environment?
            </Label>
            <span className="text-sm font-medium">{safetyLevel}/10</span>
          </div>
          <Slider
            value={[safetyLevel]}
            onValueChange={(value) => setSafetyLevel(value[0])}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>Not safe</span>
            <span>Very safe</span>
          </div>
        </div>

        {safetyMessage && (
          <Alert variant={safetyMessage.type}>
            <safetyMessage.icon className="h-4 w-4" />
            <AlertTitle>{safetyMessage.title}</AlertTitle>
            <AlertDescription>{safetyMessage.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Immediate Support */}
      <div className="space-y-3">
        <Label>Do you need immediate crisis support?</Label>
        <RadioGroup value={needsImmediate} onValueChange={setNeedsImmediate}>
          <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="yes" id="immediate-yes" />
            <Label htmlFor="immediate-yes" className="cursor-pointer flex-1">
              Yes, I need immediate support
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="no" id="immediate-no" />
            <Label htmlFor="immediate-no" className="cursor-pointer flex-1">
              No, I\'m okay for now
            </Label>
          </div>
        </RadioGroup>
      </div>

      {needsImmediate === 'yes' && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Crisis Resources Available</AlertTitle>
          <AlertDescription className="text-red-700 space-y-2">
            <p>Help is available right now:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>National Domestic Violence Hotline: 1-800-799-7233</li>
              <li>Crisis Text Line: Text HOME to 741741</li>
              <li>Emergency Services: 911</li>
            </ul>
            <p className="mt-2">Our team will also reach out within 24 hours.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}