// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// 1. Data Schemas & Types
import initialSchema from './data/initialSchema.json';
import type { AppDatabaseState } from './types/schema';

// 2. Global Layout Components
import TopNavbar from './components/layout/TopNavbar';

// 3. Operational Target Pages
import Dashboard from './pages/Dashboard';
import DailyPage from './pages/DailyPage';
import ProjectsPage from './pages/ProjectsPage';
import RoadmapPage from './pages/RoadmapPage';
import NotesPage from './pages/NotesPage';
import JobsPage from './pages/JobsPage';
import FinnishPage from './pages/FinnishPage';

import HistoryPage from './pages/HistoryPage';
import GitHubPage from './pages/Github';

export default function App() {
  // 1. INITIAL BASE SKELETON CONFIGURATION FOR DATA SAFETY
  const [db, setDb] = useState<AppDatabaseState>(() => {
    return {
      ...initialSchema,
      daily_progress_clicks: {},
      modules_data: {
        projects: [
          { id: 'p-1', name: 'Freight/Transport ML Project', status: 'In progress', github_repo_id: 'g-1' }
        ],
        learning_notes: [],
        github_tracker: [
          { id: 'g-1', repo_name: 'freight-transport-ml', commits_this_week: 0 }
        ],
        job_tracker: [],
        finnish_tracker: [],
        habit_tracker: {
          "ML LeetCode Core": [false, false, false, false, false, false, false],
          "Anki Fin Vocab": [false, false, false, false, false, false, false],
          "Paper Reading / Arxiv": [false, false, false, false, false, false, false]
        }
      }
    } as unknown as AppDatabaseState;
  });

  // 2. AUTOMATIC READ OPERATION FROM DISK D: ON LAUNCH
  useEffect(() => {
    fetch('http://localhost:5000/api/db')
      .then((res) => res.json())
      .then((data) => {
        // If the backend has a valid file, populate the app's state with it
        if (data && data.modules_data) {
          setDb(data);
        }
      })
      .catch((err) => console.error("Could not fetch database file from local server:", err));
  }, []);

  // 3. AUTOMATIC WRITE OPERATION TO DISK D: ON DETECTED STATE CHANGES
  useEffect(() => {
    // Basic verification guard to prevent blank writes over file content arrays on baseline startup instantiation
    if (!db || (db.modules_data.learning_notes.length === 0 && db.modules_data.job_tracker.length === 0 && db.modules_data.finnish_tracker.length === 0)) {
      return;
    }

    fetch('http://localhost:5000/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    }).catch((err) => console.error("Failed to automatically synchronize update to D Drive:", err));
  }, [db]);

  // --- MUTATOR HANDLERS ---
  const toggleDailyTask = (time: string) => {
    setDb((prev) => ({
      ...prev,
      daily_progress_clicks: {
        ...prev.daily_progress_clicks,
        [time]: !prev.daily_progress_clicks[time],
      },
    }));
  };

  const handleAddNote = (noteText: string) => {
    if (!noteText.trim()) return;
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        learning_notes: [
          {
            id: `n-${Date.now()}`,
            roadmap_id: `w-${prev.system_config.current_active_week}`,
            note: noteText,
            date: new Date().toLocaleDateString('en-GB'),
          },
          ...prev.modules_data.learning_notes,
        ],
      },
    }));
  };

  const handleAddJob = (company: string, role: string) => {
    if (!company.trim() || !role.trim()) return;
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        job_tracker: [
          {
            id: `j-${Date.now()}`,
            company,
            role,
            status: 'Applied',
            date_applied: new Date().toLocaleDateString('en-GB'),
          },
          ...prev.modules_data.job_tracker,
        ],
      },
    }));
  };

  const handleAddFinnishLog = (activity: string, minutes: number) => {
    if (!activity.trim() || minutes <= 0) return;
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        finnish_tracker: [
          {
            id: `f-${Date.now()}`,
            activity,
            minutes_spent: minutes,
            date: new Date().toLocaleDateString('en-GB')
          },
          ...prev.modules_data.finnish_tracker,
        ],
      },
    }));
  };

  const handleToggleHabitDay = (habitName: string, dayIndex: number) => {
    setDb((prev) => {
      const currentTracker = { ...prev.modules_data.habit_tracker };
      if (currentTracker[habitName]) {
        const updatedDays = [...currentTracker[habitName]];
        updatedDays[dayIndex] = !updatedDays[dayIndex];
        currentTracker[habitName] = updatedDays;
      }
      return {
        ...prev,
        modules_data: {
          ...prev.modules_data,
          habit_tracker: currentTracker,
        },
      };
    });
  };

  const handleLogCommit = (repoId: string) => {
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        github_tracker: (prev.modules_data.github_tracker || []).map((repo) =>
          repo.id === repoId
            ? { ...repo, commits_this_week: repo.commits_this_week + 1 }
            : repo
        ),
      },
    }));
  };

  // --- ENGINE PIPELINE FOR LIVE METRICS ---
  const currentDailyTasks = Object.values(db.daily_progress_clicks || {}).filter(Boolean).length;
  const maxDailyTasks = db.daily_schedule_template?.length || 10;

  const totalCommits = db.modules_data.github_tracker?.reduce((acc: number, curr) => acc + curr.commits_this_week, 0) || 0;
  const currentJobsCount = db.modules_data.job_tracker?.length || 0;
  const finnishMinutes = db.modules_data.finnish_tracker?.reduce((acc: number, curr) => acc + curr.minutes_spent, 0) || 0;

  const jobTargetMet = currentJobsCount >= (db.weekly_output_targets?.career_min_jobs || 0);
  const githubTargetMet = totalCommits >= (db.weekly_output_targets?.github_min_commits || 0);
  const finnishTargetMet = finnishMinutes >= 45;

  let completedWeeklyGoals = 0;
  if (jobTargetMet) completedWeeklyGoals++;
  if (githubTargetMet) completedWeeklyGoals++;
  if (finnishTargetMet) completedWeeklyGoals++;

  const habitGridValues = Object.values(db.modules_data.habit_tracker || {}) as boolean[][];
  const totalHabitSlots = habitGridValues.reduce((acc: number, arr) => acc + arr.length, 0);
  const checkedHabitSlots = habitGridValues.reduce((acc: number, arr) => acc + arr.filter(Boolean).length, 0);
  const habitConsistency = totalHabitSlots > 0 ? Math.round((checkedHabitSlots / totalHabitSlots) * 100) : 0;

  const dashboardMetrics = {
    currentDailyTasks,
    maxDailyTasks,
    currentWeeklyGoals: completedWeeklyGoals,
    maxWeeklyGoals: 3,
    activeProjects: db.modules_data.projects?.filter(p => p.status === 'In progress').length || 0,
    currentWeekStr: `W${db.system_config?.current_active_week || 1}`,
    savedNotesCount: db.modules_data.learning_notes?.length || 0,
    totalCommits,
    jobApplicationsCount: currentJobsCount,
    finnishPracticeStr: `${finnishMinutes}m`,
    habitConsistencyStr: `${habitConsistency}%`
  };

  return (
    <div className="app">
      <TopNavbar currentWeek={db.system_config?.current_active_week} />

      <Routes>
        <Route path="/" element={<Dashboard db={db} metrics={dashboardMetrics} />} />

        <Route
          path="/daily"
          element={
            <DailyPage
              db={db}
              setDb={setDb}
              onToggleTask={toggleDailyTask}
            />
          }
        />

        <Route
          path="/projects"
          element={<ProjectsPage db={db} setDb={setDb} />}
        />

        <Route
          path="/roadmap"
          element={
            <RoadmapPage
              db={db}
              setDb={setDb}
            />
          }
        />

        <Route
          path="/notes"
          element={<NotesPage notes={db.modules_data.learning_notes} onAddNote={handleAddNote} />}
        />

        <Route
          path="/jobs"
          element={<JobsPage jobs={db.modules_data.job_tracker} onAddJob={handleAddJob} />}
        />

        <Route
          path="/finnish"
          element={<FinnishPage logs={db.modules_data.finnish_tracker} onAddPractice={handleAddFinnishLog} />}
        />

        <Route path="/github" element={<GitHubPage />} />

        <Route
          path="/history/:tab"
          element={<HistoryPage db={db} onLogCommit={handleLogCommit} />}
        />
      </Routes>
    </div>
  );
}