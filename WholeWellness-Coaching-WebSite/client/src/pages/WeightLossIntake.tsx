import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertWeightLossIntakeSchema, type InsertWeightLossIntake } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Scale, Activity, Brain } from "lucide-react";

const formSchema = insertWeightLossIntakeSchema.extend({
  age: insertWeightLossIntakeSchema.shape.age.refine(val => val >= 18, "Must be 18 or older"),
});

type FormData = InsertWeightLossIntake;

export default function WeightLossIntake() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: undefined,
      age: 18,
      height: "",
      currentWeight: "",
      goalWeight: "",
      medicalConditions: undefined,
      medications: undefined,
      allergies: undefined,
      digestiveIssues: undefined,
      physicalLimitations: undefined,
      weightLossMedications: undefined,
      weightHistory: undefined,
      previousAttempts: undefined,
      challengingAspects: undefined,
      currentEatingHabits: undefined,
      lifestyle: undefined,
      activityLevel: undefined,
      mindsetFactors: undefined,
      goalsExpectations: undefined,
      interestedInSupplements: false,
    },
  });

  const createIntakeMutation = useMutation({
    mutationFn: async (intake: InsertWeightLossIntake) => {
      const response = await apiRequest("/api/weight-loss-intakes", "POST", intake);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Intake Submitted Successfully!",
        description: "Thank you for completing the weight loss intake questionnaire. A coach will contact you soon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weight-loss-intakes"] });
      form.reset();
      setCurrentStep(0);
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your intake form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createIntakeMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formSteps = [
    {
      title: "Personal Information",
      icon: <Heart className="h-5 w-5" />,
      fields: ["fullName", "email", "phone", "age"],
    },
    {
      title: "Health & Body Information",
      icon: <Scale className="h-5 w-5" />,
      fields: ["height", "currentWeight", "goalWeight", "medicalConditions", "medications", "allergies", "digestiveIssues", "physicalLimitations", "weightLossMedications"],
    },
    {
      title: "Weight History & Previous Attempts",
      icon: <Activity className="h-5 w-5" />,
      fields: ["weightHistory", "previousAttempts", "challengingAspects", "currentEatingHabits"],
    },
    {
      title: "Lifestyle & Goals",
      icon: <Brain className="h-5 w-5" />,
      fields: ["lifestyle", "activityLevel", "mindsetFactors", "goalsExpectations", "interestedInSupplements"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Weight Loss Coaching Intake
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Complete this comprehensive questionnaire to help us create your personalized weight loss plan
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-4 mb-8">
            {formSteps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                  index <= currentStep
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {step.icon}
                <span className="font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {formSteps[currentStep].icon}
              <span>{formSteps[currentStep].title}</span>
            </CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {formSteps.length} - Please provide accurate information for the best results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height *</FormLabel>
                            <FormControl>
                              <Input placeholder="5'6&quot; or 168cm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Weight *</FormLabel>
                            <FormControl>
                              <Input placeholder="150 lbs or 68 kg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="goalWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Weight *</FormLabel>
                            <FormControl>
                              <Input placeholder="130 lbs or 59 kg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any diagnosed medical conditions (diabetes, hypertension, thyroid issues, etc.)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Include any conditions that may affect your weight loss journey
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="medications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Medications & Supplements</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List all medications and supplements you're currently taking" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="allergies"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Food Allergies & Intolerances</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List any food allergies or intolerances" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="digestiveIssues"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Digestive Issues</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any history of bloating, constipation, acid reflux, IBS, etc." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="physicalLimitations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physical Limitations & Injuries</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any physical limitations or injuries that affect movement or exercise" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weightLossMedications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight Loss Medications</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any prescribed weight loss medications you're currently taking" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="weightHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight History</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What has been your highest and lowest adult weight? Any significant weight changes?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Include information about when you were at your ideal weight and what helped you maintain it
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="previousAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Weight Loss Attempts</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What diets or weight loss programs have you tried? What worked best and why?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Include: Keto, Paleo, Low-Carb, Intermittent Fasting, Weight Watchers, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="challengingAspects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biggest Challenges</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What has been the most challenging part of losing or maintaining weight for you?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentEatingHabits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Eating Habits</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe a typical day of eating (meals, snacks, drinks). Include dining out frequency and food cravings." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="lifestyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lifestyle & Daily Routine</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your occupation, sleep patterns, stress levels, and biggest life stressors" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity & Fitness Level</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How often do you exercise? What activities do you enjoy? Any fitness goals or exercise limitations?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mindsetFactors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mindset & Emotional Factors</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Rate your motivation (1-10). What's your biggest 'why' for losing weight? Do you struggle with emotional eating? Describe your support system." 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goalsExpectations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goals & Expectations</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What is your primary goal? Ideal timeframe? What obstacles do you foresee? What support would help you most?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="interestedInSupplements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Interest in Supplements
                            </FormLabel>
                            <FormDescription>
                              I am interested in learning about vitamins, supplements, appetite suppressants or meal replacement products
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("interestedInSupplements") && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          We partner with Nature's Sunshine for high-quality supplements that can support your weight loss journey.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://healthbizdoc.mynsp.com", "_blank")}
                        >
                          Learn More About Supplements
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentStep < formSteps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                      Next Step
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createIntakeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createIntakeMutation.isPending ? "Submitting..." : "Submit Intake Form"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What Happens Next?
          </h3>
          <ul className="text-blue-700 dark:text-blue-300 space-y-2">
            <li>• A certified weight loss coach will review your intake within 24 hours</li>
            <li>• You'll receive a personalized 6-week meal plan designed for safe 1lb/week weight loss</li>
            <li>• Optional follow-up coaching sessions to support your journey</li>
            <li>• Access to our supportive community and resources</li>
          </ul>
        </div>
      </div>
    </div>
  );
}