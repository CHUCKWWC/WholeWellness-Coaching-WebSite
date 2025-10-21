import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Globe, 
  Mail, 
  Calendar,
  Award,
  Users,
  Star,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Camera,
  Edit,
  Video,
  MoreHorizontal,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StartVideoSessionDialog from "@/components/coach/StartVideoSessionDialog";

interface CoachProfile {
  id: number;
  coachId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  specialties: string[];
  experience: number | null;
  isVerified: boolean;
  hourlyRate: string | null;
  timezone: string | null;
  languages: string[];
  location: string | null;
  website: string | null;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  clientCount: number;
  credentials: Array<{
    title: string;
    issuingOrganization: string;
    issueDate: string | null;
    credentialType: string;
    verificationStatus: string;
  }>;
}

export default function CoachProfileView() {
  const { coachId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");

  const { data: profile, isLoading } = useQuery<CoachProfile>({
    queryKey: ['/api/coach/profile', coachId],
    queryFn: async () => {
      const response = await fetch(`/api/coach/profile/${coachId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coach profile');
      }
      return response.json();
    },
    enabled: !!coachId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e4e6eb] dark:bg-gray-900">
        <div className="max-w-[1440px] mx-auto">
          <Skeleton className="h-[656px] w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#e4e6eb] dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Coach profile not found</p>
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

  const isOwnProfile = user?.role === 'coach' && user?.id === profile.coachId;
  const fullName = `${profile.firstName} ${profile.lastName}`;

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
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500" />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[168px] bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Name and Specialties Overlay */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <h1 className="text-5xl font-bold text-white mb-4">{fullName}</h1>
              <div className="flex items-center justify-center gap-4 text-white text-2xl font-medium">
                {profile.specialties.slice(0, 4).map((specialty, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                    <span>{specialty}</span>
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
                  {profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 text-white text-5xl font-bold">
                      {profile.firstName[0]}{profile.lastName[0]}
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
                  {profile.isVerified && (
                    <Badge className="bg-[#0866ff] hover:bg-[#0866ff]/90">
                      <Award className="w-3 h-3 mr-1" />
                      Verified Coach
                    </Badge>
                  )}
                </div>
                <p className="text-[#626262] dark:text-gray-400 font-semibold mb-2">
                  {profile.clientCount} clients
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-2">
                {isOwnProfile ? (
                  <>
                    <Button className="bg-[#0866ff] hover:bg-[#0866ff]/90 text-white" data-testid="button-add-story">
                      <Video className="w-4 h-4 mr-2" />
                      Add Story
                    </Button>
                    <Button variant="secondary" className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" data-testid="button-edit-profile">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <StartVideoSessionDialog 
                      trigger={
                        <Button 
                          variant="secondary" 
                          className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white px-3"
                          data-testid="button-start-video-session"
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      }
                    />
                  </>
                ) : (
                  <>
                    <Button className="bg-[#0866ff] hover:bg-[#0866ff]/90 text-white" data-testid="button-book-session">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                    <Button variant="secondary" className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" data-testid="button-message-coach">
                      <Mail className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <StartVideoSessionDialog 
                      trigger={
                        <Button 
                          variant="secondary" 
                          className="bg-[#e4e6eb] hover:bg-gray-300 text-black dark:bg-gray-700 dark:text-white" 
                          data-testid="button-join-video-session"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Video Call
                        </Button>
                      }
                    />
                  </>
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
                    value="credentials" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0866ff] data-[state=active]:text-[#0866ff] rounded-none bg-transparent px-3 py-3 font-semibold"
                    data-testid="tab-credentials"
                  >
                    Credentials
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0866ff] data-[state=active]:text-[#0866ff] rounded-none bg-transparent px-3 py-3 font-semibold"
                    data-testid="tab-reviews"
                  >
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger 
                    value="availability" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-[#0866ff] data-[state=active]:text-[#0866ff] rounded-none bg-transparent px-3 py-3 font-semibold"
                    data-testid="tab-availability"
                  >
                    Availability
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
                  {profile.experience !== null && (
                    <div className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400">
                      <Briefcase className="w-5 h-5 opacity-70 mt-0.5" />
                      <span className="text-sm">{profile.experience} years of coaching experience</span>
                    </div>
                  )}

                  {profile.credentials.length > 0 && (
                    <div className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400">
                      <GraduationCap className="w-5 h-5 opacity-70 mt-0.5" />
                      <span className="text-sm">{profile.credentials[0].title}</span>
                    </div>
                  )}
                  
                  {profile.location && (
                    <div className="flex items-start gap-3 text-[#4d4d4d] dark:text-gray-400">
                      <MapPin className="w-5 h-5 opacity-70 mt-0.5" />
                      <span className="text-sm">{profile.location}</span>
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

                {/* Specialties */}
                {profile.specialties.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="border-gray-300 text-sm"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {profile.languages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold mb-2">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="border-gray-300 text-sm"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="about" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">About {profile.firstName}</h2>
                    
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

                    {/* Coaching Approach */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg mb-3">Coaching Approach</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {profile.specialties.map((specialty, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#0866ff]" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{specialty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Experience Highlight */}
                    {profile.experience !== null && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-3">Experience</h3>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                            <Award className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{profile.experience}+ Years</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Professional Coaching Experience</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="credentials" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Certifications & Credentials</h2>
                    {profile.credentials.length > 0 ? (
                      <div className="space-y-4">
                        {profile.credentials.map((credential, i) => (
                          <div 
                            key={i} 
                            className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
                            data-testid={`credential-${i}`}
                          >
                            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0">
                              <Award className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {credential.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {credential.issuingOrganization}
                              </p>
                              {credential.issueDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Issued {new Date(credential.issueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {credential.verificationStatus === 'verified' && (
                              <Badge className="bg-green-600 hover:bg-green-700">
                                Verified
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                        No credentials listed yet.
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Client Reviews</h2>
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">No reviews yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Be the first to work with {profile.firstName} and leave a review
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="mt-0">
                <Card className="border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Availability & Booking</h2>
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        View {profile.firstName}'s availability and book a session
                      </p>
                      {!isOwnProfile && (
                        <Button className="bg-[#0866ff] hover:bg-[#0866ff]/90" data-testid="button-book-now">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      )}
                    </div>
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
