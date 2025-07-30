import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";
import { Heart } from "lucide-react";
import diverseTeamImg from "@assets/wwc_ (5)_1751919370279.jpg";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-warm to-white py-16 lg:py-24" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
              Empowering Lives Through{" "}
              <span className="text-primary">Accessible Coaching</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              "Coaching for Everyone: Affordable, Accessible, Empowering." 
              <br />
              A supportive path to personal development for those who need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/digital-onboarding">
                <Button 
                  size="lg" 
                  className="btn-primary btn-large"
                  aria-describedby="get-started-description"
                >
                  Get Started
                </Button>
              </Link>
              <span id="get-started-description" className="sr-only">
                Begin your wellness journey with our comprehensive onboarding process
              </span>
              
              <Link href="/about">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="btn-outline btn-large"
                  aria-describedby="learn-story-description"
                >
                  Learn Our Story
                </Button>
              </Link>
              <span id="learn-story-description" className="sr-only">
                Discover our mission and commitment to serving underserved communities
              </span>
            </div>
          </div>
          <div className="relative">
            <OptimizedImage
              src={diverseTeamImg}
              alt="Diverse team of wellness professionals collaborating in a modern, inclusive workspace, representing our commitment to serving all communities"
              className="rounded-2xl shadow-2xl w-full h-auto"
              priority={true}
              loading="eager"
              width={600}
              height={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            />
            <div 
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg"
              role="img"
              aria-label="Success metrics"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-white rounded-full p-3" aria-hidden="true">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-secondary">500+ Lives</p>
                  <p className="text-sm text-gray-600">Transformed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
