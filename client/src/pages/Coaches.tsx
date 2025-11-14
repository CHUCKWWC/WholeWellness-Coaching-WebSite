import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, MapPin, Star, AlertCircle } from "lucide-react";

interface Coach {
  id: number;
  coachId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;
  specialties: string[];
  experience: number | null;
  isVerified: boolean;
  hourlyRate: string | null;
  languages: string[];
  location?: string;
}

function truncateText(text: string | null, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

function CoachCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function CoachCard({ coach }: { coach: Coach }) {
  const initials = `${coach.firstName.charAt(0)}${coach.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${coach.firstName} ${coach.lastName}`;
  const truncatedBio = truncateText(coach.bio, 150);
  const showReadMore = coach.bio && coach.bio.length > 150;

  return (
    <Card 
      className="h-full hover:shadow-lg transition-shadow duration-200"
      data-testid={`card-coach-${coach.coachId}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Profile Image */}
          <Avatar className="w-24 h-24 border-2 border-primary/10">
            <AvatarImage src={coach.profileImage || undefined} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name and Verification */}
          <div className="w-full">
            <h3 
              className="text-xl font-semibold text-secondary mb-1"
              data-testid={`text-coach-name-${coach.coachId}`}
            >
              {fullName}
            </h3>
            {coach.isVerified && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Verified Coach
              </Badge>
            )}
          </div>

          {/* Location and Experience */}
          {(coach.location || coach.experience) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {coach.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{coach.location}</span>
                </div>
              )}
              {coach.experience && (
                <span>{coach.experience} years exp.</span>
              )}
            </div>
          )}

          {/* Bio */}
          <p className="text-gray-700 text-sm leading-relaxed">
            {truncatedBio}
            {showReadMore && (
              <span className="text-primary font-medium"> Read more...</span>
            )}
          </p>

          {/* Specializations */}
          {coach.specialties && coach.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {coach.specialties.slice(0, 3).map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-primary/5 text-primary border-primary/20"
                >
                  {specialty}
                </Badge>
              ))}
              {coach.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{coach.specialties.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Languages */}
          {coach.languages && coach.languages.length > 0 && (
            <p className="text-xs text-gray-500">
              Speaks: {coach.languages.join(", ")}
            </p>
          )}

          {/* View Profile Button */}
          <Link href={`/coach/${coach.coachId}`}>
            <Button 
              className="w-full h-12 rounded-full"
              data-testid={`button-view-profile-${coach.coachId}`}
            >
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Coaches() {
  const { data: coaches, isLoading, error } = useQuery<Coach[]>({
    queryKey: ["/api/coaches"],
  });

  // Set page title and meta description
  useEffect(() => {
    document.title = "Find Your Coach - WholeWellness Coaching";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Browse our directory of verified wellness coaches. Find the perfect coach to support your journey toward holistic health and personal growth.');
    }
  }, []);

  // Filter for active and verified coaches
  const activeVerifiedCoaches = coaches?.filter(
    coach => coach.isVerified
  ) || [];

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-warm to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-4">
                Find Your Perfect Coach
              </h1>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Connect with verified wellness coaches who are committed to supporting your journey toward holistic health and personal transformation.
              </p>
            </div>
          </div>
        </section>

        {/* Coaches Grid Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <CoachCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load coaches at this time. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {!isLoading && !error && activeVerifiedCoaches.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                  No Coaches Available Yet
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We're currently onboarding our first coaches. Check back soon to connect with verified wellness professionals.
                </p>
                <Link href="/coach-signup">
                  <Button variant="outline">
                    Become a Coach
                  </Button>
                </Link>
              </div>
            )}

            {/* Coaches Grid */}
            {!isLoading && !error && activeVerifiedCoaches.length > 0 && (
              <>
                <div className="text-center mb-8">
                  <p className="text-gray-600">
                    Showing {activeVerifiedCoaches.length} verified {activeVerifiedCoaches.length === 1 ? 'coach' : 'coaches'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeVerifiedCoaches.map((coach) => (
                    <CoachCard key={coach.coachId} coach={coach} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Our coaches are here to support you every step of the way. Whether you're seeking guidance on nutrition, mental wellness, or personal growth, we have a coach for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="h-12 px-8 rounded-full">
                  Schedule a Session
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-full">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
