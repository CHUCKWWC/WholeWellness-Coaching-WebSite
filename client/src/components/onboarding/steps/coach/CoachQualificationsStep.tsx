import { useEffect, useState } from 'react';
import { useOnboarding } from '../../OnboardingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, GraduationCap, Award, FileText } from 'lucide-react';

interface CoachQualificationsStepProps {
  onValidChange: (isValid: boolean) => void;
}

interface Certification {
  id: string;
  type: string;
  title: string;
  organization: string;
  year: string;
}

const certificationTypes = [
  { value: 'coaching', label: 'Life/Wellness Coaching Certification' },
  { value: 'counseling', label: 'Counseling Degree/License' },
  { value: 'therapy', label: 'Therapy License' },
  { value: 'social-work', label: 'Social Work License' },
  { value: 'nursing', label: 'Nursing Degree/License' },
  { value: 'nutrition', label: 'Nutrition Certification' },
  { value: 'fitness', label: 'Fitness/Personal Training' },
  { value: 'other', label: 'Other Relevant Certification' }
];

export default function CoachQualificationsStep({ onValidChange }: CoachQualificationsStepProps) {
  const { data, updateData } = useOnboarding();
  const [certifications, setCertifications] = useState<Certification[]>((data as any).certifications || []);
  const [yearsOfExperience, setYearsOfExperience] = useState((data as any).yearsOfExperience || '');
  const [backgroundCheckConsent, setBackgroundCheckConsent] = useState((data as any).backgroundCheckConsent || false);

  useEffect(() => {
    const isValid = certifications.length > 0 && 
                   certifications.every(cert => cert.title && cert.organization && cert.year) &&
                   yearsOfExperience !== '' && 
                   backgroundCheckConsent;
    onValidChange(isValid);
  }, [certifications, yearsOfExperience, backgroundCheckConsent, onValidChange]);

  useEffect(() => {
    updateData({
      certifications: certifications.map(cert => ({
        type: cert.type,
        title: cert.title,
        organization: cert.organization,
        year: cert.year
      })),
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      backgroundCheckConsent
    });
  }, [certifications, yearsOfExperience, backgroundCheckConsent, updateData]);

  const addCertification = () => {
    setCertifications([...certifications, {
      id: Date.now().toString(),
      type: 'coaching',
      title: '',
      organization: '',
      year: ''
    }]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  return (
    <div className="space-y-6">
      <Alert>
        <GraduationCap className="h-4 w-4" />
        <AlertDescription>
          Share your professional qualifications and experience. We require at least one relevant certification to ensure quality support for our clients.
        </AlertDescription>
      </Alert>

      <div>
        <Label>Years of Experience in Coaching/Support Work</Label>
        <Input
          type="number"
          placeholder="5"
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          min="0"
          max="50"
          className="w-32 mt-2"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Professional Certifications & Licenses</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCertification}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </Button>
        </div>

        {certifications.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Award className="h-12 w-12 mb-2" />
              <p>No certifications added yet</p>
              <p className="text-sm">Click "Add Certification" to get started</p>
            </CardContent>
          </Card>
        )}

        {certifications.map((cert, index) => (
          <Card key={cert.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Certification {index + 1}</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(cert.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Certification Type</Label>
                <select
                  value={cert.type}
                  onChange={(e) => updateCertification(cert.id, 'type', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  {certificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Certification/Degree Title</Label>
                <Input
                  placeholder="e.g., Certified Life Coach"
                  value={cert.title}
                  onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                />
              </div>

              <div>
                <Label>Issuing Organization</Label>
                <Input
                  placeholder="e.g., International Coach Federation"
                  value={cert.organization}
                  onChange={(e) => updateCertification(cert.id, 'organization', e.target.value)}
                />
              </div>

              <div>
                <Label>Year Obtained</Label>
                <Input
                  type="number"
                  placeholder="2020"
                  value={cert.year}
                  onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                  min="1970"
                  max={new Date().getFullYear()}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="background-check"
              checked={backgroundCheckConsent}
              onCheckedChange={(checked) => setBackgroundCheckConsent(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="background-check" className="cursor-pointer font-medium">
                Background Check Consent *
              </Label>
              <p className="text-sm text-gray-600">
                I consent to a background check as part of the application process. This is required to ensure the safety of our clients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}