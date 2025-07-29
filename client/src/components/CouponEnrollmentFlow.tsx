import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Percent,
  Gift,
  Loader2
} from 'lucide-react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  creditHours: string;
  instructorName: string;
  courseImageUrl?: string;
}

interface CouponValidation {
  valid: boolean;
  error?: string;
  coupon?: {
    id: string;
    code: string;
    name: string;
    description: string;
    discount_type: string;
    discount_value: number;
    minimum_order_amount: number;
  };
}

interface DiscountCalculation {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  coupon: {
    code: string;
    name: string;
    description: string;
  };
}

interface CouponEnrollmentFlowProps {
  course: Course;
  onEnrollmentSuccess: (enrollment: any) => void;
  onCancel: () => void;
}

const PaymentForm = ({ 
  course, 
  discountData, 
  couponCode, 
  onSuccess 
}: { 
  course: Course;
  discountData: DiscountCalculation | null;
  couponCode: string;
  onSuccess: (result: any) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // If final amount is 0 (free access), process without payment
      if (discountData && discountData.finalAmount === 0) {
        const result = await apiRequest("POST", "/api/courses/enroll-with-payment", {
          courseId: course.id,
          couponCode,
          paymentIntentId: null
        });
        
        onSuccess(result);
        return;
      }

      // Create payment intent first
      const paymentIntentResponse = await apiRequest("POST", "/api/create-payment-intent", {
        amount: Math.round((discountData?.finalAmount || course.price) * 100), // Convert to cents
        description: `Enrollment in ${course.title}`,
        currency: 'usd'
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Process enrollment with payment verification
        const result = await apiRequest("POST", "/api/courses/enroll-with-payment", {
          courseId: course.id,
          couponCode,
          paymentIntentId: paymentIntentResponse.paymentIntentId
        });
        
        onSuccess(result);
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to process enrollment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const finalAmount = discountData?.finalAmount || course.price;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {finalAmount > 0 && (
        <div>
          <Label className="text-base font-medium mb-4 block">Payment Information</Label>
          <div className="border rounded-lg p-4">
            <PaymentElement 
              options={{
                layout: "tabs"
              }}
            />
          </div>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={(!stripe && finalAmount > 0) || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : finalAmount === 0 ? (
          <>
            <Gift className="h-4 w-4 mr-2" />
            Enroll for Free
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay ${finalAmount.toFixed(2)} & Enroll
          </>
        )}
      </Button>
    </form>
  );
};

export default function CouponEnrollmentFlow({ 
  course, 
  onEnrollmentSuccess, 
  onCancel 
}: CouponEnrollmentFlowProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [discountData, setDiscountData] = useState<DiscountCalculation | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponValidation(null);
      setDiscountData(null);
      return;
    }

    setIsValidatingCoupon(true);
    
    try {
      const validation = await apiRequest("POST", "/api/coupons/validate", {
        code: couponCode.toUpperCase(),
        courseId: course.id
      });

      setCouponValidation(validation);

      if (validation.valid) {
        // Calculate discount
        const discountCalc = await apiRequest("POST", "/api/coupons/calculate-discount", {
          code: couponCode.toUpperCase(),
          courseId: course.id,
          originalAmount: course.price
        });

        setDiscountData(discountCalc);
        
        toast({
          title: "Coupon Applied",
          description: `${discountCalc.coupon.name} applied successfully!`,
        });
      } else {
        setDiscountData(null);
        toast({
          title: "Invalid Coupon",
          description: validation.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setCouponValidation({ valid: false, error: "Failed to validate coupon" });
      setDiscountData(null);
      toast({
        title: "Validation Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
    setDiscountData(null);
  };

  const proceedToPayment = async () => {
    const finalAmount = discountData?.finalAmount || course.price;
    
    if (finalAmount > 0) {
      try {
        // Create payment intent for Stripe Elements
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          amount: Math.round(finalAmount * 100), // Convert to cents
          description: `Enrollment in ${course.title}`,
          currency: 'usd'
        });
        
        setClientSecret(response.clientSecret);
      } catch (error) {
        toast({
          title: "Payment Setup Failed",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setShowPayment(true);
  };

  const handleEnrollmentSuccess = (result: any) => {
    toast({
      title: "Enrollment Successful!",
      description: `You've been enrolled in ${course.title}`,
    });
    onEnrollmentSuccess(result);
  };

  const getDiscountBadge = () => {
    if (!couponValidation?.valid || !couponValidation.coupon) return null;

    const coupon = couponValidation.coupon;
    switch (coupon.discount_type) {
      case 'percentage':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Percent className="h-3 w-3 mr-1" />
            {coupon.discount_value}% OFF
          </Badge>
        );
      case 'fixed_amount':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <DollarSign className="h-3 w-3 mr-1" />
            ${coupon.discount_value} OFF
          </Badge>
        );
      case 'free_access':
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Gift className="h-3 w-3 mr-1" />
            FREE ACCESS
          </Badge>
        );
      default:
        return null;
    }
  };

  if (showPayment) {
    const finalAmount = discountData?.finalAmount || course.price;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Enrollment
            </CardTitle>
            <CardDescription>
              Finalize your enrollment in {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>Course Fee</span>
                <span>${course.price.toFixed(2)}</span>
              </div>
              
              {discountData && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discountData.coupon.name})</span>
                  <span>-${discountData.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {finalAmount === 0 ? (
              <PaymentForm
                course={course}
                discountData={discountData}
                couponCode={couponCode}
                onSuccess={handleEnrollmentSuccess}
              />
            ) : (
              <Elements 
                stripe={stripePromise} 
                options={{
                  clientSecret: clientSecret || undefined,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <PaymentForm
                  course={course}
                  discountData={discountData}
                  couponCode={couponCode}
                  onSuccess={handleEnrollmentSuccess}
                />
              </Elements>
            )}

            <Button 
              variant="outline" 
              onClick={() => setShowPayment(false)}
              className="w-full mt-4"
            >
              Back to Course Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {course.courseImageUrl && (
              <img 
                src={course.courseImageUrl} 
                alt={course.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="mt-1">
                Instructor: {course.instructorName} • {course.creditHours} CE Credits
              </CardDescription>
              <div className="mt-2">
                <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
                  ${course.price.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Coupon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Apply Coupon Code
          </CardTitle>
          <CardDescription>
            Have a discount code? Enter it below to apply savings to your enrollment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
              />
            </div>
            <Button 
              onClick={validateCoupon}
              disabled={!couponCode.trim() || isValidatingCoupon}
              variant="outline"
            >
              {isValidatingCoupon ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Apply"
              )}
            </Button>
          </div>

          {couponValidation && (
            <Alert className={couponValidation.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-start gap-2">
                {couponValidation.valid ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className={couponValidation.valid ? "text-green-800" : "text-red-800"}>
                    {couponValidation.valid ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{couponValidation.coupon?.name}</span>
                          {getDiscountBadge()}
                        </div>
                        <p className="text-sm">{couponValidation.coupon?.description}</p>
                      </div>
                    ) : (
                      couponValidation.error
                    )}
                  </AlertDescription>
                </div>
                {couponValidation.valid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Course Fee</span>
              <span>${course.price.toFixed(2)}</span>
            </div>
            
            {discountData && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({discountData.coupon.name})</span>
                <span>-${discountData.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${(discountData?.finalAmount || course.price).toFixed(2)}</span>
            </div>
            
            {discountData?.finalAmount === 0 && (
              <div className="text-center">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Gift className="h-3 w-3 mr-1" />
                  FREE ACCESS GRANTED
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={proceedToPayment} className="flex-1">
              {discountData?.finalAmount === 0 ? "Enroll for Free" : "Proceed to Payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}