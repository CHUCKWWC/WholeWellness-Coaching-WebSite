import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, Mail, ArrowLeft, Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-warm to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardContent className="pt-8 pb-8 px-8 text-center">
          {/* Friendly illustration */}
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl font-bold text-secondary dark:text-white mb-3">
            Oops! Page Not Found
          </h1>
          
          {/* Friendly message */}
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            We couldn't find the page you're looking for.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Don't worry - it happens to the best of us! Let's get you back on track.
          </p>

          {/* Action buttons */}
          <div className="space-y-3 mb-8">
            <Link href="/">
              <Button 
                className="w-full bg-primary hover:bg-secondary"
                data-testid="button-404-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.history.back()}
                data-testid="button-404-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link href="/contact" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-404-contact"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Maybe you were looking for:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/services">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Services
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Resources
                </Button>
              </Link>
              <Link href="/programs">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Programs
                </Button>
              </Link>
              <Link href="/ai-coaching">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  AI Coaching
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
