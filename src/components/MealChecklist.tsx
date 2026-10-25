import { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  Sunrise,
  Sun,
  Moon,
  Apple,
  ChevronDown,
  ChevronUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { FoodItem, MealType } from "@/types";
import { MEAL_LABELS, MEAL_ORDER } from "@/types";

const HIGH_PROTEIN_SNACKS: { name: string; calories: number; protein: number }[] = [
  { name: "Greek yogurt (200g)", calories: 130, protein: 20 },
  { name: "Cottage cheese (200g)", calories: 180, protein: 24 },
  { name: "Protein shake (1 scoop)", calories: 120, protein: 25 },
  { name: "Hard-boiled eggs (2)", calories: 155, protein: 13 },
  { name: "Tuna can (100g)", calories: 116, protein: 26 },
];

const MEAL_ICONS: Record<MealType, LucideIcon> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snacks: Apple,
};

const MEAL_ACCENTS: Record<MealType, { bg: string; ring: string; text: string; chip: string }> = {
  breakfast: {
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    text: "text-amber-700",
    chip: "bg-amber-100 text-amber-700",
  },
  lunch: {
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    text: "text-sky-700",
    chip: "bg-sky-100 text-sky-700",
  },
  dinner: {
    bg: "bg-indigo-50",
    ring: "ring-indigo-200",
    text: "text-indigo-700",
    chip: "bg-indigo-100 text-indigo-700",
  },
  snacks: {
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
    chip: "bg-emerald-100 text-emerald-700",
  },
};

interface MealChecklistProps {
  items: FoodItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (meal: MealType) => void;
  onQuickAdd: (meal: MealType, name: string, calories: number, protein: number) => void;
}

export function MealChecklist({ items, onToggle, onDelete, onAdd, onQuickAdd }: MealChecklistProps) {
  const [collapsed, setCollapsed] = useState<Record<MealType, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false,
  });
  const [snackMenuOpen, setSnackMenuOpen] = useState(false);

  const toggleCollapse = (meal: MealType) =>
    setCollapsed((c) => ({ ...c, [meal]: !c[meal] }));

  return (
    <div className="space-y-4">
      {MEAL_ORDER.map((meal) => {
        const mealItems = items.filter((i) => i.meal === meal);
        const checked = mealItems.filter((i) => i.checked).length;
        const Icon = MEAL_ICONS[meal];
        const accent = MEAL_ACCENTS[meal];
        const allDone = mealItems.length > 0 && checked === mealItems.length;

        return (
          <section
            key={meal}
            className={`rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md`}
          >
            <button
              onClick={() => toggleCollapse(meal)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text} ring-1 ${accent.ring}`}
              >
                <Icon size={22} />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-800">{MEAL_LABELS[meal]}</h3>
                  {allDone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <Check size={12} /> Complete
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {mealItems.length === 0
                    ? "No items yet"
                    : `${checked} of ${mealItems.length} logged`}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${accent.chip}`}>
                {mealItems
                  .filter((i) => i.checked)
                  .reduce((s, i) => s + i.calories, 0)}
                {" kcal"}
              </span>
              {collapsed[meal] ? (
                <ChevronDown size={18} className="text-slate-400" />
              ) : (
                <ChevronUp size={18} className="text-slate-400" />
              )}
            </button>

            {!collapsed[meal] && (
              <div className="border-t border-slate-100 px-3 pb-3 pt-2">
                {mealItems.length === 0 ? (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-400">Nothing logged for this meal</span>
                    <button
                      onClick={() => onAdd(meal)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {mealItems.map((item) => (
                      <li
                        key={item.id}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
                      >
                        <button
                          onClick={() => onToggle(item.id)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            item.checked
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 bg-white hover:border-emerald-400"
                          }`}
                          aria-label={item.checked ? "Mark as not eaten" : "Mark as eaten"}
                        >
                          {item.checked && <Check size={14} strokeWidth={3} />}
                        </button>
                        <div className="flex-1">
                          <span
                            className={`text-sm font-medium ${
                              item.checked ? "text-slate-400 line-through" : "text-slate-700"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="ml-2 text-xs tabular-nums text-slate-400">
                            {item.calories} kcal · {item.protein}g protein
                          </span>
                        </div>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                          aria-label="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => onAdd(meal)}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  <Plus size={16} /> Add food
                </button>

                {meal === "snacks" && (
                  <div className="relative mt-2">
                    <button
                      onClick={() => setSnackMenuOpen((o) => !o)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <Zap size={16} /> Quick add high-protein snack
                      <ChevronDown size={14} className={`transition-transform ${snackMenuOpen ? "rotate-180" : ""}`} />
                    </button>
                    {snackMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setSnackMenuOpen(false)} />
                        <ul className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          {HIGH_PROTEIN_SNACKS.map((snack) => (
                            <li key={snack.name}>
                              <button
                                onClick={() => {
                                  onQuickAdd("snacks", snack.name, snack.calories, snack.protein);
                                  setSnackMenuOpen(false);
                                }}
                                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                              >
                                <span className="text-sm font-medium text-slate-700">{snack.name}</span>
                                <span className="shrink-0 text-xs font-semibold tabular-nums text-emerald-600">
                                  {snack.calories} kcal · {snack.protein}g
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
