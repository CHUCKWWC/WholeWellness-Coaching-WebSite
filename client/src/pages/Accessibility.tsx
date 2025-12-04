import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  Ear, 
  Hand, 
  Brain, 
  Keyboard, 
  Monitor,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";

export default function Accessibility() {
  const accessibilityFeatures = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Visual Accessibility",
      description: "High contrast colors, scalable text, and screen reader compatibility to ensure content is accessible for users with visual impairments.",
      features: ["High contrast mode support", "Scalable fonts up to 200%", "Alt text for all images", "Focus indicators for navigation"]
    },
    {
      icon: <Ear className="w-8 h-8" />,
      title: "Hearing Accessibility",
      description: "Captions and transcripts available for audio and video content, ensuring deaf and hard-of-hearing users can access all information.",
      features: ["Video captions available", "Text transcripts for audio", "Visual indicators for alerts", "Written communication options"]
    },
    {
      icon: <Hand className="w-8 h-8" />,
      title: "Motor Accessibility",
      description: "Full keyboard navigation and large touch targets for users with motor impairments or those using assistive devices.",
      features: ["Full keyboard navigation", "Large clickable areas (48px minimum)", "No time-limited interactions", "Skip navigation links"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Cognitive Accessibility",
      description: "Clear language, consistent navigation, and structured content to support users with cognitive or learning disabilities.",
      features: ["Plain language content", "Consistent navigation patterns", "Clear error messages", "Progress indicators for forms"]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary dark:text-white mb-6">
            Accessibility Statement
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Wholewellness Coaching is committed to making our website accessible to all users, 
            regardless of ability. We strive to meet WCAG 2.1 Level AA standards.
          </p>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-secondary dark:text-white mb-4">
              Our Commitment to Accessibility
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              At Wholewellness Coaching, we believe that everyone deserves equal access to 
              wellness support and resources. As a nonprofit dedicated to serving underserved 
              communities, accessibility is not just a legal requirement—it's a core value that 
              reflects our mission of empowering all individuals.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We continuously work to improve the accessibility of our website and digital 
              services. Our team regularly reviews our platform and implements updates to 
              ensure compliance with the Web Content Accessibility Guidelines (WCAG) 2.1.
            </p>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary dark:text-white mb-4">
              Accessibility Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our website includes the following accessibility features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {accessibilityFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-white rounded-full p-3 mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-secondary dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Assistive Technology Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-secondary dark:text-white mb-6">
            Assistive Technology Compatibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <Keyboard className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Keyboard Navigation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  All interactive elements can be accessed using keyboard-only navigation
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Monitor className="w-6 h-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Screen Readers</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Compatible with NVDA, JAWS, VoiceOver, and other screen readers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Help Us Improve
          </h2>
          <p className="text-xl opacity-90 mb-8">
            We welcome your feedback on the accessibility of our website. If you encounter 
            any barriers or have suggestions for improvement, please let us know.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a 
              href="mailto:accessibility@wholewellnesscoaching.org"
              className="flex items-center bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              data-testid="link-accessibility-email"
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </a>
            <a 
              href="tel:+12102012422"
              className="flex items-center bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              data-testid="link-accessibility-phone"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </a>
            <Link href="/contact">
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
                data-testid="button-accessibility-contact"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Form
              </Button>
            </Link>
          </div>

          <p className="text-sm opacity-75">
            Email: accessibility@wholewellnesscoaching.org | Phone: (210) 201-2422
          </p>
        </div>
      </section>

      {/* Legal Note */}
      <section className="py-8 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This accessibility statement was last updated on December 2024. We review and 
            update our accessibility practices regularly to ensure continuous improvement.
          </p>
        </div>
      </section>
    </div>
  );
}
