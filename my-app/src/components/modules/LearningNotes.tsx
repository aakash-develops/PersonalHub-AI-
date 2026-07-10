// src/components/modules/LearningNotes.tsx
import React from 'react';

interface Note {
  id: string;
  note: string;
  date: string;
}

interface LearningNotesProps {
  notes: Note[];
  onAddNote: (note: string) => void;
}

export const LearningNotes: React.FC<LearningNotesProps> = ({ notes, onAddNote }) => {
  return (
    <div className="module-box">
      <h3>4. Learning Field Documentation</h3>
      <div className="module-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          type="text"
          placeholder="Type core concept study notes..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAddNote(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
          style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', boxSizing: 'border-box' }}
        />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notes.map((n) => (
            <div key={n.id} style={{ fontSize: '0.8rem', padding: '6px', borderBottom: '1px solid var(--border-color)' }}>
              <strong>{n.date}:</strong> {n.note}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};