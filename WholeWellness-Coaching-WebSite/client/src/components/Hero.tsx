import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import diverseTeamImg from "@assets/wwc_ (5)_1751919370279.jpg";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-warm to-white py-16 lg:py-24">
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
                <Button size="lg" className="bg-primary text-white hover:bg-secondary transition-colors shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Learn Our Story
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img 
              src={diverseTeamImg} 
              alt="Diverse team of professionals collaborating in a modern workspace" 
              className="rounded-2xl shadow-2xl w-full h-auto" 
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-white rounded-full p-3">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
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
