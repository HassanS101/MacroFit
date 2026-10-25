import { Droplet, RotateCcw } from "lucide-react";

interface WaterTrackerProps {
  glasses: number;
  targetMl: number;
  onSet: (glasses: number) => void;
  onReset: () => void;
}

const GLASS_ML = 250;

export function WaterTracker({ glasses, targetMl, onSet, onReset }: WaterTrackerProps) {
  const consumedMl = glasses * GLASS_ML;
  const targetGlasses = Math.max(Math.round(targetMl / GLASS_ML), 1);
  const remaining = Math.max(targetMl - consumedMl, 0);
  const complete = consumedMl >= targetMl;

  const handleClick = (index: number) => {
    // Clicking an empty glass fills up to and including it
    // Clicking the last filled glass empties back by one
    if (index + 1 <= glasses) {
      onSet(index);
    } else {
      onSet(index + 1);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-200">
            <Droplet size={20} />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-800">Water Intake</h3>
            <p className="text-xs text-slate-400">
              {(consumedMl / 1000).toFixed(2)}L of {(targetMl / 1000).toFixed(1)}L
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Reset water"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Glass row — click to fill */}
        <div className="mb-4 flex flex-wrap gap-2.5">
          {Array.from({ length: targetGlasses }).map((_, i) => {
            const filled = i < glasses;
            return (
              <button
                key={i}
                onClick={() => handleClick(i)}
                className="group relative h-14 w-10 transition-transform hover:scale-110 active:scale-95"
                aria-label={`${filled ? "Filled" : "Empty"} glass ${i + 1} — 0.25L`}
                title="0.25L"
              >
                <svg viewBox="0 0 36 48" className="h-full w-full">
                  <defs>
                    <linearGradient id={`glassGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M6 4 L30 4 L26 44 Q26 46 24 46 L12 46 Q10 46 10 44 Z"
                    fill={filled ? `url(#glassGrad-${i})` : "none"}
                    fillOpacity={filled ? "0.9" : "0"}
                    stroke={filled ? "#0ea5e9" : "#cbd5e1"}
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />
                  {filled && (
                    <path
                      d="M8 8 L28 8 L26 43 Q26 45 24 45 L12 45 Q10 45 10 43 Z"
                      fill="none"
                      stroke="#bae6fd"
                      strokeWidth="0.8"
                      opacity="0.6"
                    />
                  )}
                </svg>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tabular-nums text-slate-700">
            {glasses} {glasses === 1 ? "glass" : "glasses"}
            <span className="ml-1.5 text-xs font-medium text-slate-400">({(consumedMl / 1000).toFixed(2)}L)</span>
          </span>
          {complete ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
              Goal reached!
            </span>
          ) : (
            <span className="text-xs font-medium text-slate-400">
              {(remaining / 1000).toFixed(2)}L left
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
