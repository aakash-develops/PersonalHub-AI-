// src/components/modules/Projects.tsx
import React from 'react';

interface Project {
  id: string;
  name: string;
  status: 'Not started' | 'In progress' | 'Completed';
}

interface ProjectsProps {
  projects: Project[];
}

export const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <div className="module-box">
      <h3>2. Active Execution Projects</h3>
      <div className="module-content">
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 10px 0', fontStyle: 'italic' }}>
          Rule: One project active at any given timeline threshold
        </p>
        {projects.map((p) => (
          <div key={p.id} style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold' }}>{p.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '4px' }}>⚡ Status: {p.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};