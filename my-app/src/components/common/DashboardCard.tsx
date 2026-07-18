// src/components/common/DashboardCard.tsx
import React from "react";
import { useTheme } from "../layout/ThemeProvider";

type DashboardCardProps = {
  title: string;
  value?: string | number;
  subtitle?: string;
  onClick?: () => void;
  color?: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  onClick,
  color = "#4f8cff",
}) => {
  const { theme } = useTheme();
  const isCosmic = theme === "cosmic";

  return (
    <div
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl border-2 border-dynamic bg-slate-950/70 dark:bg-zinc-900/80 p-6 cursor-pointer select-none transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.5)] min-h-[140px] flex flex-col justify-between"
    >
      {/* Dynamic Color Splash Background Flare */}
      <div
        className="absolute -right-8 -top-8 h-20 w-20 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: color }}
      />

      {/* Heavy Geometric Accent Sidebar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 group-hover:w-[6px]"
        style={{ backgroundColor: color }}
      />

      <div className="flex flex-col gap-3 w-full">
        {/* Top Metric Header Row */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-black font-mono tracking-wider text-slate-100 dark:text-zinc-100 uppercase transition-colors group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {title}
          </span>
          <div
            className="text-3xl font-black font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            style={{ color: color }}
          >
            {value}
          </div>
        </div>

        {/* Thick Contrast Rule Splitter */}
        <div className="w-full h-[2px] bg-white/20 dark:bg-zinc-700/60 my-1" />

        {/* High-Visibility Detailed Metadata Label */}
        <div className="flex items-center justify-between w-full">
          <span className="text-xs font-bold font-sans text-slate-200 dark:text-zinc-200 tracking-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] max-w-[80%] leading-snug">
            {subtitle}
          </span>
          <span
            className="text-[10px] font-black uppercase tracking-widest font-mono opacity-0 -translate-x-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
            style={{ color: color }}
          >
            OPEN ↗
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;