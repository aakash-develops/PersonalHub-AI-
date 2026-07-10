// src/components/modules/JobTracker.tsx
import React from 'react';

interface Job {
  id: string;
  company: string;
  role: string;
  status: string;
}

interface JobTrackerProps {
  jobs: Job[];
  onAddJob: (company: string, role: string) => void;
}

export const JobTracker: React.FC<JobTrackerProps> = ({ jobs, onAddJob }) => {
  return (
    <div className="module-box">
      <h3>6. Professional Application Log</h3>
      <div className="module-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <input id="job-comp" type="text" placeholder="Company" style={{ width: '50%', padding: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
          <input id="job-role" type="text" placeholder="Role" style={{ width: '50%', padding: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
          <button onClick={() => {
            const cInput = document.getElementById('job-comp') as HTMLInputElement;
            const rInput = document.getElementById('job-role') as HTMLInputElement;
            if (cInput && rInput) {
              onAddJob(cInput.value, rInput.value);
              cInput.value = ''; rInput.value = '';
            }
          }} style={{ padding: '4px 8px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {jobs.map((j) => (
            <div key={j.id} style={{ fontSize: '0.75rem', padding: '4px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{j.company}</strong> - {j.role}</span>
              <span style={{ color: 'var(--accent-green)' }}>{j.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};