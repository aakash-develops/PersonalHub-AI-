// src/components/common/CircularProgress.tsx
import React from "react";
import { useTheme } from "../layout/ThemeProvider";

type CircularProgressProps = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  color?: string;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 105,
  strokeWidth = 10,
  label,
  subLabel,
  color = "#4f8cff",
}) => {
  const { theme } = useTheme();
  const isCosmic = theme === "cosmic";

  const percentage = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);
  const displayPercentage = Math.round(percentage * 100);

  const maxLabelWidth = Number(size) - 16;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 filter drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]">
        {/* Solid High Contrast Rail Background Track */}
        <circle
          stroke={isCosmic ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.15)"}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Vibrant Core Analytical Gauge */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out filter drop-shadow-[0_0_8px_var(--accent-color)]"
        />
      </svg>

      {/* Solid Text Layer - Zero Muddy Opacities */}
      <div className="absolute flex flex-col items-center justify-center text-center px-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        <div className="text-xl font-black font-mono text-white dark:text-white tracking-tighter">
          {displayPercentage}%
        </div>
        {label && (
          <div
            className="text-[11px] font-black text-slate-200 dark:text-zinc-100 mt-0.5 font-mono tracking-tight"
            style={{ maxWidth: `${maxLabelWidth}px`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;