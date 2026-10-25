import { TrendingUp, Droplet, Flame, Dumbbell } from "lucide-react";
import type { FoodItem, GoalConfig } from "@/types";

interface WeeklyStatsProps {
  foodByDate: Record<string, FoodItem[]>;
  waterByDate: Record<string, number>;
  goalConfig: GoalConfig;
}

const GLASS_ML = 250;

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayTotals(items: FoodItem[] | undefined) {
  if (!items) return { calories: 0, protein: 0 };
  return items
    .filter((f) => f.checked)
    .reduce(
      (acc, f) => ({ calories: acc.calories + f.calories, protein: acc.protein + f.protein }),
      { calories: 0, protein: 0 },
    );
}

export function WeeklyStats({ foodByDate, waterByDate, goalConfig }: WeeklyStatsProps) {
  const today = new Date();

  // Start of the current week (Monday)
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7; // 0 on Monday, 6 on Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dateStr(d);
    const totals = dayTotals(foodByDate[key]);
    const glasses = waterByDate[key] ?? 0;
    return {
      key,
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      weekdayFull: d.toLocaleDateString("en-US", { weekday: "short" }),
      isToday: key === dateStr(today),
      calories: totals.calories,
      protein: totals.protein,
      waterMl: glasses * GLASS_ML,
      caloriePct: goalConfig.targetCalories > 0 ? (totals.calories / goalConfig.targetCalories) * 100 : 0,
      proteinPct: goalConfig.targetProtein > 0 ? (totals.protein / goalConfig.targetProtein) * 100 : 0,
      waterPct: goalConfig.targetWater > 0 ? ((glasses * GLASS_ML) / goalConfig.targetWater) * 100 : 0,
    };
  });

  const avgCaloriePct = days.reduce((s, d) => s + Math.min(d.caloriePct, 100), 0) / 7;
  const avgProteinPct = days.reduce((s, d) => s + Math.min(d.proteinPct, 100), 0) / 7;
  const avgWaterPct = days.reduce((s, d) => s + Math.min(d.waterPct, 100), 0) / 7;
  const overallPct = (avgCaloriePct + avgProteinPct + avgWaterPct) / 3;

  const weekStart = days[0].key;
  const weekEnd = days[6].key;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-200">
          <TrendingUp size={20} />
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-800">Weekly Performance</h3>
          <p className="text-xs text-slate-400">Last 7 days · goal completion</p>
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Overall score */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg className="-rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="27" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="27"
                fill="none"
                stroke="url(#weekGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={2 * Math.PI * 27 * (1 - Math.min(overallPct, 100) / 100)}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="weekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-slate-800">
              {Math.round(overallPct)}%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Overall goal completion</p>
            <p className="text-xs text-slate-500">
              {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" – "}
              {new Date(weekEnd + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
            {overallPct >= 80 ? (
              <p className="mt-0.5 text-xs font-semibold text-emerald-600">Excellent week!</p>
            ) : overallPct >= 50 ? (
              <p className="mt-0.5 text-xs font-semibold text-amber-600">Good progress — keep going</p>
            ) : (
              <p className="mt-0.5 text-xs font-semibold text-slate-400">Let's push this week</p>
            )}
          </div>
        </div>

        {/* Per-metric averages */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <MiniMetric
            icon={<Flame size={14} />}
            label="Calories"
            pct={avgCaloriePct}
            color="from-orange-400 to-red-500"
          />
          <MiniMetric
            icon={<Dumbbell size={14} />}
            label="Protein"
            pct={avgProteinPct}
            color="from-emerald-400 to-teal-500"
          />
          <MiniMetric
            icon={<Droplet size={14} />}
            label="Water"
            pct={avgWaterPct}
            color="from-sky-400 to-cyan-500"
          />
        </div>

        {/* 7-day bar chart */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Daily breakdown
            </span>
            <div className="flex gap-3 text-[10px] font-medium text-slate-400">
              <Legend color="bg-orange-400" label="kcal" />
              <Legend color="bg-emerald-400" label="prot" />
              <Legend color="bg-sky-400" label="water" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-1.5 rounded-2xl bg-slate-50/70 px-3 py-3" style={{ height: 120 }}>
            {days.map((d) => {
              const calH = Math.min(d.caloriePct, 100);
              const protH = Math.min(d.proteinPct, 100);
              const waterH = Math.min(d.waterPct, 100);
              return (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-[80px] w-full items-end justify-center gap-0.5">
                    <Bar height={calH} color="bg-gradient-to-t from-orange-500 to-orange-400" />
                    <Bar height={protH} color="bg-gradient-to-t from-teal-500 to-emerald-400" />
                    <Bar height={waterH} color="bg-gradient-to-t from-cyan-500 to-sky-400" />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      d.isToday ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {d.weekday}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  icon,
  label,
  pct,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-2.5 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-slate-400">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold tabular-nums text-slate-800">{Math.round(pct)}%</p>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-500`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Bar({ height, color }: { height: number; color: string }) {
  return (
    <div
      className={`w-1.5 rounded-full ${color} transition-all duration-500`}
      style={{ height: `${Math.max(height * 0.8, 2)}%` }}
    />
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
