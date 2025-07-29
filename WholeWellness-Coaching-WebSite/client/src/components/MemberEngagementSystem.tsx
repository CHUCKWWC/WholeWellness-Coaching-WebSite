import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Trophy, 
  Gift, 
  Target, 
  Calendar, 
  Users,
  BookOpen,
  MessageCircle,
  Heart,
  Award,
  Zap,
  Crown,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface MemberLevel {
  name: string;
  requiredPoints: number;
  benefits: string[];
  color: string;
  icon: JSX.Element;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: JSX.Element;
  category: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  deadline: Date;
  category: string;
  participants: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

interface MemberStats {
  currentPoints: number;
  currentLevel: string;
  nextLevel: string;
  pointsToNextLevel: number;
  totalDonations: number;
  coachingSessions: number;
  resourcesDownloaded: number;
  communityInteractions: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

export default function MemberEngagementSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);

  const { data: memberStats, isLoading: statsLoading } = useQuery<MemberStats>({
    queryKey: ['/api/member/stats'],
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ['/api/member/achievements'],
  });

  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ['/api/member/challenges'],
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      return apiRequest('POST', '/api/member/claim-reward', { achievementId });
    },
    onSuccess: () => {
      toast({
        title: "Reward Claimed!",
        description: "Your reward has been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/member/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/member/achievements'] });
    }
  });

  const memberLevels: MemberLevel[] = [
    {
      name: "New Member",
      requiredPoints: 0,
      benefits: ["Access to basic resources", "Community support"],
      color: "from-gray-400 to-gray-500",
      icon: <Users className="h-4 w-4" />
    },
    {
      name: "Active Supporter",
      requiredPoints: 100,
      benefits: ["Priority booking", "Exclusive resources", "Monthly newsletter"],
      color: "from-blue-400 to-blue-500",
      icon: <Star className="h-4 w-4" />
    },
    {
      name: "Community Champion",
      requiredPoints: 500,
      benefits: ["AI coaching priority", "Group session access", "Impact reports"],
      color: "from-purple-400 to-purple-500",
      icon: <Trophy className="h-4 w-4" />
    },
    {
      name: "Mission Partner",
      requiredPoints: 1000,
      benefits: ["Direct coach access", "Event invitations", "Advisory input"],
      color: "from-emerald-400 to-emerald-500",
      icon: <Crown className="h-4 w-4" />
    },
    {
      name: "Legacy Advocate",
      requiredPoints: 2500,
      benefits: ["Lifetime benefits", "Recognition program", "Leadership opportunities"],
      color: "from-amber-400 to-amber-500",
      icon: <Award className="h-4 w-4" />
    }
  ];

  const getCurrentLevel = () => {
    if (!memberStats) return memberLevels[0];
    return memberLevels.reduce((prev, current) => 
      memberStats.currentPoints >= current.requiredPoints ? current : prev
    );
  };

  const getNextLevel = () => {
    if (!memberStats) return memberLevels[1];
    const currentLevel = getCurrentLevel();
    const currentIndex = memberLevels.findIndex(level => level.name === currentLevel.name);
    return memberLevels[currentIndex + 1] || currentLevel;
  };

  const achievementCategories = [
    { name: "Donations", icon: <Heart className="h-4 w-4" />, color: "text-red-500" },
    { name: "Learning", icon: <BookOpen className="h-4 w-4" />, color: "text-blue-500" },
    { name: "Community", icon: <Users className="h-4 w-4" />, color: "text-green-500" },
    { name: "Coaching", icon: <MessageCircle className="h-4 w-4" />, color: "text-purple-500" },
    { name: "Milestones", icon: <Target className="h-4 w-4" />, color: "text-amber-500" }
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressPercentage = memberStats ? 
    ((memberStats.currentPoints - currentLevel.requiredPoints) / 
     (nextLevel.requiredPoints - currentLevel.requiredPoints)) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Member Level Progress */}
      <Card className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${currentLevel.color} opacity-10`}></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${currentLevel.color} text-white`}>
                {currentLevel.icon}
              </div>
              <div>
                <CardTitle className="text-xl">{currentLevel.name}</CardTitle>
                <p className="text-sm text-gray-600">
                  {memberStats?.currentPoints || 0} points earned
                </p>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${currentLevel.color} text-white`}>
              Level {memberLevels.findIndex(l => l.name === currentLevel.name) + 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {nextLevel.name !== currentLevel.name && (
            <>
              <div className="flex justify-between text-sm">
                <span>Progress to {nextLevel.name}</span>
                <span>{memberStats?.pointsToNextLevel || 0} points needed</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl font-bold text-red-500">{memberStats?.totalDonations || 0}</div>
              <div className="text-xs text-gray-600">Total Donations</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{memberStats?.coachingSessions || 0}</div>
              <div className="text-xs text-gray-600">Coaching Sessions</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{memberStats?.resourcesDownloaded || 0}</div>
              <div className="text-xs text-gray-600">Resources Used</div>
            </div>
            <div className="text-center p-3 bg-white/70 rounded-lg">
              <div className="text-2xl font-bold text-purple-500">{memberStats?.currentStreak || 0}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Made a donation</span>
                    </div>
                    <Badge variant="outline">+50 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Completed coaching session</span>
                    </div>
                    <Badge variant="outline">+25 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Downloaded resource pack</span>
                    </div>
                    <Badge variant="outline">+15 pts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                    <Heart className="h-6 w-6 text-red-500" />
                    <span className="text-sm">Make Donation</span>
                    <Badge variant="secondary" className="text-xs">+50 pts</Badge>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                    <MessageCircle className="h-6 w-6 text-blue-500" />
                    <span className="text-sm">Book Session</span>
                    <Badge variant="secondary" className="text-xs">+25 pts</Badge>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                    <Users className="h-6 w-6 text-green-500" />
                    <span className="text-sm">Join Community</span>
                    <Badge variant="secondary" className="text-xs">+10 pts</Badge>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col space-y-2 p-4">
                    <BookOpen className="h-6 w-6 text-purple-500" />
                    <span className="text-sm">Read Resources</span>
                    <Badge variant="secondary" className="text-xs">+15 pts</Badge>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {achievementCategories.map((category) => {
              const categoryAchievements = achievements?.filter(a => a.category === category.name) || [];
              
              return (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className={category.color}>{category.icon}</span>
                      {category.name} Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryAchievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: achievement.unlocked ? 1 : 0.6 }}
                          className={`p-4 rounded-lg border-2 ${
                            achievement.unlocked 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${
                              achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {achievement.icon}
                            </div>
                            {achievement.unlocked && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {achievement.points} pts
                            </Badge>
                            {achievement.progress !== undefined && !achievement.unlocked && (
                              <span className="text-xs text-gray-500">
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            )}
                          </div>
                          {achievement.progress !== undefined && !achievement.unlocked && (
                            <Progress 
                              value={(achievement.progress / (achievement.maxProgress || 1)) * 100} 
                              className="h-1 mt-2"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges?.map((challenge) => (
              <Card key={challenge.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {Math.ceil((challenge.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">
                        <Gift className="h-3 w-3 mr-1" />
                        {challenge.points} pts
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {challenge.participants} participants
                      </span>
                    </div>
                    {challenge.completed ? (
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    ) : (
                      <Button size="sm" variant="outline">
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No active challenges at the moment. Check back soon!
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberLevels.map((level, index) => (
              <Card key={level.name} className={`relative ${
                level.name === currentLevel.name ? 'ring-2 ring-primary' : ''
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-5`}></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${level.color} text-white`}>
                        {level.icon}
                      </div>
                      <CardTitle className="text-lg">{level.name}</CardTitle>
                    </div>
                    {level.name === currentLevel.name && (
                      <Badge className="bg-primary text-white">Current</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="text-sm text-gray-600">
                    {level.requiredPoints} points required
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="space-y-1">
                      {level.benefits.map((benefit, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {memberStats && memberStats.currentPoints >= level.requiredPoints ? (
                    <Badge className="w-full justify-center bg-green-100 text-green-800">
                      Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center">
                      {level.requiredPoints - (memberStats?.currentPoints || 0)} points needed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {celebratingAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Trophy className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
              <h4 className="text-lg font-semibold text-primary mb-2">
                {celebratingAchievement.title}
              </h4>
              <p className="text-gray-600 mb-4">{celebratingAchievement.description}</p>
              <Badge className="mb-6">+{celebratingAchievement.points} points</Badge>
              <Button 
                onClick={() => setCelebratingAchievement(null)}
                className="w-full"
              >
                Awesome!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}