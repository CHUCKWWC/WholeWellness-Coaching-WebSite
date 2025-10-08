import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Globe, 
  Mail,
  Award,
  Heart,
  Camera,
  Edit,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  GraduationCap,
  Trophy,
  Target
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  educationHistory: Array<{
    institution: string;
    degree?: string;
    year?: string;
  }>;
  achievements: string[];
  interests: string[];
  membershipLevel: string | null;
  joinDate: string | null;
}

export default function UserProfileView() {
  const { userId } = useParams();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile', userId],
    queryFn: async () => {
      const response = await fetch(`/api/user/profile/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-lg mb-4" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">User profile not found</p>
        </Card>
      </div>
    );
  }

  const socialIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook,
  };

  const isOwnProfile = user?.id === profile.id;
  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'User';

  const getMembershipBadge = (level: string | null) => {
    const badges = {
      free: { label: 'Free', color: 'bg-gray-500' },
      supporter: { label: 'Supporter', color: 'bg-blue-500' },
      champion: { label: 'Champion', color: 'bg-purple-500' },
      guardian: { label: 'Guardian', color: 'bg-amber-500' },
    };
    return badges[level as keyof typeof badges] || badges.free;
  };

  const membershipBadge = getMembershipBadge(profile.membershipLevel);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-64 bg-gradient-to-r from-teal-500 to-teal-600">
            {profile.coverPhotoUrl && (
              <img 
                src={profile.coverPhotoUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden">
                  {profile.profileImageUrl ? (
                    <img 
                      src={profile.profileImageUrl} 
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-4xl font-bold">
                      {(profile.firstName?.[0] || 'U')}{(profile.lastName?.[0] || '')}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <button 
                    className="absolute bottom-2 right-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    data-testid="button-edit-profile-photo"
                  >
                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 mt-6 md:mt-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {fullName}
                  </h1>
                  <Badge className={membershipBadge.color}>
                    <Heart className="w-3 h-3 mr-1" />
                    {membershipBadge.label}
                  </Badge>
                </div>
                
                {profile.joinDate && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    Member since {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}

                {profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.slice(0, 3).map((interest, i) => (
                      <Badge key={i} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button variant="outline" data-testid="button-edit-profile">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button variant="outline" data-testid="button-message-user">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Intro & Details */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Intro Card */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">About</h2>
              
              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                  {profile.bio}
                </p>
              )}
              
              {isOwnProfile && (
                <Button variant="outline" className="w-full mb-4" data-testid="button-edit-bio">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Bio
                </Button>
              )}

              <div className="space-y-3">
                {profile.location && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-5 h-5 opacity-70" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                
                {profile.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-teal-600 dark:text-teal-400 hover:underline"
                    data-testid="link-website"
                  >
                    <Globe className="w-5 h-5 opacity-70" />
                    <span className="text-sm">{profile.website}</span>
                  </a>
                )}

                {Object.entries(profile.socialLinks || {}).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
                      data-testid={`link-social-${platform}`}
                    >
                      <Icon className="w-5 h-5 opacity-70" />
                      <span className="text-sm capitalize">{platform}</span>
                    </a>
                  );
                })}
              </div>

              {isOwnProfile && (
                <Button variant="outline" className="w-full mt-4" data-testid="button-edit-details">
                  Edit Details
                </Button>
              )}

              {/* Interests/Goals */}
              {profile.interests.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Interests & Goals</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="border-teal-600 text-teal-600"
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Education/Background Card */}
            {profile.educationHistory.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Background</h2>
                <div className="space-y-3">
                  {profile.educationHistory.map((edu, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3"
                      data-testid={`education-${i}`}
                    >
                      <GraduationCap className="w-5 h-5 text-teal-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {edu.degree || 'Studied at'} {edu.institution}
                        </p>
                        {edu.year && (
                          <p className="text-xs text-gray-500">{edu.year}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Achievements & Journey */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Achievements Card */}
            {profile.achievements.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Achievements & Milestones</h2>
                <div className="space-y-3">
                  {profile.achievements.map((achievement, i) => (
                    <div 
                      key={i} 
                      className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                      data-testid={`achievement-${i}`}
                    >
                      <Trophy className="w-5 h-5 text-amber-500 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{achievement}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Wellness Journey (Placeholder) */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Wellness Journey</h2>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="mb-4">Start tracking your wellness journey</p>
                {isOwnProfile && (
                  <Button className="bg-teal-600 hover:bg-teal-700" data-testid="button-start-journey">
                    Begin Journey
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
