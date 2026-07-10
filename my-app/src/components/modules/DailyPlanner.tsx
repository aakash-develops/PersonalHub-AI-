// src/components/modules/DailyPlanner.tsx
import React from 'react';
import type { DailyScheduleItem } from '../../types/schema';

interface DailyPlannerProps {
  schedule: DailyScheduleItem[];
  progressClicks: Record<string, boolean>;
  onToggleTask: (time: string) => void;
}

export const DailyPlanner: React.FC<DailyPlannerProps> = ({ schedule, progressClicks, onToggleTask }) => {
  return (
    <div className="module-box">
      <h3>1. Daily Task Blocks</h3>
      <div className="module-content">
        {schedule.map((item) => {
          const isChecked = !!progressClicks[item.time];
          return (
            <div key={item.time} className={`click-item ${isChecked ? 'checked' : ''}`} onClick={() => onToggleTask(item.time)}>
              <span className="checkbox-custom"></span>
              <span><strong>{item.time}</strong> - {item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};