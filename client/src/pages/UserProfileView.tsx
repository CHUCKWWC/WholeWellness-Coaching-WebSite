import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Target,
  MoreHorizontal
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
  const [activeTab, setActiveTab] = useState("about");

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
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-[1440px] mx-auto">
          <Skeleton className="h-[656px] w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
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
      free: { label: 'Free Member', color: 'bg-gray-500' },
      supporter: { label: 'Supporter', color: 'bg-blue-500' },
      champion: { label: 'Champion', color: 'bg-purple-500' },
      guardian: { label: 'Guardian', color: 'bg-amber-500' },
    };
    return badges[level as keyof typeof badges] || badges.free;
  };

  const membershipBadge = getMembershipBadge(profile.membershipLevel);

  return (
    <div className="min-h-screen bg-[#e4e6eb] dark:bg-gray-900">
      {/* Profile Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-[1440px] mx-auto">
          {/* Cover Photo with Gradient Overlay */}
          <div className="relative h-[438px] overflow-hidden rounded-bl-3xl rounded-br-3xl">
            {profile.coverPhotoUrl ? (
              <img 
                src={profile.coverPhotoUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-teal-500" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[168px] bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Name and Title Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <h1 className="text-5xl font-bold text-white mb-4">{fullName}</h1>
              <div className="flex items-center justify-center gap-4 text-white text-2xl font-medium">
                {profile.interests.slice(0, 3).map((interest, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Info Bar */}
          <div className="px-12 py-8">
            <div className="flex items-end gap-6">
              {/* Profile Picture */}
              <div className="relative -mt-32">
                <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden shadow-lg">
                  {profile.profileImageUrl ? (
                    <img 
                      src={profile.profileImageUrl} 
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-600 text-white text-5xl font-bold">
                      {(profile.firstName?.[0] || 'U')}{(profile.lastName?.[0] || '')}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <button 
                    className="absolute bottom-2 right-2 p-2 bg-[#e4e6eb] dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    data-testid="button-edit-profile-photo"
                  >
                    <Camera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 mb-2">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {fullName}
                  </h2>
                  <Badge className={membershipBadge.color}>
                    <Heart className="w-3 h-3 mr-1" />
                    {membershipBadge.label}
                  </Badge>
                </div>
                {profile.joinDate && (
                  <p className="text-[#626262] dark:text-gray-400 font-semibold">
                    Member since {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <Button className="bg-[#0866ff] hover:bg-[#0866ff]/90 text-white" data-testid="button-add-story">
                      <Camera className="w-4 h-4 mr-2" />
                      Add Story
                    </Button>
                    <Button variant="secondary" className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" data-testid="button-edit-profile">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <Button variant="secondary" className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" data-testid="button-message-user">
                    <Mail className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                )}
                <Button 
                  variant="secondary" 
                  className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white px-3"
                  data-testid="button-more-options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 border-b-0 gap-3">
                  <TabsTrigger 
                    value="about" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0866ff] data-[state=active]:text-[#0866ff] rounded-none bg-transparent px-3 py-3 font-semibold"
                    data-testid="tab-about"
                  >
                    About
                  </TabsTrigger>
                  <TabsTrigger 
                    value="journey" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0866ff] data-[state=active]:text-[#0866ff] rounded-none bg-transparent px-3 py-3 font-semibold"
                    data-testid="tab-journey"
                  >
                    Journey
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievements" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0866ff] data-[state=active]:text-[#0866ff] rounded-none bg-transparent px-3 py-3 font-semibold"
                    data-testid="tab-achievements"
                  >
                    Achievements
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1440px] mx-auto px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Sidebar - Intro */}
          <div className="lg:col-span-1 space-y-4">
            {/* Intro Card */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Intro</h2>
                
                {profile.bio && (
                  <p className="text-[#4d4d4d] dark:text-gray-400 text-sm text-center mb-4">
                    {profile.bio}
                  </p>
                )}
                
                {isOwnProfile && (
                  <Button variant="secondary" className="w-full mb-4 bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" data-testid="button-edit-bio">
                    Edit Bio
                  </Button>
                )}

                <div className="space-y-3">
                  {profile.location && (
                    <div className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400">
                      <MapPin className="w-5 h-5 opacity-70 mt-0.5" />
                      <span className="text-sm">From {profile.location}</span>
                    </div>
                  )}
                  
                  {profile.educationHistory.length > 0 && (
                    <div className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400">
                      <GraduationCap className="w-5 h-5 opacity-70 mt-0.5" />
                      <span className="text-sm">
                        {profile.educationHistory[0].degree ? `${profile.educationHistory[0].degree} at ` : 'Studied at '}
                        {profile.educationHistory[0].institution}
                      </span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400 hover:text-[#0866ff]"
                      data-testid="link-website"
                    >
                      <Globe className="w-5 h-5 opacity-70 mt-0.5" />
                      <span className="text-sm break-all">{profile.website}</span>
                    </a>
                  )}

                  {Object.entries(profile.socialLinks || {}).map(([platform, url]) => {
                    if (!url) return null;
                    const Icon = socialIcons[platform as keyof typeof socialIcons];
                    const username = url.split('/').pop() || platform;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400 hover:text-[#0866ff]"
                        data-testid={`link-social-${platform}`}
                      >
                        <Icon className="w-5 h-5 opacity-70 mt-0.5" />
                        <span className="text-sm">{username}</span>
                      </a>
                    );
                  })}
                </div>

                {isOwnProfile && (
                  <Button variant="secondary" className="w-full mt-4 bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" data-testid="button-edit-details">
                    Edit Details
                  </Button>
                )}

                {/* Interests/Goals */}
                {profile.interests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="border-gray-300 text-sm"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Education Card */}
            {profile.educationHistory.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Education</h2>
                  <div className="space-y-3">
                    {profile.educationHistory.map((edu, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3"
                        data-testid={`education-${i}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {edu.degree ? `${edu.degree}` : 'Studied'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                          {edu.year && (
                            <p className="text-xs text-gray-500">{edu.year}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="about" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">About {profile.firstName || 'User'}</h2>
                    
                    {profile.bio ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {profile.bio}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No bio available yet.
                      </p>
                    )}

                    {/* Interests Section */}
                    {profile.interests.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-3">Interests & Goals</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {profile.interests.map((interest, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Target className="w-4 h-4 text-[#0866ff]" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{interest}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Membership Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg mb-3">Membership</h3>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${membershipBadge.color} flex items-center justify-center`}>
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{membershipBadge.label}</p>
                          {profile.joinDate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Since {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="journey" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Wellness Journey</h2>
                    <div className="text-center py-12">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Your wellness journey awaits</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                        Track your progress, set goals, and celebrate your achievements
                      </p>
                      {isOwnProfile && (
                        <Button className="bg-[#0866ff] hover:bg-[#0866ff]/90" data-testid="button-start-journey">
                          <Target className="w-4 h-4 mr-2" />
                          Begin Journey
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Achievements & Milestones</h2>
                    {profile.achievements.length > 0 ? (
                      <div className="space-y-3">
                        {profile.achievements.map((achievement, i) => (
                          <div 
                            key={i} 
                            className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                            data-testid={`achievement-${i}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-5 h-5 text-amber-500" />
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 pt-1.5">{achievement}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No achievements yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          Start your wellness journey to earn achievements
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
