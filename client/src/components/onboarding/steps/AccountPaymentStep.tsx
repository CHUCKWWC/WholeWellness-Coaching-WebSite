import { useEffect, useState } from 'react';
import { useOnboarding } from '../OnboardingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock, Shield, Info } from 'lucide-react';

interface AccountPaymentStepProps {
  onValidChange: (isValid: boolean) => void;
}

const pricingPlans = [
  {
    id: 'weekly',
    name: 'Weekly Sessions',
    price: '$80/week',
    description: 'Best for active support and rapid progress',
    features: ['Unlimited messaging', 'Weekly 50-min sessions', 'Personalized action plans', 'Resource library access']
  },
  {
    id: 'biweekly',
    name: 'Bi-Weekly Sessions',
    price: '$160/month',
    description: 'Balanced support for steady growth',
    features: ['Unlimited messaging', 'Two sessions per month', 'Goal tracking tools', 'Resource library access']
  },
  {
    id: 'monthly',
    name: 'Monthly Sessions',
    price: '$90/month',
    description: 'Maintenance and check-in support',
    features: ['Unlimited messaging', 'One session per month', 'Email support', 'Resource library access']
  }
];

export default function AccountPaymentStep({ onValidChange }: AccountPaymentStepProps) {
  const { data, updateData } = useOnboarding();
  const [email, setEmail] = useState(data.email || '');
  const [phone, setPhone] = useState(data.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(data.selectedPlan || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingName, setBillingName] = useState('');

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email) &&
                   phone.length === 10 &&
                   password.length >= 8 &&
                   password === confirmPassword &&
                   selectedPlan !== '' &&
                   cardNumber.length === 16 &&
                   expiryDate.length === 5 &&
                   cvv.length === 3 &&
                   billingName.length >= 2;
    onValidChange(isValid);
  }, [email, phone, password, confirmPassword, selectedPlan, cardNumber, expiryDate, cvv, billingName, onValidChange]);

  useEffect(() => {
    updateData({
      email,
      phone,
      selectedPlan,
      // Note: We don't store sensitive payment data in the onboarding context
    });
  }, [email, phone, selectedPlan, updateData]);

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Create your secure account and select a plan to reserve your coach match.
        </AlertDescription>
      </Alert>

      {/* Account Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="1234567890"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setPhone(value.slice(0, 10));
              }}
            />
            <p className="text-sm text-gray-600 mt-1">10-digit number for appointment reminders</p>
          </div>

          <div>
            <Label htmlFor="password">Create Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm Password *</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Select Your Plan *</h3>
        <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-colors ${
                selectedPlan === plan.id ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value={plan.id} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <span className="font-bold text-lg text-purple-600">{plan.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is encrypted and processed securely through our PCI-compliant payment processor.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="billing-name">Name on Card *</Label>
            <Input
              id="billing-name"
              placeholder="John Doe"
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="card-number">Card Number *</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '');
                setCardNumber(value.slice(0, 16));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                maxLength={5}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCvv(value.slice(0, 3));
                }}
                maxLength={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Payment is required to reserve your coach and begin the matching process. You'll be matched within 24-48 hours after completing registration.
        </AlertDescription>
      </Alert>
    </div>
  );
}