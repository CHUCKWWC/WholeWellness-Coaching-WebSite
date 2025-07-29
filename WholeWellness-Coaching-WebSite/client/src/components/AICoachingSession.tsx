import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Target, 
  Clock, 
  Activity, 
  Apple, 
  Dumbbell, 
  Heart, 
  Lightbulb,
  CheckCircle,
  Loader2,
  ChevronRight,
  Star
} from "lucide-react";

interface CoachingProfile {
  name: string;
  age: number;
  height: string;
  currentWeight: number;
  goalWeight: number;
  activityLevel: string;
  dietaryRestrictions: string[];
  healthConditions: string[];
  fitnessGoals: string[];
  preferredWorkouts: string[];
  availableTime: string;
  experience: string;
  motivation: string;
}

interface AICoachingSessionProps {
  sessionType: string;
  onComplete: () => void;
  betaMode?: boolean;
}

const dietaryOptions = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
  "Keto", "Low-Carb", "Paleo", "Mediterranean", "None"
];

const healthConditionOptions = [
  "Diabetes", "High Blood Pressure", "Heart Disease", "Arthritis",
  "Thyroid Issues", "PCOS", "Food Allergies", "None"
];

const fitnessGoalOptions = [
  "Weight Loss", "Muscle Building", "Improved Endurance", "Better Flexibility",
  "Stress Reduction", "Better Sleep", "Increased Energy", "Overall Health"
];

const workoutOptions = [
  "Walking/Jogging", "Strength Training", "Yoga", "Swimming",
  "Dancing", "Home Workouts", "Gym Classes", "Outdoor Activities"
];

export default function AICoachingSession({ sessionType, onComplete, betaMode = false }: AICoachingSessionProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<CoachingProfile>>({
    dietaryRestrictions: [],
    healthConditions: [],
    fitnessGoals: [],
    preferredWorkouts: []
  });
  const [results, setResults] = useState<any>(null);
  const [currentResult, setCurrentResult] = useState<string | null>(null);

  const generateMealPlan = useMutation({
    mutationFn: async (profileData: CoachingProfile) => {
      const response = await apiRequest("POST", "/api/ai-coaching/generate-meal-plan", profileData);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, mealPlan: data.mealPlan }));
      setCurrentResult("mealPlan");
      toast({
        title: "Meal Plan Generated!",
        description: "Your personalized 7-day meal plan is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const generateWorkoutPlan = useMutation({
    mutationFn: async (profileData: CoachingProfile) => {
      const response = await apiRequest("POST", "/api/ai-coaching/generate-workout-plan", profileData);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, workoutPlan: data.workoutPlan }));
      setCurrentResult("workoutPlan");
      toast({
        title: "Workout Plan Generated!",
        description: "Your personalized exercise routine is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const generateMotivation = useMutation({
    mutationFn: async (profileData: CoachingProfile) => {
      const response = await apiRequest("POST", "/api/ai-coaching/motivational-message", {
        profile: profileData
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, motivation: data.message }));
      setCurrentResult("motivation");
      toast({
        title: "Motivation Generated!",
        description: "Your personalized message is ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const generateNutritionTips = useMutation({
    mutationFn: async (profileData: CoachingProfile) => {
      const response = await apiRequest("POST", "/api/ai-coaching/nutrition-tips", profileData);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(prev => ({ ...prev, nutritionTips: data.tips }));
      setCurrentResult("nutritionTips");
      toast({
        title: "Tips Generated!",
        description: "Your personalized nutrition tips are ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Start AI generation based on session type
      const completeProfile = profile as CoachingProfile;
      
      switch (sessionType) {
        case "nutritionist":
          generateMealPlan.mutate(completeProfile);
          generateNutritionTips.mutate(completeProfile);
          break;
        case "fitness-trainer":
          generateWorkoutPlan.mutate(completeProfile);
          break;
        case "wellness-coordinator":
          generateMealPlan.mutate(completeProfile);
          generateWorkoutPlan.mutate(completeProfile);
          generateNutritionTips.mutate(completeProfile);
          break;
        default:
          generateMotivation.mutate(completeProfile);
      }
      setStep(4);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: string, value: string) => {
    setProfile(prev => {
      const currentArray = (prev as any)[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: string) => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return profile.name && profile.age && profile.height && profile.currentWeight && profile.goalWeight;
      case 2:
        return profile.activityLevel && profile.availableTime && profile.experience;
      case 3:
        return profile.motivation && profile.fitnessGoals && profile.fitnessGoals.length > 0;
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>Tell us about yourself to create your personalized plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profile.name || ""}
              onChange={(e) => updateProfile("name", e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={profile.age || ""}
              onChange={(e) => updateProfile("age", parseInt(e.target.value))}
              placeholder="Enter your age"
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={profile.height || ""}
              onChange={(e) => updateProfile("height", e.target.value)}
              placeholder="e.g., 5 feet 6 inches or 168cm"
            />
          </div>
          <div>
            <Label htmlFor="currentWeight">Current Weight (lbs)</Label>
            <Input
              id="currentWeight"
              type="number"
              value={profile.currentWeight || ""}
              onChange={(e) => updateProfile("currentWeight", parseInt(e.target.value))}
              placeholder="Enter current weight"
            />
          </div>
          <div>
            <Label htmlFor="goalWeight">Goal Weight (lbs)</Label>
            <Input
              id="goalWeight"
              type="number"
              value={profile.goalWeight || ""}
              onChange={(e) => updateProfile("goalWeight", parseInt(e.target.value))}
              placeholder="Enter goal weight"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity & Preferences
        </CardTitle>
        <CardDescription>Help us understand your lifestyle and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Activity Level</Label>
          <Select value={profile.activityLevel || ""} onValueChange={(value) => updateProfile("activityLevel", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your activity level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary (Little to no exercise)</SelectItem>
              <SelectItem value="lightly-active">Lightly Active (Light exercise 1-3 days/week)</SelectItem>
              <SelectItem value="moderately-active">Moderately Active (Moderate exercise 3-5 days/week)</SelectItem>
              <SelectItem value="very-active">Very Active (Hard exercise 6-7 days/week)</SelectItem>
              <SelectItem value="extremely-active">Extremely Active (Very hard exercise, physical job)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Available Time for Exercise</Label>
          <Select value={profile.availableTime || ""} onValueChange={(value) => updateProfile("availableTime", value)}>
            <SelectTrigger>
              <SelectValue placeholder="How much time can you dedicate?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15-30 min">15-30 minutes</SelectItem>
              <SelectItem value="30-45 min">30-45 minutes</SelectItem>
              <SelectItem value="45-60 min">45-60 minutes</SelectItem>
              <SelectItem value="60+ min">60+ minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Exercise Experience</Label>
          <Select value={profile.experience || ""} onValueChange={(value) => updateProfile("experience", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner (New to exercise)</SelectItem>
              <SelectItem value="intermediate">Intermediate (Some experience)</SelectItem>
              <SelectItem value="advanced">Advanced (Regular exerciser)</SelectItem>
              <SelectItem value="expert">Expert (Fitness enthusiast)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Dietary Restrictions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {dietaryOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`diet-${option}`}
                  checked={profile.dietaryRestrictions?.includes(option)}
                  onCheckedChange={() => toggleArrayField("dietaryRestrictions", option)}
                />
                <Label htmlFor={`diet-${option}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Health Conditions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {healthConditionOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`health-${option}`}
                  checked={profile.healthConditions?.includes(option)}
                  onCheckedChange={() => toggleArrayField("healthConditions", option)}
                />
                <Label htmlFor={`health-${option}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Motivation
        </CardTitle>
        <CardDescription>Define your goals and what motivates you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Primary Fitness Goals</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {fitnessGoalOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${option}`}
                  checked={profile.fitnessGoals?.includes(option)}
                  onCheckedChange={() => toggleArrayField("fitnessGoals", option)}
                />
                <Label htmlFor={`goal-${option}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferred Workout Types</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {workoutOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`workout-${option}`}
                  checked={profile.preferredWorkouts?.includes(option)}
                  onCheckedChange={() => toggleArrayField("preferredWorkouts", option)}
                />
                <Label htmlFor={`workout-${option}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="motivation">What motivates you to lose weight?</Label>
          <Textarea
            id="motivation"
            value={profile.motivation || ""}
            onChange={(e) => updateProfile("motivation", e.target.value)}
            placeholder="Tell us what drives you to achieve your goals..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your Personalized AI Coaching Results
          </CardTitle>
          <CardDescription>
            Based on your profile, here's your customized plan
          </CardDescription>
        </CardHeader>
      </Card>

      {results?.mealPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-5 w-5" />
              Personalized Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.mealPlan.slice(0, 3).map((day: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{day.day}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium">Breakfast</h5>
                      <p>{day.meals.breakfast.name}</p>
                      <p className="text-gray-600">{day.meals.breakfast.calories} cal</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Lunch</h5>
                      <p>{day.meals.lunch.name}</p>
                      <p className="text-gray-600">{day.meals.lunch.calories} cal</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Dinner</h5>
                      <p>{day.meals.dinner.name}</p>
                      <p className="text-gray-600">{day.meals.dinner.calories} cal</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Total: {day.totalCalories} calories | 
                    Protein: {day.macros.protein}g | 
                    Carbs: {day.macros.carbs}g | 
                    Fat: {day.macros.fat}g
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results?.workoutPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Personalized Workout Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.workoutPlan.slice(0, 3).map((day: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{day.day} - {day.type}</h4>
                  <p className="text-sm text-gray-600 mb-3">Duration: {day.duration} minutes</p>
                  <div className="space-y-2">
                    {day.exercises.slice(0, 3).map((exercise: any, exerciseIndex: number) => (
                      <div key={exerciseIndex} className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium">{exercise.name}</h5>
                        <p className="text-sm">{exercise.sets} sets × {exercise.reps} reps</p>
                        <p className="text-sm text-gray-600">{exercise.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results?.motivation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Personalized Motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg italic">{results.motivation}</p>
          </CardContent>
        </Card>
      )}

      {results?.nutritionTips && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Personalized Nutrition Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {results.nutritionTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={onComplete} size="lg">
          Complete Testing Session
        </Button>
      </div>
    </div>
  );

  const isGenerating = generateMealPlan.isPending || generateWorkoutPlan.isPending || 
                     generateMotivation.isPending || generateNutritionTips.isPending;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={(step / 4) * 100} className="w-full" />
        <p className="text-sm text-gray-600 mt-2">Step {step} of 4</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && (
            <div>
              {isGenerating ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Generating Your Personalized Plan</h3>
                    <p className="text-gray-600 text-center">
                      Our AI is creating a customized coaching experience based on your profile...
                    </p>
                  </CardContent>
                </Card>
              ) : (
                renderResults()
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step < 4 && (
        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleNext} 
            disabled={!isStepComplete()}
            size="lg"
          >
            {step === 3 ? "Generate My Plan" : "Next"}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}