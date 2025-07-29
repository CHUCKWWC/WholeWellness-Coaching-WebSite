import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Video, Download, ExternalLink, Heart } from "lucide-react";

interface CoachingResourcesProps {
  agentType: string;
}

export default function CoachingResources({ agentType }: CoachingResourcesProps) {
  const [activeCategory, setActiveCategory] = useState("articles");

  const getResourcesForAgent = (agent: string) => {
    switch (agent) {
      case 'finance-coach':
        return {
          articles: [
            {
              title: "Building an Emergency Fund on a Tight Budget",
              description: "Practical steps to save money even with limited income",
              url: "#",
              type: "article",
              difficulty: "Beginner"
            },
            {
              title: "Understanding Credit Scores After Financial Trauma",
              description: "How to rebuild credit after domestic violence or divorce",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            },
            {
              title: "Free Financial Planning Tools and Apps",
              description: "No-cost resources for budgeting and expense tracking",
              url: "#",
              type: "article",
              difficulty: "Beginner"
            }
          ],
          videos: [
            {
              title: "Budgeting Basics: 50/30/20 Rule Explained",
              description: "Visual guide to the popular budgeting method",
              url: "#",
              type: "video",
              duration: "8 min"
            },
            {
              title: "Debt Snowball vs Avalanche Method",
              description: "Compare debt payoff strategies",
              url: "#",
              type: "video",
              duration: "12 min"
            }
          ],
          downloads: [
            {
              title: "Budget Planning Worksheet",
              description: "Printable monthly budget template",
              url: "#",
              type: "pdf",
              size: "125 KB"
            },
            {
              title: "Debt Tracking Spreadsheet",
              description: "Excel template for debt management",
              url: "#",
              type: "excel",
              size: "89 KB"
            }
          ]
        };
      
      case 'relationship-coach':
        return {
          articles: [
            {
              title: "Recognizing Healthy vs. Unhealthy Relationships",
              description: "Key signs and red flags to understand",
              url: "#",
              type: "article",
              difficulty: "Essential"
            },
            {
              title: "Setting Boundaries After Abuse",
              description: "Practical strategies for establishing personal limits",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            },
            {
              title: "Co-Parenting with a Difficult Ex",
              description: "Strategies for healthy co-parenting relationships",
              url: "#",
              type: "article",
              difficulty: "Advanced"
            }
          ],
          videos: [
            {
              title: "Communication Skills for Difficult Conversations",
              description: "Learn assertive communication techniques",
              url: "#",
              type: "video",
              duration: "15 min"
            },
            {
              title: "Building Self-Worth After Trauma",
              description: "Rebuilding confidence and self-esteem",
              url: "#",
              type: "video",
              duration: "20 min"
            }
          ],
          downloads: [
            {
              title: "Safety Planning Template",
              description: "Comprehensive safety plan worksheet",
              url: "#",
              type: "pdf",
              size: "245 KB"
            },
            {
              title: "Daily Affirmations Cards",
              description: "Printable positive affirmation cards",
              url: "#",
              type: "pdf",
              size: "156 KB"
            }
          ]
        };
      
      case 'career-coach':
        return {
          articles: [
            {
              title: "Re-entering the Workforce After a Career Gap",
              description: "Strategies for explaining employment gaps",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            },
            {
              title: "Remote Work Opportunities for Parents",
              description: "Finding flexible employment options",
              url: "#",
              type: "article",
              difficulty: "Beginner"
            },
            {
              title: "Networking When You Feel Isolated",
              description: "Building professional connections from scratch",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            }
          ],
          videos: [
            {
              title: "Resume Writing for Career Changers",
              description: "How to highlight transferable skills",
              url: "#",
              type: "video",
              duration: "18 min"
            },
            {
              title: "Interview Confidence for Nervous Candidates",
              description: "Building interview skills and confidence",
              url: "#",
              type: "video",
              duration: "22 min"
            }
          ],
          downloads: [
            {
              title: "Resume Template - Career Gap Friendly",
              description: "Professional resume template for career gaps",
              url: "#",
              type: "docx",
              size: "78 KB"
            },
            {
              title: "Skills Assessment Worksheet",
              description: "Identify your transferable skills",
              url: "#",
              type: "pdf",
              size: "134 KB"
            }
          ]
        };
      
      case 'health-coach':
        return {
          articles: [
            {
              title: "Nutrition on a Tight Budget",
              description: "Healthy eating when money is limited",
              url: "#",
              type: "article",
              difficulty: "Beginner"
            },
            {
              title: "Managing Stress and Trauma Through Exercise",
              description: "Physical activity for emotional healing",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            },
            {
              title: "Sleep Hygiene for Anxiety and PTSD",
              description: "Creating better sleep patterns after trauma",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            }
          ],
          videos: [
            {
              title: "10-Minute Home Workouts (No Equipment)",
              description: "Simple exercises you can do anywhere",
              url: "#",
              type: "video",
              duration: "10 min"
            },
            {
              title: "Meditation for Beginners",
              description: "Basic mindfulness and breathing techniques",
              url: "#",
              type: "video",
              duration: "15 min"
            }
          ],
          downloads: [
            {
              title: "Meal Planning Template",
              description: "Budget-friendly meal planning worksheet",
              url: "#",
              type: "pdf",
              size: "198 KB"
            },
            {
              title: "Daily Wellness Tracker",
              description: "Track mood, sleep, and physical activity",
              url: "#",
              type: "pdf",
              size: "167 KB"
            }
          ]
        };
      
      case 'mindset-coach':
        return {
          articles: [
            {
              title: "Rebuilding Self-Confidence After Trauma",
              description: "Practical steps to regain self-worth",
              url: "#",
              type: "article",
              difficulty: "Essential"
            },
            {
              title: "Overcoming Limiting Beliefs",
              description: "Identifying and changing negative thought patterns",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            },
            {
              title: "Finding Purpose After Life Changes",
              description: "Discovering meaning in new circumstances",
              url: "#",
              type: "article",
              difficulty: "Advanced"
            }
          ],
          videos: [
            {
              title: "Daily Gratitude Practices",
              description: "Simple techniques to shift perspective",
              url: "#",
              type: "video",
              duration: "12 min"
            },
            {
              title: "Visualization for Goal Achievement",
              description: "Using mental imagery to reach goals",
              url: "#",
              type: "video",
              duration: "16 min"
            }
          ],
          downloads: [
            {
              title: "Goal Setting Workbook",
              description: "Comprehensive goal planning template",
              url: "#",
              type: "pdf",
              size: "289 KB"
            },
            {
              title: "Mindfulness Journal Pages",
              description: "Daily reflection and mindfulness prompts",
              url: "#",
              type: "pdf",
              size: "223 KB"
            }
          ]
        };
      
      case 'life-transition-coach':
        return {
          articles: [
            {
              title: "Creating a New Life After Major Changes",
              description: "Steps to rebuild and redesign your life",
              url: "#",
              type: "article",
              difficulty: "Essential"
            },
            {
              title: "Managing Overwhelm During Transitions",
              description: "Coping strategies for major life changes",
              url: "#",
              type: "article",
              difficulty: "Intermediate"
            },
            {
              title: "Building New Routines and Habits",
              description: "Creating stability in times of change",
              url: "#",
              type: "article",
              difficulty: "Beginner"
            }
          ],
          videos: [
            {
              title: "Life Mapping Exercise",
              description: "Visualizing your path forward",
              url: "#",
              type: "video",
              duration: "25 min"
            },
            {
              title: "Decision Making Under Pressure",
              description: "Making good choices during stressful times",
              url: "#",
              type: "video",
              duration: "18 min"
            }
          ],
          downloads: [
            {
              title: "Life Transition Workbook",
              description: "Complete guide through major life changes",
              url: "#",
              type: "pdf",
              size: "456 KB"
            },
            {
              title: "Weekly Planning Template",
              description: "Structure for building new routines",
              url: "#",
              type: "pdf",
              size: "134 KB"
            }
          ]
        };
      
      default:
        return { articles: [], videos: [], downloads: [] };
    }
  };

  const resources = getResourcesForAgent(agentType);

  const ResourceCard = ({ resource, type }: { resource: any; type: string }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {type === 'articles' && <BookOpen className="h-4 w-4 text-blue-500" />}
            {type === 'videos' && <Video className="h-4 w-4 text-red-500" />}
            {type === 'downloads' && <Download className="h-4 w-4 text-green-500" />}
            <CardTitle className="text-sm">{resource.title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {resource.difficulty && (
              <Badge variant="outline" className="text-xs">
                {resource.difficulty}
              </Badge>
            )}
            {resource.duration && (
              <Badge variant="outline" className="text-xs">
                {resource.duration}
              </Badge>
            )}
            {resource.size && (
              <Badge variant="outline" className="text-xs">
                {resource.size}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-xs">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          <ExternalLink className="h-3 w-3 mr-2" />
          {type === 'downloads' ? 'Download' : 'View Resource'}
        </Button>
      </CardContent>
    </Card>
  );

  if (!resources.articles.length && !resources.videos.length && !resources.downloads.length) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Learning Resources</h3>
      </div>
      
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.articles.map((article, index) => (
              <ResourceCard key={index} resource={article} type="articles" />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="videos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.videos.map((video, index) => (
              <ResourceCard key={index} resource={video} type="videos" />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="downloads" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.downloads.map((download, index) => (
              <ResourceCard key={index} resource={download} type="downloads" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <h4 className="font-semibold text-red-800">Crisis Resources</h4>
              <p className="text-sm text-red-700">
                <strong>National Domestic Violence Hotline:</strong> 1-800-799-7233 | 
                <strong> Crisis Text Line:</strong> Text HOME to 741741 | 
                <strong> 988 Suicide & Crisis Lifeline:</strong> 988
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}