import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calculator, FileText, MapPin, Heart, Target, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CoachingToolsProps {
  agentType: string;
}

export default function CoachingTools({ agentType }: CoachingToolsProps) {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const getToolsForAgent = (agent: string) => {
    switch (agent) {
      case 'finance-coach':
        return [
          {
            id: 'budget-calculator',
            name: 'Budget Calculator',
            description: 'Create a personalized budget based on your income and expenses',
            icon: <Calculator className="h-5 w-5" />,
            color: 'bg-green-100 text-green-800'
          },
          {
            id: 'debt-payoff',
            name: 'Debt Payoff Planner',
            description: 'Plan your debt payoff strategy with different methods',
            icon: <Target className="h-5 w-5" />,
            color: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'financial-resources',
            name: 'Financial Assistance Finder',
            description: 'Find local financial assistance programs and resources',
            icon: <MapPin className="h-5 w-5" />,
            color: 'bg-purple-100 text-purple-800'
          }
        ];
      
      case 'relationship-coach':
        return [
          {
            id: 'safety-planner',
            name: 'Safety Planning Tool',
            description: 'Create a personalized safety plan for your protection',
            icon: <Heart className="h-5 w-5" />,
            color: 'bg-red-100 text-red-800'
          },
          {
            id: 'communication-scripts',
            name: 'Communication Scripts',
            description: 'Practice difficult conversations with prepared scripts',
            icon: <FileText className="h-5 w-5" />,
            color: 'bg-pink-100 text-pink-800'
          },
          {
            id: 'support-network',
            name: 'Support Network Mapper',
            description: 'Map and strengthen your support system',
            icon: <MapPin className="h-5 w-5" />,
            color: 'bg-orange-100 text-orange-800'
          }
        ];
      
      case 'career-coach':
        return [
          {
            id: 'resume-builder',
            name: 'Resume Builder',
            description: 'Build a professional resume highlighting your strengths',
            icon: <FileText className="h-5 w-5" />,
            color: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'skills-assessment',
            name: 'Skills Assessment',
            description: 'Identify your transferable skills and strengths',
            icon: <Target className="h-5 w-5" />,
            color: 'bg-green-100 text-green-800'
          },
          {
            id: 'interview-prep',
            name: 'Interview Preparation',
            description: 'Practice common interview questions and scenarios',
            icon: <Calculator className="h-5 w-5" />,
            color: 'bg-purple-100 text-purple-800'
          }
        ];
      
      case 'health-coach':
        return [
          {
            id: 'meal-planner',
            name: 'Budget Meal Planner',
            description: 'Plan healthy meals on a limited budget',
            icon: <Calendar className="h-5 w-5" />,
            color: 'bg-green-100 text-green-800'
          },
          {
            id: 'exercise-routine',
            name: 'Home Exercise Builder',
            description: 'Create exercise routines requiring no equipment',
            icon: <Heart className="h-5 w-5" />,
            color: 'bg-red-100 text-red-800'
          },
          {
            id: 'stress-management',
            name: 'Stress Management Kit',
            description: 'Learn practical stress reduction techniques',
            icon: <Target className="h-5 w-5" />,
            color: 'bg-blue-100 text-blue-800'
          }
        ];
      
      case 'mindset-coach':
        return [
          {
            id: 'affirmation-generator',
            name: 'Daily Affirmations',
            description: 'Generate personalized affirmations for confidence building',
            icon: <Heart className="h-5 w-5" />,
            color: 'bg-pink-100 text-pink-800'
          },
          {
            id: 'goal-setter',
            name: 'SMART Goal Planner',
            description: 'Set and track achievable personal goals',
            icon: <Target className="h-5 w-5" />,
            color: 'bg-green-100 text-green-800'
          },
          {
            id: 'mindfulness-exercises',
            name: 'Mindfulness Library',
            description: 'Access guided mindfulness and grounding exercises',
            icon: <Calendar className="h-5 w-5" />,
            color: 'bg-purple-100 text-purple-800'
          }
        ];
      
      case 'life-transition-coach':
        return [
          {
            id: 'transition-planner',
            name: 'Life Transition Roadmap',
            description: 'Create a step-by-step plan for major life changes',
            icon: <MapPin className="h-5 w-5" />,
            color: 'bg-orange-100 text-orange-800'
          },
          {
            id: 'decision-framework',
            name: 'Decision Making Tool',
            description: 'Framework for making important life decisions',
            icon: <Calculator className="h-5 w-5" />,
            color: 'bg-blue-100 text-blue-800'
          },
          {
            id: 'support-resources',
            name: 'Local Support Finder',
            description: 'Find local support groups and resources',
            icon: <Heart className="h-5 w-5" />,
            color: 'bg-green-100 text-green-800'
          }
        ];
      
      default:
        return [];
    }
  };

  const tools = getToolsForAgent(agentType);

  const renderBudgetCalculator = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Budget Calculator
        </CardTitle>
        <CardDescription>
          Create a personalized budget to manage your finances effectively
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthly-income">Monthly Income</Label>
            <Input id="monthly-income" type="number" placeholder="Enter total monthly income" />
          </div>
          <div>
            <Label htmlFor="housing">Housing (Rent/Mortgage)</Label>
            <Input id="housing" type="number" placeholder="Enter housing costs" />
          </div>
          <div>
            <Label htmlFor="utilities">Utilities</Label>
            <Input id="utilities" type="number" placeholder="Enter utility costs" />
          </div>
          <div>
            <Label htmlFor="groceries">Groceries</Label>
            <Input id="groceries" type="number" placeholder="Enter grocery budget" />
          </div>
          <div>
            <Label htmlFor="transportation">Transportation</Label>
            <Input id="transportation" type="number" placeholder="Enter transportation costs" />
          </div>
          <div>
            <Label htmlFor="debt">Debt Payments</Label>
            <Input id="debt" type="number" placeholder="Enter debt payments" />
          </div>
        </div>
        <Button className="w-full">Calculate Budget</Button>
      </CardContent>
    </Card>
  );

  const renderSafetyPlanner = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Safety Planning Tool
        </CardTitle>
        <CardDescription>
          Create a personalized safety plan for your protection and peace of mind
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="safe-contacts">Emergency Contacts</Label>
          <Textarea 
            id="safe-contacts" 
            placeholder="List trusted people you can contact in an emergency..."
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="safe-places">Safe Places</Label>
          <Textarea 
            id="safe-places" 
            placeholder="List safe places you can go (friend's house, shelter, etc.)..."
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="important-documents">Important Documents Location</Label>
          <Textarea 
            id="important-documents" 
            placeholder="Where you keep important documents (ID, insurance, etc.)..."
            rows={2}
          />
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Emergency Numbers</h4>
          <p className="text-sm text-red-700">911 - Emergency Services</p>
          <p className="text-sm text-red-700">1-800-799-7233 - National Domestic Violence Hotline</p>
          <p className="text-sm text-red-700">988 - Suicide & Crisis Lifeline</p>
        </div>
        <Button className="w-full">Generate Safety Plan</Button>
      </CardContent>
    </Card>
  );

  const renderGoalSetter = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          SMART Goal Planner
        </CardTitle>
        <CardDescription>
          Set Specific, Measurable, Achievable, Relevant, Time-bound goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="goal-description">Goal Description</Label>
          <Input id="goal-description" placeholder="What do you want to achieve?" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="specific">Specific - What exactly will you do?</Label>
            <Textarea id="specific" rows={2} placeholder="Be specific about your goal..." />
          </div>
          <div>
            <Label htmlFor="measurable">Measurable - How will you track progress?</Label>
            <Textarea id="measurable" rows={2} placeholder="How will you measure success..." />
          </div>
          <div>
            <Label htmlFor="achievable">Achievable - Is this realistic?</Label>
            <Textarea id="achievable" rows={2} placeholder="Why is this goal achievable..." />
          </div>
          <div>
            <Label htmlFor="relevant">Relevant - Why is this important?</Label>
            <Textarea id="relevant" rows={2} placeholder="Why does this goal matter..." />
          </div>
        </div>
        <div>
          <Label htmlFor="timeline">Time-bound - When will you complete this?</Label>
          <Input id="timeline" type="date" />
        </div>
        <Button className="w-full">Create Goal Plan</Button>
      </CardContent>
    </Card>
  );

  const renderToolContent = (toolId: string) => {
    switch (toolId) {
      case 'budget-calculator':
        return renderBudgetCalculator();
      case 'safety-planner':
        return renderSafetyPlanner();
      case 'goal-setter':
        return renderGoalSetter();
      default:
        return (
          <Card className="mt-4">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">This tool is being developed and will be available soon.</p>
              <p className="text-sm text-gray-500 mt-2">
                In the meantime, feel free to ask your AI coach about this topic!
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Coaching Tools & Resources</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card 
            key={tool.id} 
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              activeTool === tool.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {tool.icon}
                  <CardTitle className="text-sm">{tool.name}</CardTitle>
                </div>
                <Badge className={tool.color}>
                  Tool
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                variant={activeTool === tool.id ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTool(activeTool === tool.id ? null : tool.id);
                }}
              >
                {activeTool === tool.id ? 'Close Tool' : 'Open Tool'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {activeTool && renderToolContent(activeTool)}
    </div>
  );
}