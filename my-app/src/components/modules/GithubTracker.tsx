// src/components/modules/GitHubTracker.tsx
import React from 'react';

interface Repo {
  id: string;
  repo_name: string;
  commits_this_week: number;
}

interface GitHubTrackerProps {
  repos: Repo[];
  onLogCommit: (id: string) => void;
}

export const GitHubTracker: React.FC<GitHubTrackerProps> = ({ repos, onLogCommit }) => {
  return (
    <div className="module-box">
      <h3>5. GitHub Code Repositories</h3>
      <div className="module-content">
        {repos.map((g) => (
          <div key={g.id} style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold' }}>📦 {g.repo_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>Commits this week: {g.commits_this_week}</div>
            <button
              onClick={() => onLogCommit(g.id)}
              style={{ width: '100%', background: 'var(--text-main)', color: 'white', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              🚀 Log Code Commit Work
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};