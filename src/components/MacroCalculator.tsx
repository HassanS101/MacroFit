import { useEffect, useMemo, useState } from "react";
import {
  X,
  Dumbbell,
  Flame,
  Activity,
  Calculator,
  Droplet,
  Check,
  ArrowRight,
} from "lucide-react";
import type {
  ActivityLevel,
  FitnessGoal,
  GoalConfig,
  Sex,
  UserProfile,
} from "@/types";
import { ACTIVITY_LEVELS, GOAL_LABELS, calculateTargets } from "@/types";

const GOAL_META: Record<
  FitnessGoal,
  { icon: typeof Dumbbell; gradient: string; ring: string }
> = {
  "muscle-gain": {
    icon: Dumbbell,
    gradient: "from-sky-500 to-cyan-500",
    ring: "ring-sky-400",
  },
  "fat-loss": {
    icon: Flame,
    gradient: "from-orange-500 to-red-500",
    ring: "ring-orange-400",
  },
  maintenance: {
    icon: Activity,
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-400",
  },
};

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const ACTIVITY_ORDER: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very-active",
];

interface MacroCalculatorProps {
  profile: UserProfile | null;
  onSave: (profile: UserProfile, config: GoalConfig) => void;
  onClose: () => void;
}

export function MacroCalculator({ profile, onSave, onClose }: MacroCalculatorProps) {
  const [sex, setSex] = useState<Sex>(profile?.sex ?? "male");
  const [age, setAge] = useState(String(profile?.age ?? 25));
  const [weightKg, setWeightKg] = useState(String(profile?.weightKg ?? 80));
  const [heightCm, setHeightCm] = useState(String(profile?.heightCm ?? 178));
  const [targetWeightKg, setTargetWeightKg] = useState(
    String(profile?.targetWeightKg ?? 80),
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel ?? "moderate",
  );
  const [goal, setGoal] = useState<FitnessGoal>(profile?.goal ?? "maintenance");
  const [showResults, setShowResults] = useState(false);

  // Editable targets
  const [editCalories, setEditCalories] = useState("0");
  const [editProtein, setEditProtein] = useState("0");
  const [editWater, setEditWater] = useState("0");

  const computed = useMemo(() => {
    const numAge = parseInt(age, 10);
    const numWeight = parseFloat(weightKg);
    const numHeight = parseFloat(heightCm);
    const numTarget = parseFloat(targetWeightKg);
    if (!numAge || !numWeight || !numHeight || !numTarget) return null;

    return calculateTargets({
      sex,
      age: numAge,
      weightKg: numWeight,
      heightCm: numHeight,
      targetWeightKg: numTarget,
      activityLevel,
      goal,
    });
  }, [sex, age, weightKg, heightCm, targetWeightKg, activityLevel, goal]);

  useEffect(() => {
    if (computed) {
      setEditCalories(String(computed.calories));
      setEditProtein(String(computed.protein));
      setEditWater(String(computed.water));
    }
  }, [computed?.calories, computed?.protein, computed?.water]);

  const handleCalculate = () => {
    if (computed) setShowResults(true);
  };

  const handleSave = () => {
    if (!computed) return;
    const numAge = parseInt(age, 10);
    const numWeight = parseFloat(weightKg);
    const numHeight = parseFloat(heightCm);
    const numTarget = parseFloat(targetWeightKg);

    const newProfile: UserProfile = {
      sex,
      age: numAge,
      weightKg: numWeight,
      heightCm: numHeight,
      targetWeightKg: numTarget,
      activityLevel,
      goal,
    };

    onSave(newProfile, {
      goal,
      targetCalories: parseInt(editCalories, 10) || computed.calories,
      targetProtein: parseInt(editProtein, 10) || computed.protein,
      targetWater: parseInt(editWater, 10) || computed.water,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="mb-0 w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:mb-0 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Calculator size={18} />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {showResults ? "Your Daily Targets" : "Macro Calculator"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {!showResults ? (
          <div className="space-y-4 px-6 py-4">
            {/* Sex, Age, Height */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Sex</label>
                <div className="grid grid-cols-2 gap-1">
                  {SEX_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSex(opt.value)}
                      className={`rounded-lg border-2 py-2 text-xs font-semibold transition-all ${
                        sex === opt.value
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <NumberField label="Age" value={age} onChange={setAge} suffix="yrs" />
              <NumberField label="Height" value={heightCm} onChange={setHeightCm} suffix="cm" />
            </div>

            {/* Weight + Target weight */}
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Weight" value={weightKg} onChange={setWeightKg} suffix="kg" />
              <NumberField
                label="Target weight"
                value={targetWeightKg}
                onChange={setTargetWeightKg}
                suffix="kg"
              />
            </div>

            {/* Activity level */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Weekly activity level
              </label>
              <div className="space-y-1.5">
                {ACTIVITY_ORDER.map((level) => {
                  const meta = ACTIVITY_LEVELS[level];
                  const active = activityLevel === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setActivityLevel(level)}
                      className={`flex w-full items-center justify-between rounded-xl border-2 px-3 py-1.5 text-left transition-all ${
                        active
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className={`text-sm font-bold ${active ? "text-emerald-700" : "text-slate-700"}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400">{meta.description}</span>
                      {active && <Check size={14} className="text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your goal</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(GOAL_LABELS) as FitnessGoal[]).map((g) => {
                  const meta = GOAL_META[g];
                  const Icon = meta.icon;
                  const active = goal === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-center transition-all ${
                        active
                          ? `border-transparent ring-2 ${meta.ring} bg-slate-50`
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-white`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className={`text-xs font-bold ${active ? "text-slate-800" : "text-slate-600"}`}>
                        {GOAL_LABELS[g]}
                      </span>
                      {active && (
                        <Check size={14} className="text-slate-700" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!computed}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Calculate my targets
              <ArrowRight size={18} />
            </button>
          </div>
        ) : computed ? (
          <div className="space-y-4 px-6 py-4">
            {/* Computed summary */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={16} className="text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Based on your stats
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow label="BMR (at rest)" value={`${computed.bmr.toLocaleString()} kcal`} />
                <InfoRow label="TDEE (with activity)" value={`${computed.tdee.toLocaleString()} kcal`} />
                <InfoRow label="Current weight" value={`${weightKg} kg`} />
                <InfoRow label="Target weight" value={`${targetWeightKg} kg`} />
              </div>
              <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-500">
                {goal === "fat-loss"
                  ? "500 kcal deficit for ~0.5 kg/week fat loss. Protein set high to preserve muscle."
                  : goal === "muscle-gain"
                    ? "300 kcal surplus for lean muscle growth. Protein at 2.0g/kg bodyweight."
                    : "Calories match your activity burn. Protein at 1.8g/kg to maintain."}
              </p>
            </div>

            {/* Editable targets */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Calculator size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-700">
                  Your daily targets
                </span>
                <span className="text-xs font-normal text-slate-400">(tap to edit)</span>
              </div>

              <div className="space-y-3">
                <EditableTarget
                  icon={<Flame size={18} />}
                  iconTint="bg-orange-50 text-orange-600"
                  label="Calories"
                  unit="kcal"
                  value={editCalories}
                  onChange={setEditCalories}
                  suggested={computed.calories}
                />
                <EditableTarget
                  icon={<Dumbbell size={18} />}
                  iconTint="bg-emerald-50 text-emerald-600"
                  label="Protein"
                  unit="g"
                  value={editProtein}
                  onChange={setEditProtein}
                  suggested={computed.protein}
                />
                <EditableTarget
                  icon={<Droplet size={18} />}
                  iconTint="bg-sky-50 text-sky-600"
                  label="Water"
                  unit="ml"
                  value={editWater}
                  onChange={setEditWater}
                  suggested={computed.water}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-700"
              >
                Save & apply targets
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "" : ""}>
      <label className="mb-1 block text-xs font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-800 outline-none transition-colors focus:border-slate-800 focus:bg-white"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-bold tabular-nums text-slate-800">{value}</span>
    </div>
  );
}

function EditableTarget({
  icon,
  iconTint,
  label,
  unit,
  value,
  onChange,
  suggested,
}: {
  icon: React.ReactNode;
  iconTint: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  suggested: number;
}) {
  const current = parseInt(value, 10) || 0;
  const isEdited = current !== suggested;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTint}`}>
        {icon}
      </span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{label}</span>
          {isEdited && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              edited
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Suggested: {suggested.toLocaleString()} {unit}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-base font-bold tabular-nums text-slate-800 outline-none transition-colors focus:border-slate-800 focus:bg-white"
        />
        <span className="w-8 text-xs font-medium text-slate-400">{unit}</span>
      </div>
      {isEdited && (
        <button
          onClick={() => onChange(String(suggested))}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
        >
          Reset
        </button>
      )}
    </div>
  );
}
