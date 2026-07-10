// src/components/modules/FinnishTracker.tsx
import React from 'react';

interface PracticeLog {
  id: string;
  activity: string;
  minutes_spent: number;
}

interface FinnishTrackerProps {
  logs: PracticeLog[];
  onAddPractice: (activity: string, minutes: number) => void;
}

export const FinnishTracker: React.FC<FinnishTrackerProps> = ({ logs, onAddPractice }) => {
  return (
    <div className="module-box">
      <h3>7. Finnish Acquisition Hub</h3>
      <div className="module-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input id="fin-act" type="text" placeholder="Speaking/Vocab activity" style={{ width: '60%', padding: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
          <input id="fin-min" type="number" placeholder="Mins" style={{ width: '25%', padding: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
          <button onClick={() => {
            const aInput = document.getElementById('fin-act') as HTMLInputElement;
            const mInput = document.getElementById('fin-min') as HTMLInputElement;
            if (aInput && mInput) {
              onAddPractice(aInput.value, parseInt(mInput.value) || 0);
              aInput.value = ''; mInput.value = '';
            }
          }} style={{ padding: '4px 8px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {logs.map((f) => (
            <div key={f.id} style={{ fontSize: '0.75rem', padding: '4px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <span>💬 {f.activity}</span>
              <strong>{f.minutes_spent} min</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};