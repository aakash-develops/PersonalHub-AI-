// src/components/modules/HabitTracker.tsx
import React from 'react';

interface HabitTrackerProps {
  habits: Record<string, boolean[]>;
  onToggleDay: (habitName: string, dayIndex: number) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onToggleDay }) => {
  return (
    <div className="module-box">
      <h3>8. Routine Habit Grid</h3>
      <div className="module-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.keys(habits).map((habitName) => {
          const daysArray = habits[habitName];
          return (
            <div key={habitName} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>{habitName}</div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {daysArray.map((dayChecked, dIdx) => (
                  <button
                    key={dIdx}
                    onClick={() => onToggleDay(habitName, dIdx)}
                    style={{
                      flex: 1,
                      padding: '2px 0',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      borderRadius: '3px',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      backgroundColor: dayChecked ? 'var(--accent-blue)' : 'white',
                      color: dayChecked ? 'white' : 'var(--text-main)'
                    }}
                  >
                    D{dIdx + 1}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};