import { useEffect, useRef, useState } from "react";

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  trackColor: string;
  size?: number;
  stroke?: number;
}

export function ProgressRing({
  value,
  max,
  label,
  unit,
  color,
  trackColor,
  size = 180,
  stroke = 14,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const targetPct = max > 0 ? value / max : 0;

  const [displayPct, setDisplayPct] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = displayPct;
    const delta = targetPct - start;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayPct(start + delta * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPct]);

  const offset = circumference * (1 - displayPct);
  const remaining = Math.max(max - value, 0);
  const over = value > max;
  const hasProgress = displayPct > 0.001;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap={hasProgress ? "round" : "butt"}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-slate-900">
            {Math.round(value).toLocaleString()}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            / {max.toLocaleString()} {unit}
          </span>
          <span
            className={`mt-1.5 text-xs font-semibold ${over ? "text-amber-600" : "text-emerald-600"}`}
          >
            {over
              ? `+${Math.round(value - max).toLocaleString()} over`
              : `${Math.round(remaining).toLocaleString()} left`}
          </span>
        </div>
      </div>
      <span className="mt-3 text-sm font-semibold text-slate-600">{label}</span>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  trackColor: string;
  segments?: { label: string; value: number; color: string }[];
}

export function ProgressBar({
  value,
  max,
  label,
  unit,
  color,
  trackColor,
  segments,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = value > max;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm tabular-nums text-slate-500">
          <span className="font-semibold text-slate-800">{Math.round(value).toLocaleString()}</span>
          {" / "}
          {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: trackColor }}>
        {segments && segments.length > 0 ? (
          <div className="flex h-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }}>
            {segments.map((seg, i) => {
              const segWidth = value > 0 ? (seg.value / value) * 100 : 0;
              return (
                <div
                  key={seg.label}
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${segWidth}%`,
                    background: seg.color,
                    borderRadius: i === 0 ? "9999px 0 0 9999px" : i === segments.length - 1 ? "0 9999px 9999px 0" : 0,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, background: color }}
          />
        )}
      </div>
      {over && (
        <p className="mt-1 text-xs font-medium text-amber-600">
          {Math.round(value - max).toLocaleString()} {unit} over target
        </p>
      )}
      {segments && segments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {segments.map((seg) => (
            <span key={seg.label} className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: seg.color }} />
              {seg.label}
              <span className="font-semibold tabular-nums text-slate-700">{Math.round(seg.value)}{unit}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
