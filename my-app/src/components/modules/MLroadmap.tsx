// src/components/modules/MLRoadmap.tsx
import React from 'react';
import type { MLRoadmapItem } from '../../types/schema';

interface MLRoadmapProps {
  roadmap: MLRoadmapItem[];
  currentWeek: number;
}

export const MLRoadmap: React.FC<MLRoadmapProps> = ({ roadmap, currentWeek }) => {
  return (
    <div className="module-box">
      <h3>3. ML Curriculum Track</h3>
      <div className="module-content">
        {roadmap.map((item) => {
          const isCurrentWeek = currentWeek === item.week || (item.week === 1 && currentWeek === 2);
          return (
            <div key={item.id} style={{
              padding: '8px',
              borderRadius: '6px',
              marginBottom: '6px',
              backgroundColor: isCurrentWeek ? '#e0f2fe' : 'transparent',
              border: isCurrentWeek ? '1px solid var(--accent-blue)' : '1px solid transparent'
            }}>
              <div style={{ fontWeight: isCurrentWeek ? 'bold' : 'normal', fontSize: '0.85rem' }}>
                {item.title} {isCurrentWeek && '🎯'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};