import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft, Phone, Heart } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-2xl mx-4 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-blue-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't worry - you can find what you need from our main sections below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link href="/">
              <Button className="w-full h-12 text-left justify-start" variant="outline">
                <Home className="h-5 w-5 mr-3" />
                Return Home
              </Button>
            </Link>
            
            <Link href="/ai-coaching">
              <Button className="w-full h-12 text-left justify-start" variant="outline">
                <Heart className="h-5 w-5 mr-3" />
                AI Coaching
              </Button>
            </Link>
            
            <Link href="/services">
              <Button className="w-full h-12 text-left justify-start" variant="outline">
                <ArrowLeft className="h-5 w-5 mr-3" />
                Our Services
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button className="w-full h-12 text-left justify-start" variant="outline">
                <Phone className="h-5 w-5 mr-3" />
                Contact Support
              </Button>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Need immediate support?</strong> Our wellness resources and AI coaching are always available to help you on your journey.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
