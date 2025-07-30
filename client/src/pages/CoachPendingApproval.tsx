import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Mail, Phone, User } from "lucide-react";
import { useLocation } from "wouter";

export default function CoachPendingApproval() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Clock className="w-16 h-16 text-yellow-500" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Application Under Review
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thank you for applying to become a WholeWellness coach! Your application is being reviewed by our team.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Application Submitted Successfully
            </CardTitle>
            <CardDescription>
              We've received your coaching application and supporting materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Our team will review your credentials and experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>We may contact you for a brief interview or additional information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You'll receive notification of our decision via email within 3-5 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>If approved, you'll gain access to the coach dashboard and training materials</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Review Timeline</h3>
                <p className="text-blue-700">
                  Most applications are reviewed within <strong>3-5 business days</strong>. 
                  Complex applications or those requiring additional verification may take up to 7 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Need to Update Your Application?
            </CardTitle>
            <CardDescription>
              If you need to add information or have questions about your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                If you realize you forgot to include important credentials or want to update your application, 
                please contact our coaching team directly.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-gray-600">coaching@wholewellnesscoaching.org</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-sm text-gray-600">(555) 123-WELL</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Explore While You Wait
            </CardTitle>
            <CardDescription>
              Learn more about our platform and coaching approach.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                While your application is being reviewed, feel free to explore our platform as a client 
                to better understand the experience you'll be supporting.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/about')}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Learn About Our Mission
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/mental-wellness')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Explore Wellness Resources
                </Button>
                
                <Button 
                  onClick={() => setLocation('/')}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Return to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}