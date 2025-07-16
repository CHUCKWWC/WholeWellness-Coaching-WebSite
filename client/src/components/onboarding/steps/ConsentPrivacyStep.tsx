import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, FileText, Lock, Info } from 'lucide-react';

interface ConsentPrivacyStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function ConsentPrivacyStep({ onValidChange }: ConsentPrivacyStepProps) {
  const { data, updateData } = useOnboarding();
  const [termsAccepted, setTermsAccepted] = useState(data.termsAccepted || false);
  const [privacyAccepted, setPrivacyAccepted] = useState(data.privacyAccepted || false);
  const [dataConsentAccepted, setDataConsentAccepted] = useState(data.dataConsentAccepted || false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const isValid = termsAccepted && privacyAccepted && dataConsentAccepted;
    onValidChange(isValid);
  }, [termsAccepted, privacyAccepted, dataConsentAccepted, onValidChange]);

  useEffect(() => {
    updateData({
      termsAccepted,
      privacyAccepted,
      dataConsentAccepted
    });
  }, [termsAccepted, privacyAccepted, dataConsentAccepted, updateData]);

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your privacy and security are our top priorities. Please review and accept our policies.
        </AlertDescription>
      </Alert>

      {/* Data Protection Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            How We Protect Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
            <p className="text-sm">All data is encrypted using industry-standard SSL/TLS protocols</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
            <p className="text-sm">Your personal information is never sold or shared with third parties</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
            <p className="text-sm">Coaches only see information relevant to providing you support</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 mt-2"></div>
            <p className="text-sm">You can request deletion of your data at any time</p>
          </div>
        </CardContent>
      </Card>

      {/* Terms of Service */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="cursor-pointer">
                I accept the Terms of Service *
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                By accepting, you agree to our service terms including coaching scope, session policies, and refund conditions.
              </p>
              <Button
                variant="link"
                size="sm"
                className="px-0 mt-1"
                onClick={() => setShowTerms(!showTerms)}
              >
                <FileText className="h-4 w-4 mr-1" />
                {showTerms ? 'Hide' : 'Read'} Terms of Service
              </Button>
              {showTerms && (
                <Card className="mt-3">
                  <CardContent className="pt-4 max-h-64 overflow-y-auto text-sm">
                    <h4 className="font-semibold mb-2">Terms of Service Summary</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-600">
                      <li>Coaching is not a substitute for medical or psychological treatment</li>
                      <li>Sessions are confidential within legal and ethical boundaries</li>
                      <li>24-hour cancellation policy applies to all sessions</li>
                      <li>Payments are processed securely through our platform</li>
                      <li>You may change coaches if not satisfied with your match</li>
                      <li>Full terms available at wholewellnesscoaching.org/terms</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="privacy" className="cursor-pointer">
                I accept the Privacy Policy *
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                We are committed to protecting your privacy and handling your data responsibly.
              </p>
              <Button
                variant="link"
                size="sm"
                className="px-0 mt-1"
                onClick={() => setShowPrivacy(!showPrivacy)}
              >
                <FileText className="h-4 w-4 mr-1" />
                {showPrivacy ? 'Hide' : 'Read'} Privacy Policy
              </Button>
              {showPrivacy && (
                <Card className="mt-3">
                  <CardContent className="pt-4 max-h-64 overflow-y-auto text-sm">
                    <h4 className="font-semibold mb-2">Privacy Policy Summary</h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-600">
                      <li>We collect only necessary information for coaching services</li>
                      <li>Your data is stored securely and encrypted</li>
                      <li>We never sell your personal information</li>
                      <li>You have the right to access, modify, or delete your data</li>
                      <li>Communications with your coach are confidential</li>
                      <li>Full policy available at wholewellnesscoaching.org/privacy</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Consent */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              checked={dataConsentAccepted}
              onCheckedChange={(checked) => setDataConsentAccepted(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="consent" className="cursor-pointer">
                I consent to secure data processing *
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                I understand that my responses will be used to match me with an appropriate coach and to provide personalized support. All data is handled according to our privacy policy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Rights:</strong> You can withdraw consent, request data deletion, or modify your information at any time through your account settings or by contacting support@wholewellnesscoaching.org
        </AlertDescription>
      </Alert>
    </div>
  );
}