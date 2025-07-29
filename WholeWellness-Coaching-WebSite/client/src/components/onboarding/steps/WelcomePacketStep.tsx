import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Shield, Heart, BookOpen, CheckCircle } from 'lucide-react';

interface WelcomePacketStepProps {
  onValidChange: (isValid: boolean) => void;
}

interface Document {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  required: boolean;
  acknowledged: boolean;
}

export default function WelcomePacketStep({ onValidChange }: WelcomePacketStepProps) {
  const { data, updateData } = useOnboarding();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'service-agreement',
      title: 'Service Agreement',
      description: 'Our coaching services, terms, and your rights',
      icon: <FileText className="h-5 w-5" />,
      required: true,
      acknowledged: false
    },
    {
      id: 'privacy-policy',
      title: 'Privacy & Confidentiality Policy',
      description: 'How we protect your information and maintain confidentiality',
      icon: <Shield className="h-5 w-5" />,
      required: true,
      acknowledged: false
    },
    {
      id: 'program-guide',
      title: 'Program Guide',
      description: 'Overview of our coaching programs and what to expect',
      icon: <BookOpen className="h-5 w-5" />,
      required: false,
      acknowledged: false
    },
    {
      id: 'wellness-resources',
      title: 'Wellness Resources',
      description: 'Tools, worksheets, and resources for your journey',
      icon: <Heart className="h-5 w-5" />,
      required: false,
      acknowledged: false
    }
  ]);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  useEffect(() => {
    const requiredDocs = documents.filter(doc => doc.required);
    const allRequiredAcknowledged = requiredDocs.every(doc => doc.acknowledged);
    const isValid = allRequiredAcknowledged && agreedToTerms && agreedToPrivacy;
    onValidChange(isValid);
  }, [documents, agreedToTerms, agreedToPrivacy, onValidChange]);

  const handleDocumentReview = (docId: string) => {
    // In production, this would open the actual document
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, acknowledged: true } : doc
      )
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Please review these important documents before continuing. They outline our services, your rights, and how we work together.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className={doc.acknowledged ? 'border-green-500' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    doc.acknowledged ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                  }`}>
                    {doc.acknowledged ? <CheckCircle className="h-5 w-5" /> : doc.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {doc.title}
                      {doc.required && <span className="text-red-500 text-sm">*</span>}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button 
                  variant={doc.acknowledged ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleDocumentReview(doc.id)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {doc.acknowledged ? 'Review Again' : 'Review Document'}
                </Button>
                {doc.acknowledged && (
                  <span className="text-sm text-green-600 font-medium">Reviewed ✓</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="terms" className="cursor-pointer font-medium">
                I agree to the Service Agreement and understand the coaching relationship *
              </Label>
              <p className="text-sm text-gray-600">
                I understand that coaching is not therapy or medical treatment, and I agree to the terms outlined in the service agreement.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={agreedToPrivacy}
              onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="privacy" className="cursor-pointer font-medium">
                I agree to the Privacy Policy and consent to secure communication *
              </Label>
              <p className="text-sm text-gray-600">
                I understand how my information will be protected and agree to communicate through secure channels provided by Whole Wellness Coaching.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• You'll receive copies of all documents via email</li>
          <li>• We'll schedule your discovery call</li>
          <li>• You'll get access to your client portal</li>
          <li>• Your coach will review your information before your first session</li>
        </ul>
      </div>
    </div>
  );
}