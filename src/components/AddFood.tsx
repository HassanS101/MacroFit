import { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import type { MealType } from "@/types";
import { MEAL_LABELS } from "@/types";

interface AddFoodProps {
  meal: MealType;
  onAdd: (name: string, calories: number, protein: number) => void;
  onClose: () => void;
}

export function AddFood({ meal, onAdd, onClose }: AddFoodProps) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(calories, 10);
    const p = parseInt(protein, 10);
    if (!name.trim() || isNaN(c) || c < 0) return;
    onAdd(name.trim(), c, isNaN(p) ? 0 : Math.max(p, 0));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Add Food</h2>
            <p className="text-xs text-slate-400">to {MEAL_LABELS[meal]}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Food name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grilled chicken bowl"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition-colors focus:border-slate-800 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Calories
              </label>
              <input
                type="number"
                min={0}
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition-colors focus:border-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Protein (g)
              </label>
              <input
                type="number"
                min={0}
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-800 outline-none transition-colors focus:border-slate-800 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !calories}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={18} /> Add to {MEAL_LABELS[meal]}
          </button>
        </form>
      </div>
    </div>
  );
}
