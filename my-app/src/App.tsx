import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// 1. Data Schemas & Types
import initialSchema from './data/initialSchema.json';
import type { AppDatabaseState } from './types/schema';
import { FULL_CURRICULUM_DATA } from './types/curriculumData';

// 2. Global Layout Components & Providers
import TopNavbar from './components/layout/TopNavbar';
import Footer from './components/footer/footer';
import AdminPanel from './components/admin/AdminPanel';
import { CosmicBackground } from './components/cosmic/CosmicBackground';
import { ThemeProvider, useTheme } from './components/layout/ThemeProvider';
import { CvWorkshop } from './components/CV workshop/CvWorkshop';

// 3. Operational Target Pages
import MainEntrance from './pages/WelcomePage';
import Dashboard from './pages/Dashboard';
import DailyPage from './pages/DailyPage';
import ProjectsPage from './pages/ProjectsPage';
import RoadmapPage from './pages/RoadmapPage';
import NotesPage from './pages/NotesPage';
import JobsPage from './pages/JobsPage';
import FinnishPage from './pages/FinnishPage';
import HistoryPage from './pages/HistoryPage';
import GitHubPage from './pages/Github';
import PortfolioPage from './pages/Portfolio';

function AppContent() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // AUTH STATE TRACKING
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('sys_session_token');
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('sys_session_token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // INITIAL BASE SKELETON CONFIGURATION
  const [db, setDb] = useState<AppDatabaseState>(() => {
    return {
      ...initialSchema,
      daily_progress_clicks: {},
      modules_data: {
        projects: [{ id: 'p-1', name: 'Freight/Transport ML Project', status: 'In progress', github_repo_id: 'g-1' }],
        learning_notes: [],
        github_tracker: [{ id: 'g-1', repo_name: 'freight-transport-ml', commits_this_week: 0 }],
        job_tracker: [],
        finnish_tracker: [],
        habit_tracker: {
          "ML LeetCode Core": [false, false, false, false, false, false, false],
          "Anki Fin Vocab": [false, false, false, false, false, false, false],
          "Paper Reading / Arxiv": [false, false, false, false, false, false, false]
        },
        ml_roadmap_matrix: FULL_CURRICULUM_DATA || [],
        cv_workshop: {
  master_profile: {
    contact: {
      phone: "+358 000 00000",
      email: "aakashbasnet.info@gmail.com",
      address: "Kauniainen, Finland"
    },
    aboutMe: "Full-Stack & Machine Learning Software Engineer",
    experiences: [],
    education: [],
    skills: {
      technical: ["React", "TypeScript", "Node.js", "Python", "PyTorch"],
      personal: ["Problem Solving", "Team Leadership"]
    },
    certifications: [],
    languages: [],
    hobbies: [],
    achievements: []
  },
  saved_tailored_cvs: []
}
      }
    } as unknown as AppDatabaseState;
  });

  // DB Sync Engines (GET Request)
  useEffect(() => {
    fetch('http://localhost:5000/api/db', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.modules_data) {
          const matrixArray = data.modules_data.ml_roadmap_matrix;
          const isValidAndPopulated = Array.isArray(matrixArray) && matrixArray.length > 0;

          const mergedData = {
            ...data,
            modules_data: {
              ...data.modules_data,
              ml_roadmap_matrix: isValidAndPopulated ? matrixArray : (FULL_CURRICULUM_DATA || [])
            }
          };

          setDb(mergedData);
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Could not fetch database file:", err);
        setIsLoaded(true);
      });
  }, []);

  // Continuous auto-save to Backend (POST Request)
  useEffect(() => {
    if (!isLoaded) return;

    fetch('http://localhost:5000/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    }).catch((err) => console.error("Failed to sync updates:", err));
  }, [db, isLoaded]);

  // MUTATOR IMPLEMENTATIONS
  const toggleDailyTask = (time: string) => {
    setDb((prev) => ({
      ...prev,
      daily_progress_clicks: { ...prev.daily_progress_clicks, [time]: !prev.daily_progress_clicks[time] },
    }));
  };

  const handleAddNote = (noteText: string) => {
    if (!noteText.trim()) return;
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        learning_notes: [{ id: `n-${Date.now()}`, roadmap_id: `w-${prev.system_config.current_active_week}`, note: noteText, date: new Date().toLocaleDateString('en-GB') }, ...prev.modules_data.learning_notes],
      },
    }));
  };

  const handleAddJob = (company: string, role: string) => {
    if (!company.trim() || !role.trim()) return;
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        job_tracker: [{ id: `j-${Date.now()}`, company, role, status: 'Applied', date_applied: new Date().toLocaleDateString('en-GB') }, ...prev.modules_data.job_tracker],
      },
    }));
  };

  const handleAddFinnishLog = (activity: string, minutes: number) => {
    if (!activity.trim() || minutes <= 0) return;
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        finnish_tracker: [{ id: `f-${Date.now()}`, activity, minutes_spent: minutes, date: new Date().toLocaleDateString('en-GB') }, ...prev.modules_data.finnish_tracker],
      },
    }));
  };

  const handleLogCommit = (repoId: string) => {
    setDb((prev) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        github_tracker: (prev.modules_data.github_tracker || []).map((repo) =>
          repo.id === repoId ? { ...repo, commits_this_week: repo.commits_this_week + 1 } : repo
        ),
      },
    }));
  };
  const handleUpdateMasterProfile = (updatedProfile: any) => {
  console.log("Updating Master Profile", updatedProfile);

  setDb((prev) => ({
    ...prev,
    modules_data: {
      ...prev.modules_data,
      cv_workshop: {
        ...prev.modules_data.cv_workshop,
        master_profile: updatedProfile,
      },
    },
  }));
};

  // Metrics Crunchers
  const currentDailyTasks = Object.values(db.daily_progress_clicks || {}).filter(Boolean).length;
  const maxDailyTasks = db.daily_schedule_template?.length || 10;
  const totalCommits = db.modules_data.github_tracker?.reduce((acc: number, curr) => acc + curr.commits_this_week, 0) || 0;
  const currentJobsCount = db.modules_data.job_tracker?.length || 0;
  const finnishMinutes = db.modules_data.finnish_tracker?.reduce((acc: number, curr) => acc + curr.minutes_spent, 0) || 0;

  const dashboardMetrics = {
    currentDailyTasks, maxDailyTasks, currentWeeklyGoals: (currentJobsCount >= (db.weekly_output_targets?.career_min_jobs || 0) ? 1 : 0) + (totalCommits >= (db.weekly_output_targets?.github_min_commits || 0) ? 1 : 0) + (finnishMinutes >= 45 ? 1 : 0),
    maxWeeklyGoals: 3, activeProjects: db.modules_data.projects?.filter(p => p.status === 'In progress').length || 0,
    currentWeekStr: `W${db.system_config?.current_active_week || 1}`, savedNotesCount: db.modules_data.learning_notes?.length || 0,
    totalCommits, jobApplicationsCount: currentJobsCount, finnishPracticeStr: `${finnishMinutes}m`,
    habitConsistencyStr: `${db.modules_data.habit_tracker ? Math.round((Object.values(db.modules_data.habit_tracker).reduce((acc: number, arr) => acc + arr.filter(Boolean).length, 0) / Object.values(db.modules_data.habit_tracker).reduce((acc: number, arr) => acc + arr.length, 0)) * 100) : 0}%`
  };

  const isSplashPage = location.pathname === '/' || location.pathname === '/MainEntrance';

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return localStorage.getItem('sys_session_token') ? <>{children}</> : <Navigate to="/" replace />;
  };

  const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    return localStorage.getItem('sys_session_token') ? <Navigate to="/dashboard" replace /> : <>{children}</>;
  };

  if (isAdminOpen) {
    return <AdminPanel db={db} setDb={setDb} onClose={() => setIsAdminOpen(false)} />;
  }
console.log(
  "APP PROFILE",
  db.modules_data?.cv_workshop?.master_profile
);
  return (
    <div className="app flex flex-col min-h-screen justify-between relative bg-transparent">
      <CosmicBackground theme={theme} />

      <div className="flex-grow relative z-10">
        {!isSplashPage && <TopNavbar currentWeek={db.system_config?.current_active_week} />}

        <Routes>
          <Route path="/" element={<PortfolioPage db={db} onToggleTheme={toggleTheme} currentTheme={theme} />} />
          <Route path="/github" element={<GitHubPage />} />
          <Route path="/MainEntrance" element={<PublicOnlyRoute><MainEntrance /></PublicOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard db={db} metrics={dashboardMetrics} /></ProtectedRoute>} />
          <Route
            path="/cv-workshop"
            element={
              <ProtectedRoute>
                <CvWorkshop
                  key={db?.modules_data?.cv_workshop?.master_profile?.email || 'cv-workshop-key'}
                  db={db}
                  setDb={setDb}
                  masterProfile={db?.modules_data?.cv_workshop?.master_profile}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/daily" element={<ProtectedRoute><DailyPage db={db} setDb={setDb} onToggleTask={toggleDailyTask} /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage db={db} setDb={setDb} /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage db={db} setDb={setDb} /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesPage notes={db.modules_data.learning_notes} onAddNote={handleAddNote} /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><JobsPage jobs={db.modules_data.job_tracker} onAddJob={handleAddJob} /></ProtectedRoute>} />
          <Route path="/finnish" element={<ProtectedRoute><FinnishPage logs={db.modules_data.finnish_tracker} onAddPractice={handleAddFinnishLog} /></ProtectedRoute>} />
          <Route path="/history/:tab" element={<ProtectedRoute><HistoryPage db={db} onLogCommit={handleLogCommit} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center font-mono text-xs font-bold tracking-wider px-4 py-2.5 rounded-full border border-dynamic bg-[var(--nav-bg)] shadow-lg backdrop-blur-md hover:scale-105 transition-all cursor-pointer select-none"
        style={{ color: 'var(--accent-color)' }}
        title="Switch Interface Matrix"
      >
        {theme === 'cosmic' ? '💎 LIGHT' : '🪐 COSMIC'}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}