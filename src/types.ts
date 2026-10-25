export type FitnessGoal = "muscle-gain" | "fat-loss" | "maintenance";

export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very-active";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  meal: MealType;
  checked: boolean;
  date: string; // YYYY-MM-DD
}

export interface GoalConfig {
  goal: FitnessGoal;
  targetCalories: number;
  targetProtein: number;
  targetWater: number;
}

export interface UserProfile {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Alternative Snacks",
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "sunrise",
  lunch: "sun",
  dinner: "moon",
  snacks: "apple",
};

export const GOAL_PRESETS: Record<
  FitnessGoal,
  { label: string; calories: number; protein: number; water: number; description: string }
> = {
  "muscle-gain": {
    label: "Muscle Gain",
    calories: 3200,
    protein: 180,
    water: 3500,
    description: "Caloric surplus with high protein to build lean mass.",
  },
  "fat-loss": {
    label: "Fat Loss",
    calories: 2100,
    protein: 160,
    water: 3000,
    description: "Caloric deficit while preserving muscle with ample protein.",
  },
  maintenance: {
    label: "Maintenance",
    calories: 2600,
    protein: 140,
    water: 3000,
    description: "Balanced intake to maintain your current physique.",
  },
};

export const ACTIVITY_LEVELS: Record<
  ActivityLevel,
  { label: string; multiplier: number; description: string }
> = {
  sedentary: {
    label: "Sedentary",
    multiplier: 1.2,
    description: "Little to no exercise, desk job",
  },
  light: {
    label: "Lightly Active",
    multiplier: 1.375,
    description: "Light exercise 1-3 days/week",
  },
  moderate: {
    label: "Moderately Active",
    multiplier: 1.55,
    description: "Moderate exercise 3-5 days/week",
  },
  active: {
    label: "Very Active",
    multiplier: 1.725,
    description: "Hard exercise 6-7 days/week",
  },
  "very-active": {
    label: "Extra Active",
    multiplier: 1.9,
    description: "Very hard exercise + physical job",
  },
};

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  "muscle-gain": "Muscle Gain",
  "fat-loss": "Fat Loss",
  maintenance: "Maintenance",
};

export function calculateTargets(profile: UserProfile): {
  calories: number;
  protein: number;
  water: number;
  bmr: number;
  tdee: number;
} {
  // Mifflin-St Jeor BMR
  const bmr =
    profile.sex === "male"
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;

  const tdee = bmr * ACTIVITY_LEVELS[profile.activityLevel].multiplier;

  let calories: number;
  let proteinPerKg: number;

  if (profile.goal === "fat-loss") {
    calories = tdee - 500; // ~0.5kg/week deficit
    proteinPerKg = 2.2;
  } else if (profile.goal === "muscle-gain") {
    calories = tdee + 300; // lean surplus
    proteinPerKg = 2.0;
  } else {
    calories = tdee;
    proteinPerKg = 1.8;
  }

  const protein = Math.round(profile.weightKg * proteinPerKg);
  const water = Math.round(profile.weightKg * 35); // 35ml per kg bodyweight

  return {
    calories: Math.round(calories),
    protein,
    water,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
  };
}
