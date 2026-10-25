import { useCallback, useEffect, useMemo, useState } from "react";
import { Settings, Flame, Calendar, Dumbbell } from "lucide-react";
import type { FoodItem, GoalConfig, MealType, UserProfile } from "@/types";
import { GOAL_PRESETS, GOAL_LABELS, MEAL_LABELS, MEAL_ORDER } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ProgressRing, ProgressBar } from "@/components/Progress";
import { MealChecklist } from "@/components/MealChecklist";
import { MacroCalculator } from "@/components/MacroCalculator";
import { AddFood } from "@/components/AddFood";
import { WaterTracker } from "@/components/WaterTracker";
import { WeeklyStats } from "@/components/WeeklyStats";

const DEFAULT_GOAL: GoalConfig = {
  goal: "maintenance",
  targetCalories: GOAL_PRESETS.maintenance.calories,
  targetProtein: GOAL_PRESETS.maintenance.protein,
  targetWater: GOAL_PRESETS.maintenance.water,
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateHeading(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const SAMPLE_FOODS: Omit<FoodItem, "id" | "date">[] = [
  { name: "Oatmeal with berries", calories: 350, protein: 12, meal: "breakfast", checked: false },
  { name: "Greek yogurt", calories: 150, protein: 17, meal: "breakfast", checked: false },
  { name: "Grilled chicken & rice", calories: 650, protein: 45, meal: "lunch", checked: false },
  { name: "Protein shake", calories: 220, protein: 30, meal: "snacks", checked: false },
];

export default function App() {
  const [goalConfig, setGoalConfig] = useLocalStorage<GoalConfig>("macrofit-goal", DEFAULT_GOAL);
  const [foodByDate, setFoodByDate] = useLocalStorage<Record<string, FoodItem[]>>(
    "macrofit-foods",
    {},
  );
  const [showCalculator, setShowCalculator] = useState(false);
  const [addMeal, setAddMeal] = useState<MealType | null>(null);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(
    "macrofit-profile",
    null,
  );

  // Show calculator automatically on first visit (no profile yet)
  useEffect(() => {
    if (!userProfile) setShowCalculator(true);
  }, [userProfile]);
  const [waterByDate, setWaterByDate] = useLocalStorage<Record<string, number>>(
    "macrofit-water",
    {},
  );

  const today = todayStr();
  const todaysWater = waterByDate[today] ?? 0;

  // Seed sample foods on first load for today
  const todaysFoods = useMemo(() => {
    if (foodByDate[today]) return foodByDate[today];
    return SAMPLE_FOODS.map((f) => ({ ...f, id: genId(), date: today }));
  }, [foodByDate, today]);

  const setFoods = useCallback(
    (next: FoodItem[]) => {
      setFoodByDate((prev) => ({ ...prev, [today]: next }));
    },
    [setFoodByDate, today],
  );

  const toggleItem = useCallback(
    (id: string) => {
      setFoods(todaysFoods.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)));
    },
    [todaysFoods, setFoods],
  );

  const deleteItem = useCallback(
    (id: string) => {
      setFoods(todaysFoods.filter((f) => f.id !== id));
    },
    [todaysFoods, setFoods],
  );

  const addItem = useCallback(
    (meal: MealType, name: string, calories: number, protein: number) => {
      setFoods([
        ...todaysFoods,
        { id: genId(), name, calories, protein, meal, checked: false, date: today },
      ]);
      setAddMeal(null);
    },
    [todaysFoods, setFoods, today],
  );

  const setWater = useCallback(
    (glasses: number) =>
      setWaterByDate((prev) => ({ ...prev, [today]: Math.max(glasses, 0) })),
    [setWaterByDate, today],
  );

  const resetWater = useCallback(
    () => setWaterByDate((prev) => ({ ...prev, [today]: 0 })),
    [setWaterByDate, today],
  );

  const totals = useMemo(() => {
    return todaysFoods
      .filter((f) => f.checked)
      .reduce(
        (acc, f) => ({ calories: acc.calories + f.calories, protein: acc.protein + f.protein }),
        { calories: 0, protein: 0 },
      );
  }, [todaysFoods]);

  const goalLabel = GOAL_LABELS[goalConfig.goal];
  const caloriePct =
    goalConfig.targetCalories > 0
      ? Math.min((totals.calories / goalConfig.targetCalories) * 100, 100)
      : 0;

  const proteinPct =
    goalConfig.targetProtein > 0
      ? Math.min((totals.protein / goalConfig.targetProtein) * 100, 100)
      : 0;

  const MEAL_COLORS: Record<MealType, string> = {
    breakfast: "#f59e0b",
    lunch: "#0ea5e9",
    dinner: "#6366f1",
    snacks: "#10b981",
  };

  const proteinSegments = MEAL_ORDER.map((meal) => ({
    label: MEAL_LABELS[meal].split(" ")[0],
    value: todaysFoods
      .filter((f) => f.checked && f.meal === meal)
      .reduce((s, f) => s + f.protein, 0),
    color: MEAL_COLORS[meal],
  })).filter((s) => s.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Dumbbell size={20} />
            </span>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">MacroFit</h1>
              <p className="-mt-0.5 text-[11px] font-medium text-slate-400">Daily Nutrition Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setShowCalculator(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <Settings size={16} className={goalConfig.goal !== "maintenance" ? "text-emerald-600" : ""} />
            <span className="hidden sm:inline">{goalLabel}</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Date row */}
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Calendar size={16} />
          {formatDateHeading(today)}
        </div>

        {/* Dashboard */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div className="flex flex-col items-center justify-center">
              <ProgressRing
                value={totals.calories}
                max={goalConfig.targetCalories}
                label="Calories"
                unit="kcal"
                color="url(#calGrad)"
                trackColor="#f1f5f9"
              />
              <svg className="absolute" width="0" height="0">
                <defs>
                  <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex flex-col justify-center gap-5">
              <ProgressBar
                value={totals.protein}
                max={goalConfig.targetProtein}
                label="Protein"
                unit="g"
                color="url(#protGrad)"
                trackColor="#f1f5f9"
                segments={proteinSegments}
              />
              <svg className="absolute" width="0" height="0">
                <defs>
                  <linearGradient id="protGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <StatCard
                  label="Eaten"
                  value={`${totals.calories.toLocaleString()}`}
                  unit="kcal"
                  icon={<Flame size={16} />}
                  tint="text-orange-600 bg-orange-50"
                />
                <StatCard
                  label="Remaining"
                  value={`${Math.max(goalConfig.targetCalories - totals.calories, 0).toLocaleString()}`}
                  unit="kcal"
                  icon={<Calendar size={16} />}
                  tint="text-sky-600 bg-sky-50"
                />
              </div>
            </div>
          </div>

          {/* Goal banner */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3">
            <span className="text-xs font-medium text-slate-500">
              Goal: <span className="font-bold text-slate-700">{goalLabel}</span>
            </span>
            <span className="text-xs font-medium text-slate-400">
              {Math.round(caloriePct)}% of calorie target
            </span>
          </div>
        </section>

        {/* Water Intake */}
        <section className="mb-8">
          <WaterTracker
            glasses={todaysWater}
            targetMl={goalConfig.targetWater}
            onSet={setWater}
            onReset={resetWater}
          />
        </section>

        {/* Meal Checklist */}
        <section>
          <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wide text-slate-500">
            Today's Meals
          </h2>
          <MealChecklist
            items={todaysFoods}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onAdd={(meal) => setAddMeal(meal)}
            onQuickAdd={(meal, name, cal, prot) => addItem(meal, name, cal, prot)}
          />
        </section>

        {/* Weekly Stats */}
        <section className="mb-8">
          <WeeklyStats
            foodByDate={foodByDate}
            waterByDate={waterByDate}
            goalConfig={goalConfig}
          />
        </section>

        <footer className="mt-10 pb-6 text-center text-xs text-slate-400">
          MacroFit · Your data stays on this device
        </footer>
      </main>

      {showCalculator && (
        <MacroCalculator
          profile={userProfile}
          onSave={(profile, config) => {
            setUserProfile(profile);
            setGoalConfig(config);
            setShowCalculator(false);
          }}
          onClose={() => {
            if (userProfile) setShowCalculator(false);
          }}
        />
      )}

      {addMeal && (
        <AddFood
          meal={addMeal}
          onAdd={(name, cal, prot) => addItem(addMeal, name, cal, prot)}
          onClose={() => setAddMeal(null)}
        />
      )}

    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  icon,
  tint,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3.5">
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tint}`}>
          {icon}
        </span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-lg font-bold tabular-nums text-slate-800">
        {value}
        <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>
      </p>
    </div>
  );
}
