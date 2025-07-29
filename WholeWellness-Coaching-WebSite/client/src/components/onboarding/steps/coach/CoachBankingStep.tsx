import { useEffect, useState } from 'react';
import { useOnboarding } from '../../OnboardingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DollarSign, Shield, Info } from 'lucide-react';

interface CoachBankingStepProps {
  onValidChange: (isValid: boolean) => void;
}

export default function CoachBankingStep({ onValidChange }: CoachBankingStepProps) {
  const { data, updateData } = useOnboarding();
  const [paymentMethod, setPaymentMethod] = useState((data as any).paymentMethod || 'direct_deposit');
  const [bankName, setBankName] = useState((data as any).bankingInfo?.bankName || '');
  const [accountType, setAccountType] = useState((data as any).bankingInfo?.accountType || 'checking');
  const [accountNumber, setAccountNumber] = useState((data as any).bankingInfo?.accountNumber || '');
  const [routingNumber, setRoutingNumber] = useState((data as any).bankingInfo?.routingNumber || '');
  const [accountHolderName, setAccountHolderName] = useState((data as any).bankingInfo?.accountHolderName || '');

  useEffect(() => {
    const isValid = paymentMethod === 'direct_deposit' 
      ? (bankName && accountNumber && routingNumber && accountHolderName) !== ''
      : true;
    onValidChange(isValid);
  }, [paymentMethod, bankName, accountNumber, routingNumber, accountHolderName, onValidChange]);

  useEffect(() => {
    updateData({
      paymentMethod,
      bankingInfo: paymentMethod === 'direct_deposit' ? {
        bankName,
        accountType,
        accountNumber,
        routingNumber,
        accountHolderName
      } : null
    });
  }, [paymentMethod, bankName, accountType, accountNumber, routingNumber, accountHolderName, updateData]);

  return (
    <div className="space-y-6">
      <Alert>
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          Set up your payment preferences. All financial information is encrypted and secure.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Label>Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="direct_deposit" id="direct_deposit" />
            <Label htmlFor="direct_deposit" className="cursor-pointer flex-1">
              Direct Deposit (Recommended)
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="check" id="check" />
            <Label htmlFor="check" className="cursor-pointer flex-1">
              Paper Check
            </Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === 'direct_deposit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Banking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Your banking information is encrypted and only used for coach payments. We use bank-level security to protect your data.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                placeholder="Chase Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input
                id="account-holder"
                placeholder="Jane Doe"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
              />
              <p className="text-sm text-gray-600 mt-1">Must match the name on your bank account</p>
            </div>

            <div>
              <Label>Account Type</Label>
              <RadioGroup value={accountType} onValueChange={setAccountType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="checking" id="checking" />
                  <Label htmlFor="checking">Checking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="savings" id="savings" />
                  <Label htmlFor="savings">Savings</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="routing">Routing Number</Label>
              <Input
                id="routing"
                placeholder="123456789"
                value={routingNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 9) setRoutingNumber(value);
                }}
                maxLength={9}
              />
              <p className="text-sm text-gray-600 mt-1">9-digit routing number</p>
            </div>

            <div>
              <Label htmlFor="account">Account Number</Label>
              <Input
                id="account"
                placeholder="1234567890"
                value={accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setAccountNumber(value);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {paymentMethod === 'check' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Paper checks will be mailed to the address you provided in your application. Processing time is 5-7 business days.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Compensation Details</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Starting rate: $50-75 per session based on experience</li>
            <li>• Payments processed bi-weekly</li>
            <li>• All taxes are your responsibility (1099 contractor)</li>
            <li>• Performance bonuses available after 3 months</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}