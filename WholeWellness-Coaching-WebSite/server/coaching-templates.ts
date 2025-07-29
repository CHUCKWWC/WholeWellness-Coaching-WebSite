// Comprehensive coaching templates for testing
// Based on evidence-based nutrition and fitness principles

export interface PersonalizedPlan {
  mealPlan: any[];
  workoutPlan: any[];
  nutritionTips: string[];
  motivation: string;
}

export class CoachingTemplates {
  static generatePersonalizedPlan(profile: any): PersonalizedPlan {
    const calorieTarget = this.calculateCalorieTarget(profile);
    const activityMultiplier = this.getActivityMultiplier(profile.activityLevel);
    
    return {
      mealPlan: this.generateMealPlan(profile, calorieTarget),
      workoutPlan: this.generateWorkoutPlan(profile),
      nutritionTips: this.generateNutritionTips(profile),
      motivation: this.generateMotivation(profile)
    };
  }

  private static calculateCalorieTarget(profile: any): number {
    // Mifflin-St Jeor Equation for BMR
    const heightCm = this.parseHeight(profile.height);
    const weightKg = profile.currentWeight * 0.453592;
    
    let bmr;
    // Assume female for this calculation (can be enhanced with gender input)
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * profile.age) - 161;
    
    const activityMultiplier = this.getActivityMultiplier(profile.activityLevel);
    const tdee = bmr * activityMultiplier;
    
    // Create deficit for weight loss (500-750 calories)
    const deficit = Math.min(750, Math.max(300, (profile.currentWeight - profile.goalWeight) * 25));
    return Math.round(tdee - deficit);
  }

  private static parseHeight(height: string): number {
    // Convert various height formats to cm
    if (height.includes('cm')) {
      return parseInt(height.replace(/\D/g, ''));
    }
    if (height.includes("'") || height.includes('feet')) {
      const feet = parseInt(height.match(/(\d+)/)?.[0] || '5');
      const inches = parseInt(height.match(/(\d+).*?(\d+)/)?.[2] || '6');
      return (feet * 12 + inches) * 2.54;
    }
    return 168; // Default height
  }

  private static getActivityMultiplier(level: string): number {
    const multipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'lightly-active': 1.375,
      'moderately-active': 1.55,
      'very-active': 1.725,
      'extremely-active': 1.9
    };
    return multipliers[level] || 1.375;
  }

  private static generateMealPlan(profile: any, calorieTarget: number): any[] {
    const isVegetarian = profile.dietaryRestrictions?.includes('Vegetarian');
    const isVegan = profile.dietaryRestrictions?.includes('Vegan');
    const isGlutenFree = profile.dietaryRestrictions?.includes('Gluten-Free');
    const isDairyFree = profile.dietaryRestrictions?.includes('Dairy-Free');

    const breakfastCalories = Math.round(calorieTarget * 0.25);
    const lunchCalories = Math.round(calorieTarget * 0.35);
    const dinnerCalories = Math.round(calorieTarget * 0.3);
    const snackCalories = Math.round(calorieTarget * 0.1);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => ({
      day,
      meals: {
        breakfast: this.getBreakfastMeal(breakfastCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree }),
        lunch: this.getLunchMeal(lunchCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree }),
        dinner: this.getDinnerMeal(dinnerCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree }),
        snacks: [this.getSnackMeal(snackCalories, { isVegetarian, isVegan, isGlutenFree, isDairyFree })]
      },
      totalCalories: calorieTarget,
      macros: {
        protein: Math.round(calorieTarget * 0.3 / 4),
        carbs: Math.round(calorieTarget * 0.4 / 4),
        fat: Math.round(calorieTarget * 0.3 / 9)
      }
    }));
  }

  private static getBreakfastMeal(calories: number, restrictions: any) {
    const options = [
      {
        name: "Greek Yogurt Berry Bowl",
        ingredients: ["Greek yogurt", "mixed berries", "granola", "honey"],
        instructions: "Combine 1 cup Greek yogurt with 1/2 cup berries, top with 1/4 cup granola and drizzle honey",
        vegetarian: true, vegan: false, glutenFree: true, dairyFree: false
      },
      {
        name: "Overnight Oats with Almond Butter",
        ingredients: ["rolled oats", "almond milk", "almond butter", "chia seeds", "banana"],
        instructions: "Mix 1/2 cup oats with 1/2 cup almond milk, 1 tbsp almond butter, 1 tsp chia seeds. Refrigerate overnight, top with sliced banana",
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      },
      {
        name: "Vegetable Scramble",
        ingredients: ["eggs", "spinach", "bell peppers", "mushrooms", "olive oil"],
        instructions: "Scramble 2 eggs with sautéed vegetables in 1 tsp olive oil. Serve with side of fruit",
        vegetarian: true, vegan: false, glutenFree: true, dairyFree: true
      }
    ];

    const suitable = options.filter(option => 
      (!restrictions.isVegan || option.vegan) &&
      (!restrictions.isVegetarian || option.vegetarian) &&
      (!restrictions.isGlutenFree || option.glutenFree) &&
      (!restrictions.isDairyFree || option.dairyFree)
    );

    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }

  private static getLunchMeal(calories: number, restrictions: any) {
    const options = [
      {
        name: "Quinoa Power Bowl",
        ingredients: ["quinoa", "chickpeas", "roasted vegetables", "tahini dressing"],
        instructions: "Combine 3/4 cup cooked quinoa, 1/2 cup chickpeas, mixed roasted vegetables, drizzle with tahini",
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      },
      {
        name: "Mediterranean Salad",
        ingredients: ["mixed greens", "cucumber", "tomatoes", "olives", "feta", "olive oil"],
        instructions: "Toss greens with diced cucumber, tomatoes, olives, and feta. Dress with olive oil and lemon",
        vegetarian: true, vegan: false, glutenFree: true, dairyFree: false
      },
      {
        name: "Lentil Soup with Side Salad",
        ingredients: ["red lentils", "vegetables", "vegetable broth", "mixed greens"],
        instructions: "Simmer 1 cup lentils with diced vegetables in broth. Serve with side salad",
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      }
    ];

    const suitable = options.filter(option => 
      (!restrictions.isVegan || option.vegan) &&
      (!restrictions.isVegetarian || option.vegetarian) &&
      (!restrictions.isGlutenFree || option.glutenFree) &&
      (!restrictions.isDairyFree || option.dairyFree)
    );

    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }

  private static getDinnerMeal(calories: number, restrictions: any) {
    const options = [
      {
        name: "Baked Tofu with Roasted Vegetables",
        ingredients: ["tofu", "broccoli", "sweet potato", "olive oil", "herbs"],
        instructions: "Bake cubed tofu with seasoned roasted vegetables. Drizzle with herb-infused olive oil",
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      },
      {
        name: "Stuffed Bell Peppers",
        ingredients: ["bell peppers", "quinoa", "black beans", "corn", "tomatoes"],
        instructions: "Stuff peppers with mixture of quinoa, beans, corn, and diced tomatoes. Bake until tender",
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      },
      {
        name: "Vegetable Stir-fry with Brown Rice",
        ingredients: ["mixed vegetables", "brown rice", "sesame oil", "ginger", "garlic"],
        instructions: "Stir-fry vegetables with ginger and garlic in sesame oil. Serve over brown rice",
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      }
    ];

    const suitable = options.filter(option => 
      (!restrictions.isVegan || option.vegan) &&
      (!restrictions.isVegetarian || option.vegetarian) &&
      (!restrictions.isGlutenFree || option.glutenFree) &&
      (!restrictions.isDairyFree || option.dairyFree)
    );

    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }

  private static getSnackMeal(calories: number, restrictions: any) {
    const options = [
      {
        name: "Apple with Almond Butter",
        ingredients: ["apple", "almond butter"],
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      },
      {
        name: "Hummus with Vegetables",
        ingredients: ["hummus", "carrot sticks", "cucumber"],
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      },
      {
        name: "Trail Mix",
        ingredients: ["nuts", "seeds", "dried fruit"],
        vegetarian: true, vegan: true, glutenFree: true, dairyFree: true
      }
    ];

    const suitable = options.filter(option => 
      (!restrictions.isVegan || option.vegan) &&
      (!restrictions.isVegetarian || option.vegetarian) &&
      (!restrictions.isGlutenFree || option.glutenFree) &&
      (!restrictions.isDairyFree || option.dairyFree)
    );

    const selected = suitable[Math.floor(Math.random() * suitable.length)] || options[0];
    return { ...selected, calories };
  }

  private static generateWorkoutPlan(profile: any): any[] {
    const experience = profile.experience;
    const availableTime = parseInt(profile.availableTime?.match(/\d+/)?.[0] || '30');
    const preferredWorkouts = profile.preferredWorkouts || [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => {
      if (index % 2 === 0) {
        return this.getStrengthWorkout(day, experience, availableTime);
      } else if (index === 1 || index === 3) {
        return this.getCardioWorkout(day, experience, availableTime, preferredWorkouts);
      } else {
        return this.getActiveRecoveryWorkout(day, availableTime);
      }
    });
  }

  private static getStrengthWorkout(day: string, experience: string, duration: number) {
    const beginner = experience === 'beginner';
    const sets = beginner ? 2 : 3;
    const reps = beginner ? '12-15' : '8-12';

    return {
      day,
      type: 'Strength Training',
      duration,
      exercises: [
        {
          name: 'Bodyweight Squats',
          sets,
          reps,
          rest: '45-60 seconds',
          instructions: 'Stand with feet hip-width apart. Lower down as if sitting back into a chair, keep chest up.',
          modifications: 'Use chair for support if needed'
        },
        {
          name: 'Modified Push-ups',
          sets,
          reps,
          rest: '45-60 seconds',
          instructions: 'Start on knees or against wall. Lower chest toward surface, push back up.',
          modifications: 'Wall push-ups for beginners, full push-ups for advanced'
        },
        {
          name: 'Plank Hold',
          sets: 2,
          reps: '20-30 seconds',
          rest: '30 seconds',
          instructions: 'Hold straight line from head to heels, engage core.',
          modifications: 'Drop to knees if needed'
        }
      ],
      warmup: ['5 minutes marching in place', 'Arm circles', 'Gentle stretching'],
      cooldown: ['5 minutes walking', 'Full body stretching', 'Deep breathing']
    };
  }

  private static getCardioWorkout(day: string, experience: string, duration: number, preferred: string[]) {
    const hasWalking = preferred.includes('Walking/Jogging');
    const hasDancing = preferred.includes('Dancing');
    
    let mainActivity = 'Walking';
    if (hasDancing) mainActivity = 'Dance Cardio';
    if (hasWalking) mainActivity = 'Brisk Walking';

    return {
      day,
      type: 'Cardio',
      duration,
      exercises: [
        {
          name: mainActivity,
          sets: 1,
          reps: `${duration - 10} minutes`,
          rest: 'As needed',
          instructions: `Maintain moderate intensity where you can still hold a conversation.`,
          modifications: 'Reduce intensity or take breaks as needed'
        }
      ],
      warmup: ['5 minutes slow walking', 'Dynamic stretching'],
      cooldown: ['5 minutes slow walking', 'Static stretching']
    };
  }

  private static getActiveRecoveryWorkout(day: string, duration: number) {
    return {
      day,
      type: 'Active Recovery',
      duration: Math.min(duration, 30),
      exercises: [
        {
          name: 'Gentle Yoga Flow',
          sets: 1,
          reps: '15-20 minutes',
          rest: 'N/A',
          instructions: 'Focus on gentle stretching and breathing. Move slowly and mindfully.',
          modifications: 'Hold poses only as long as comfortable'
        }
      ],
      warmup: ['Deep breathing', 'Gentle neck and shoulder rolls'],
      cooldown: ['Meditation or relaxation', 'Gratitude practice']
    };
  }

  private static generateNutritionTips(profile: any): string[] {
    const baseIntake = this.calculateCalorieTarget(profile);
    const waterOz = Math.round(profile.currentWeight / 2);
    
    const tips = [
      `Aim for ${waterOz} oz of water daily (about ${Math.round(waterOz/8)} glasses)`,
      `Target ${Math.round(baseIntake * 0.3 / 4)}g protein daily to support muscle maintenance`,
      'Fill half your plate with colorful vegetables at each meal',
      'Choose complex carbohydrates like quinoa, sweet potatoes, and whole grains',
      'Include healthy fats from nuts, seeds, avocado, and olive oil'
    ];

    if (profile.dietaryRestrictions?.includes('Gluten-Free')) {
      tips.push('Focus on naturally gluten-free whole foods like fruits, vegetables, and quinoa');
    }

    if (profile.healthConditions?.includes('Diabetes')) {
      tips.push('Pair carbohydrates with protein or healthy fats to stabilize blood sugar');
    }

    if (profile.fitnessGoals?.includes('Increased Energy')) {
      tips.push('Eat regular meals every 3-4 hours to maintain stable energy levels');
    }

    return tips.slice(0, 5);
  }

  private static generateMotivation(profile: any): string {
    const motivations = [
      `${profile.name}, your journey toward ${profile.goalWeight} lbs is about creating lasting healthy habits, not just seeing a number on the scale.`,
      `Remember ${profile.name}, every healthy choice you make today is an investment in your future self and your goals of ${profile.fitnessGoals?.join(' and ') || 'better health'}.`,
      `${profile.name}, you have the strength to reach your goal of ${profile.goalWeight} lbs. Focus on progress, not perfection.`,
      `Your motivation to ${profile.motivation || 'improve your health'} is powerful, ${profile.name}. Trust the process and celebrate small victories.`,
      `${profile.name}, sustainable weight loss is a marathon, not a sprint. You're building skills that will serve you for life.`
    ];

    return motivations[Math.floor(Math.random() * motivations.length)];
  }
}