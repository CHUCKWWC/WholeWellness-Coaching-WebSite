import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, Users, Video, Phone } from "lucide-react";
import BookingForm from "@/components/BookingForm";

export default function Booking() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const services = [
    {
      id: "consultation",
      title: "Free Initial Consultation",
      duration: "30 minutes",
      price: "Free",
      description: "Get to know our approach and determine if we're the right fit for your needs.",
      features: [
        "Confidential conversation",
        "Assessment of your situation",
        "Explanation of our services",
        "Discussion of payment options",
        "No pressure or obligation"
      ],
      recommended: true
    },
    {
      id: "individual",
      title: "Individual Coaching Session",
      duration: "60 minutes",
      price: "Sliding scale: $50-$200",
      description: "One-on-one coaching session tailored to your specific goals and challenges.",
      features: [
        "Personalized coaching plan",
        "Goal setting and action planning",
        "Skill building exercises",
        "Between-session support",
        "Progress tracking"
      ],
      recommended: false
    },
    {
      id: "intensive",
      title: "Intensive Support Package",
      duration: "Multiple sessions",
      price: "Custom pricing",
      description: "Comprehensive support package for those needing more intensive guidance.",
      features: [
        "Weekly coaching sessions",
        "Crisis support between sessions",
        "Resource library access",
        "Group program participation",
        "Extended support timeline"
      ],
      recommended: false
    }
  ];

  const sessionFormats = [
    {
      icon: <Video className="w-6 h-6" />,
      title: "Video Call",
      description: "Secure, confidential video sessions from the comfort of your home"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Call",
      description: "Traditional phone sessions for those who prefer voice-only communication"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Group Session",
      description: "Connect with others in supportive group coaching environments"
    }
  ];

  const preparationTips = [
    "Find a quiet, private space where you won't be interrupted",
    "Prepare a list of questions or topics you'd like to discuss",
    "Think about your current challenges and what you hope to achieve",
    "Have a notebook ready to jot down insights and action items",
    "Ensure you have a stable internet connection for video calls"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            Schedule Your Session
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Take the first step towards transformation. Choose the session type that's right for you 
            and let's begin your journey together.
          </p>
        </div>
      </section>

      {/* Service Selection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Choose Your Service</h2>
            <p className="text-lg text-gray-600">
              Select the type of session that best fits your needs and comfort level
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedService === service.id ? 'ring-2 ring-primary' : ''
                } ${service.recommended ? 'relative' : ''}`}
                onClick={() => setSelectedService(service.id)}
              >
                {service.recommended && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Recommended
                  </Badge>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-secondary mb-2">{service.title}</h3>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-4">{service.price}</div>
                    <p className="text-gray-600">{service.description}</p>
                  </div>

                  <div className="space-y-3">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full mt-6 ${
                      selectedService === service.id 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedService === service.id ? 'Selected' : 'Select This Service'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Session Formats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Session Formats</h2>
            <p className="text-lg text-gray-600">
              We offer flexible session formats to accommodate your preferences and comfort level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sessionFormats.map((format, index) => (
              <Card key={index} className="bg-white text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {format.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-3">{format.title}</h3>
                  <p className="text-gray-600">{format.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-16 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start with our comprehensive assessment to get matched with the perfect coach for your needs.
            </p>
            <Link href="/digital-onboarding">
              <Button size="lg" className="bg-primary text-white hover:bg-secondary transition-colors shadow-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Preparation Guide */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Preparing for Your Session</h2>
            <p className="text-lg text-gray-600">
              Tips to help you get the most out of your coaching experience
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-6">Before Your Session</h3>
                  <ul className="space-y-4">
                    {preparationTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-primary text-white rounded-full p-1 w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-6">What to Expect</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="w-6 h-6 text-primary mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-secondary">Flexible Scheduling</h4>
                        <p className="text-gray-600">We work around your schedule, including evenings and weekends</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle2 className="w-6 h-6 text-primary mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-secondary">Confidential Environment</h4>
                        <p className="text-gray-600">All sessions are completely private and confidential</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="w-6 h-6 text-primary mr-3 mt-1" />
                      <div>
                        <h4 className="font-semibold text-secondary">Supportive Approach</h4>
                        <p className="text-gray-600">Non-judgmental, compassionate coaching tailored to your needs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Financial Assistance */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Financial Assistance Available
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Don't let cost be a barrier to getting the support you need. We offer sliding scale pricing 
            and scholarships based on financial need.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">75%</div>
              <div className="opacity-90">Receive Reduced Cost Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Free</div>
              <div className="opacity-90">Consultations for Everyone</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$0-$200</div>
              <div className="opacity-90">Sliding Scale Range</div>
            </div>
          </div>
          <p className="mt-8 opacity-90">
            During your consultation, we'll discuss pricing options that work for your situation.
          </p>
        </div>
      </section>
    </div>
  );
}
