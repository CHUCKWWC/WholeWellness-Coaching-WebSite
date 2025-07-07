import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Hero from "@/components/Hero";
import TestimonialCard from "@/components/TestimonialCard";
import BookingForm from "@/components/BookingForm";
import AuthForm from "@/components/AuthForm";
import OnboardingWelcome from "@/components/OnboardingWelcome";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Testimonial } from "@shared/schema";
import diverseWomanImg from "@assets/wwc_ (4)_1751919370276.jpg";
import curlyHairWomanImg from "@assets/wwc_ (2)_1751919370270.jpg";
import diversityIconsImg from "@assets/wwc_ (2)_1751919370272.webp";
import teamHandsImg from "@assets/wwc_ (9)_1751919370287.jpg";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users or first-time visitors
  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const coreValues = [
    {
      icon: "🤝",
      title: "Accessibility",
      description: "Making high-quality coaching available to all, regardless of financial circumstances."
    },
    {
      icon: "💪",
      title: "Empowerment",
      description: "Focusing on empowering women and underserved communities to overcome challenges."
    },
    {
      icon: "❤️",
      title: "Compassion",
      description: "Providing warm, understanding support for those navigating life transitions."
    },
    {
      icon: "🌱",
      title: "Growth",
      description: "Fostering self-discovery and continuous improvement for fulfilling lives."
    }
  ];

  return (
    <div>
      <Hero />
      
      {/* Mission & Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Our Mission & Vision</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We believe that high-quality life coaching should not be a privilege but a right, accessible to all who seek transformative support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src={diverseWomanImg} 
                alt="Professional African American woman in leadership coaching session" 
                className="rounded-2xl shadow-lg w-full h-auto" 
              />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-secondary mb-6">Our Mission</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Wholewellness Coaching is dedicated to providing high-quality coaching services to underserved individuals, especially women who have survived domestic violence, those who are newly widowed or divorced, and anyone else seeking transformative support.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to make coaching accessible to those who may not otherwise have access, offering affordable services for those who can pay and providing free or discounted services to individuals with financial constraints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold text-secondary mb-6">Our Vision</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We see a future where high-quality life coaching is not a privilege but a right, where technology bridges gaps and brings expert guidance to those who need it most.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our vision is of a global community where self-discovery and continuous improvement are celebrated, where individuals from all walks of life can find the coaching they need to thrive in relationships, careers, health, and personal growth.
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src={curlyHairWomanImg} 
                alt="Diverse woman with curly hair in supportive coaching environment" 
                className="rounded-2xl shadow-lg w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Diversity & Inclusion */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
                Diversity & Inclusion at Our Core
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                We celebrate and embrace the beautiful diversity of our community. Our coaching services are designed to meet the unique needs of individuals from all backgrounds, cultures, and life experiences.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Culturally sensitive coaching approaches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Multilingual support available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-gray-700">Safe space for all identities and experiences</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={diversityIconsImg} 
                alt="Colorful diverse figures representing our inclusive community" 
                className="rounded-2xl shadow-lg w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">Guiding principles that shape everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <Card key={index} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mb-4 text-2xl">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-warm to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Stories of Transformation</h2>
            <p className="text-lg text-gray-600">Real experiences from our coaching community</p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm animate-pulse">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div className="ml-4">
                      <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="w-5 h-5 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials?.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Schedule Your Free Consultation</h2>
            <p className="text-lg text-gray-600">Take the first step towards transformation. No commitment required.</p>
          </div>
          
          <BookingForm />
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">Get Involved</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Join our mission to make life coaching accessible to everyone. Every contribution helps transform lives and build stronger communities together.
              </p>
              <img 
                src={teamHandsImg} 
                alt="Diverse team joining hands in collaboration and unity" 
                className="rounded-2xl shadow-lg w-full h-auto" 
              />
            </div>
            <div>
              <div className="text-center">
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                  Together, we can create lasting change and empower individuals from all walks of life to achieve their goals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 rounded-2xl">
              <div className="text-center">
                <div className="bg-white text-primary rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  ❤️
                </div>
                <h3 className="text-xl font-bold mb-4">Donate</h3>
                <p className="mb-6">Support our mission to provide free and affordable coaching to those who need it most.</p>
                <Button className="bg-white text-primary hover:bg-gray-100 transition-colors">
                  Make a Donation
                </Button>
              </div>
            </div>
            
            <Card className="bg-gray-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  🤝
                </div>
                <h3 className="text-xl font-bold text-secondary mb-4">Volunteer</h3>
                <p className="text-gray-600 mb-6">Share your skills and time to help expand our reach and impact in the community.</p>
                <Button className="bg-primary text-white hover:bg-secondary transition-colors">
                  Join Our Team
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="bg-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  📢
                </div>
                <h3 className="text-xl font-bold text-secondary mb-4">Spread the Word</h3>
                <p className="text-gray-600 mb-6">Help us reach more people who could benefit from our services by sharing our mission.</p>
                <Button className="bg-primary text-white hover:bg-secondary transition-colors">
                  Share Our Story
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Onboarding Welcome */}
      <OnboardingWelcome 
        isOpen={showOnboarding}
        onComplete={completeOnboarding}
        userType={user ? 'new' : 'new'}
      />
    </div>
  );
}
