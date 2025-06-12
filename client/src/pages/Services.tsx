import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const services = [
    {
      title: "Domestic Violence Recovery",
      icon: "🛡️",
      description: "Specialized support for survivors, focusing on rebuilding confidence, establishing boundaries, and creating a new path forward.",
      features: ["Free initial consultation", "Safety planning", "Trauma-informed approach", "Confidential support"],
      highlight: "Free consultation"
    },
    {
      title: "Divorce & Widowhood Support", 
      icon: "💔",
      description: "Guidance through major life transitions, helping you process grief, rediscover identity, and build a fulfilling new chapter.",
      features: ["Group & individual sessions", "Grief processing", "Identity rebuilding", "Future planning"],
      highlight: "Group support available"
    },
    {
      title: "Career Development",
      icon: "💼", 
      description: "Professional growth coaching to help you navigate career transitions, build confidence, and achieve your professional goals.",
      features: ["Skills assessment included", "Resume building", "Interview preparation", "Networking strategies"],
      highlight: "Skills assessment"
    },
    {
      title: "Life Balance Coaching",
      icon: "⚖️",
      description: "Holistic approach to wellness, helping you create harmony between personal, professional, and health goals.",
      features: ["Wellness toolkit provided", "Time management", "Stress reduction", "Goal setting"],
      highlight: "Wellness toolkit"
    },
    {
      title: "Relationship Coaching", 
      icon: "❤️",
      description: "Support for building healthy relationships, setting boundaries, and finding love and passion at any stage of life.",
      features: ["Communication tools", "Boundary setting", "Dating guidance", "Relationship skills"],
      highlight: "Communication tools"
    },
    {
      title: "Personal Development",
      icon: "🎓",
      description: "Self-discovery coaching to help you identify strengths, clarify goals, and develop the mindset for lasting positive change.",
      features: ["Resource library access", "Goal clarification", "Strength identification", "Mindset coaching"],
      highlight: "Resource library access"
    }
  ];

  const pricingTiers = [
    {
      name: "Community Support",
      price: "Free",
      description: "For those who qualify based on financial need",
      features: [
        "Initial consultation",
        "Monthly group sessions",
        "Resource library access",
        "Email support"
      ],
      highlighted: false
    },
    {
      name: "Affordable Coaching",
      price: "$50-100",
      description: "Sliding scale based on income",
      features: [
        "Bi-weekly individual sessions",
        "All community support features",
        "Personalized action plans",
        "Text check-ins between sessions"
      ],
      highlighted: true
    },
    {
      name: "Standard Coaching",
      price: "$150-200",
      description: "Full-service coaching experience",
      features: [
        "Weekly individual sessions",
        "All affordable coaching features",
        "Priority scheduling",
        "Custom resource development"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            Our Coaching Services
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Comprehensive coaching solutions tailored to your unique journey and circumstances. 
            We offer specialized support for life's most challenging transitions.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6 text-2xl">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Badge variant="secondary" className="mb-4">
                    {service.highlight}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Your journey to transformation in simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-4">Free Consultation</h3>
              <p className="text-gray-600">
                Start with a no-obligation 30-minute conversation to discuss your goals and our approach.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-4">Personalized Plan</h3>
              <p className="text-gray-600">
                We'll create a coaching plan tailored to your specific needs, goals, and financial situation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-4">Transform & Grow</h3>
              <p className="text-gray-600">
                Through regular sessions and ongoing support, you'll develop the tools and confidence to thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Accessible Pricing</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe cost should never be a barrier to getting the support you need. 
              Our sliding scale ensures everyone can access quality coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={tier.highlighted ? "ring-2 ring-primary relative" : ""}>
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-secondary mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-2">{tier.price}</div>
                  <p className="text-gray-600 mb-6">{tier.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/booking">
                    <Button 
                      className={`w-full ${tier.highlighted 
                        ? 'bg-primary text-white hover:bg-secondary' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Start Your Transformation?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Every journey begins with a single step. Let us help you take yours with confidence and support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Schedule Free Consultation
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
