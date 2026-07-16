
// // src/App.tsx
// import { useState, useEffect } from 'react';
// import { Routes, Route, useLocation } from 'react-router-dom'; // Added useLocation
// import './App.css';



// // 1. Data Schemas & Types
// import initialSchema from './data/initialSchema.json';
// import type { AppDatabaseState } from './types/schema';

// // 2. Global Layout Components
// import TopNavbar from './components/layout/TopNavbar';
// import Footer from './components/footer/footer'; // Added newly configured global footer
// import AdminPanel from './components/admin/AdminPanel'; // Import our new full-screen taker

// // 3. Operational Target Pages
// import MainEntrance from './pages/WelcomePage';
// import Dashboard from './pages/Dashboard';
// import DailyPage from './pages/DailyPage';
// import ProjectsPage from './pages/ProjectsPage';
// import RoadmapPage from './pages/RoadmapPage';
// import NotesPage from './pages/NotesPage';
// import JobsPage from './pages/JobsPage';
// import FinnishPage from './pages/FinnishPage';

// import HistoryPage from './pages/HistoryPage';
// import GitHubPage from './pages/Github';

// export default function App() {
//   const location = useLocation(); // Hook into current path location tracking

//   // State to control full-screen admin console visibility
//   const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

//   // 1. INITIAL BASE SKELETON CONFIGURATION FOR DATA SAFETY
//   const [db, setDb] = useState<AppDatabaseState>(() => {
//     return {
//       ...initialSchema,
//       daily_progress_clicks: {},
//       modules_data: {
//         projects: [
//           { id: 'p-1', name: 'Freight/Transport ML Project', status: 'In progress', github_repo_id: 'g-1' }
//         ],
//         learning_notes: [],
//         github_tracker: [
//           { id: 'g-1', repo_name: 'freight-transport-ml', commits_this_week: 0 }
//         ],
//         job_tracker: [],
//         finnish_tracker: [],
//         habit_tracker: {
//           "ML LeetCode Core": [false, false, false, false, false, false, false],
//           "Anki Fin Vocab": [false, false, false, false, false, false, false],
//           "Paper Reading / Arxiv": [false, false, false, false, false, false, false]
//         }
//       }
//     } as unknown as AppDatabaseState;
//   });

//   // 2. AUTOMATIC READ OPERATION FROM DISK D: ON LAUNCH
//   useEffect(() => {
//     fetch('http://localhost:5000/api/db')
//       .then((res) => res.json())
//       .then((data) => {
//         if (data && data.modules_data) {
//           setDb(data);
//         }
//       })
//       .catch((err) => console.error("Could not fetch database file from local server:", err));
//   }, []);

//   // 3. AUTOMATIC WRITE OPERATION TO DISK D: ON DETECTED STATE CHANGES
//   useEffect(() => {
//     if (!db || (db.modules_data.learning_notes.length === 0 && db.modules_data.job_tracker.length === 0 && db.modules_data.finnish_tracker.length === 0)) {
//       return;
//     }

//     fetch('http://localhost:5000/api/db', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(db),
//     }).catch((err) => console.error("Failed to automatically synchronize update to D Drive:", err));
//   }, [db]);

//   // --- MUTATOR HANDLERS ---
//   const toggleDailyTask = (time: string) => {
//     setDb((prev) => ({
//       ...prev,
//       daily_progress_clicks: {
//         ...prev.daily_progress_clicks,
//         [time]: !prev.daily_progress_clicks[time],
//       },
//     }));
//   };

//   const handleAddNote = (noteText: string) => {
//     if (!noteText.trim()) return;
//     setDb((prev) => ({
//       ...prev,
//       modules_data: {
//         ...prev.modules_data,
//         learning_notes: [
//           {
//             id: `n-${Date.now()}`,
//             roadmap_id: `w-${prev.system_config.current_active_week}`,
//             note: noteText,
//             date: new Date().toLocaleDateString('en-GB'),
//           },
//           ...prev.modules_data.learning_notes,
//         ],
//       },
//     }));
//   };

//   const handleAddJob = (company: string, role: string) => {
//     if (!company.trim() || !role.trim()) return;
//     setDb((prev) => ({
//       ...prev,
//       modules_data: {
//         ...prev.modules_data,
//         job_tracker: [
//           {
//             id: `j-${Date.now()}`,
//             company,
//             role,
//             status: 'Applied',
//             date_applied: new Date().toLocaleDateString('en-GB'),
//           },
//           ...prev.modules_data.job_tracker,
//         ],
//       },
//     }));
//   };

//   const handleAddFinnishLog = (activity: string, minutes: number) => {
//     if (!activity.trim() || minutes <= 0) return;
//     setDb((prev) => ({
//       ...prev,
//       modules_data: {
//         ...prev.modules_data,
//         finnish_tracker: [
//           {
//             id: `f-${Date.now()}`,
//             activity,
//             minutes_spent: minutes,
//             date: new Date().toLocaleDateString('en-GB')
//           },
//           ...prev.modules_data.finnish_tracker,
//         ],
//       },
//     }));
//   };

//   const handleToggleHabitDay = (habitName: string, dayIndex: number) => {
//     setDb((prev) => {
//       const currentTracker = { ...prev.modules_data.habit_tracker };
//       if (currentTracker[habitName]) {
//         const updatedDays = [...currentTracker[habitName]];
//         updatedDays[dayIndex] = !updatedDays[dayIndex];
//         currentTracker[habitName] = updatedDays;
//       }
//       return {
//         ...prev,
//         modules_data: {
//           ...prev.modules_data,
//           habit_tracker: currentTracker,
//         },
//       };
//     });
//   };

//   const handleLogCommit = (repoId: string) => {
//     setDb((prev) => ({
//       ...prev,
//       modules_data: {
//         ...prev.modules_data,
//         github_tracker: (prev.modules_data.github_tracker || []).map((repo) =>
//           repo.id === repoId
//             ? { ...repo, commits_this_week: repo.commits_this_week + 1 }
//             : repo
//         ),
//       },
//     }));
//   };

//   // --- ENGINE PIPELINE FOR LIVE METRICS ---
//   const currentDailyTasks = Object.values(db.daily_progress_clicks || {}).filter(Boolean).length;
//   const maxDailyTasks = db.daily_schedule_template?.length || 10;

//   const totalCommits = db.modules_data.github_tracker?.reduce((acc: number, curr) => acc + curr.commits_this_week, 0) || 0;
//   const currentJobsCount = db.modules_data.job_tracker?.length || 0;
//   const finnishMinutes = db.modules_data.finnish_tracker?.reduce((acc: number, curr) => acc + curr.minutes_spent, 0) || 0;

//   const jobTargetMet = currentJobsCount >= (db.weekly_output_targets?.career_min_jobs || 0);
//   const githubTargetMet = totalCommits >= (db.weekly_output_targets?.github_min_commits || 0);
//   const finnishTargetMet = finnishMinutes >= 45;

//   let completedWeeklyGoals = 0;
//   if (jobTargetMet) completedWeeklyGoals++;
//   if (githubTargetMet) completedWeeklyGoals++;
//   if (finnishTargetMet) completedWeeklyGoals++;

//   const habitGridValues = Object.values(db.modules_data.habit_tracker || {}) as boolean[][];
//   const totalHabitSlots = habitGridValues.reduce((acc: number, arr) => acc + arr.length, 0);
//   const checkedHabitSlots = habitGridValues.reduce((acc: number, arr) => acc + arr.filter(Boolean).length, 0);
//   const habitConsistency = totalHabitSlots > 0 ? Math.round((checkedHabitSlots / totalHabitSlots) * 100) : 0;

//   const dashboardMetrics = {
//     currentDailyTasks,
//     maxDailyTasks,
//     currentWeeklyGoals: completedWeeklyGoals,
//     maxWeeklyGoals: 3,
//     activeProjects: db.modules_data.projects?.filter(p => p.status === 'In progress').length || 0,
//     currentWeekStr: `W${db.system_config?.current_active_week || 1}`,
//     savedNotesCount: db.modules_data.learning_notes?.length || 0,
//     totalCommits,
//     jobApplicationsCount: currentJobsCount,
//     finnishPracticeStr: `${finnishMinutes}m`,
//     habitConsistencyStr: `${habitConsistency}%`
//   };

//   // Check if we are currently standing on the root welcome portal path
//   const isSplashPage = location.pathname === '/';

//   // ==========================================
//   // 🚪 FULL SCREEN TAKEOVER PRE-RENDERING
//   // ==========================================
//   if (isAdminOpen) {
//     return (
//       <AdminPanel
//         db={db}
//         setDb={setDb}
//         onClose={() => setIsAdminOpen(false)}
//       />
//     );
//   }

//   // Normal app flow with Navbar and Footer
//   return (
//     <div className="app flex flex-col min-h-screen justify-between">
//       <div className="flex-grow">
//         {/* 🛠️ CONDITIONAL NAVBAR RENDERING: Hidden completely on welcome portal splash path */}
//         {!isSplashPage && <TopNavbar currentWeek={db.system_config?.current_active_week} />}

//         <Routes>
//           {/* Splash View Entrance */}
//           <Route path="/" element={<MainEntrance />} />

//           {/* System Dashboard Panel Core */}
//           <Route path="/dashboard" element={<Dashboard db={db} metrics={dashboardMetrics} />} />

//           <Route
//             path="/daily"
//             element={
//               <DailyPage
//                 db={db}
//                 setDb={setDb}
//                 onToggleTask={toggleDailyTask}
//               />
//             }
//           />

//           <Route
//             path="/projects"
//             element={<ProjectsPage db={db} setDb={setDb} />}
//           />

//           <Route
//             path="/roadmap"
//             element={
//               <RoadmapPage
//                 db={db}
//                 setDb={setDb}
//               />
//             }
//           />

//           <Route
//             path="/notes"
//             element={<NotesPage notes={db.modules_data.learning_notes} onAddNote={handleAddNote} />}
//           />

//           <Route
//             path="/jobs"
//             element={<JobsPage jobs={db.modules_data.job_tracker} onAddJob={handleAddJob} />}
//           />

//           <Route
//             path="/finnish"
//             element={<FinnishPage logs={db.modules_data.finnish_tracker} onAddPractice={handleAddFinnishLog} />}
//           />

//           <Route path="/github" element={<GitHubPage />} />

//           <Route
//             path="/history/:tab"
//             element={<HistoryPage db={db} onLogCommit={handleLogCommit} />}
//           />
//         </Routes>
//       </div>

//       {/* Renders global stealth footer across your application pages */}
//       {/* We pass onOpenAdmin so the footer button can open the panel safely */}
//       <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
//     </div>
//   );
// }
// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'; // Added Navigate
import './App.css';

// 1. Data Schemas & Types
import initialSchema from './data/initialSchema.json';
import type { AppDatabaseState } from './types/schema';

// 2. Global Layout Components
import TopNavbar from './components/layout/TopNavbar';
import Footer from './components/footer/footer';
import AdminPanel from './components/admin/AdminPanel';

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
import PortfolioPage  from './pages/Portfolio';

// ==========================================
// 🛡️ SECURITY SHIELD: PROTECTED ROUTE GUARD
// ==========================================
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Checks local storage for the cryptographic session token issued by server.js[cite: 13]
  const isAuthenticated = !!localStorage.getItem('sys_session_token');

  if (isAuthenticated) {
    return <>{children}</>;
  } else {
    // If visitor tries to access admin spaces, redirect back to public calling card
    return <Navigate to="/" replace />;
  }
};

export default function App() {
  const location = useLocation();

  // State to control full-screen admin console visibility
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Track database fetch state to prevent accidental over-writing/wipe on boot[cite: 13]
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

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
        if (data && data.modules_data) {
          setDb(data);
        }
        setIsLoaded(true); // Database has successfully settled into memory
      })
      .catch((err) => {
        console.error("Could not fetch database file from local server:", err);
        setIsLoaded(true); // Set to true anyway so local edits work even if offline
      });
  }, []);

  // 3. AUTOMATIC WRITE OPERATION TO DISK D: ON DETECTED STATE CHANGES
  useEffect(() => {
    // Block saving process until read operation completes to prevent empty sweeps[cite: 13]
    if (!isLoaded) return;

    fetch('http://localhost:5000/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    }).catch((err) => console.error("Failed to automatically synchronize update to D Drive:", err));
  }, [db, isLoaded]);

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

  // Check if we are currently standing on the root welcome portal path
  const isSplashPage = location.pathname === '/';

  // ==========================================
  // 🚪 FULL SCREEN TAKEOVER PRE-RENDERING
  // ==========================================
  if (isAdminOpen) {
    return (
      <AdminPanel
        db={db}
        setDb={setDb}
        onClose={() => setIsAdminOpen(false)}
      />
    );
  }

  // Normal app flow with Navbar and Footer
  return (
    <div className="app flex flex-col min-h-screen justify-between">
      <div className="flex-grow">
        {/* 🛠️ CONDITIONAL NAVBAR RENDERING: Hidden completely on welcome portal splash path */}
        {!isSplashPage && <TopNavbar currentWeek={db.system_config?.current_active_week} />}

        <Routes>
          {/* Public Views */}
          <Route path="/" element={<PortfolioPage/>} />
          <Route path="/github" element={<GitHubPage />} />
           <Route
            path="/MainEntrance"
            element={

                <MainEntrance
                />

            }
          />

          {/* Authenticated Developer Consoles Protected via Guard Wrappers */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard db={db} metrics={dashboardMetrics} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/daily"
            element={
              <ProtectedRoute>
                <DailyPage
                  db={db}
                  setDb={setDb}
                  onToggleTask={toggleDailyTask}
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage db={db} setDb={setDb} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage
                  db={db}
                  setDb={setDb}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesPage notes={db.modules_data.learning_notes} onAddNote={handleAddNote} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage jobs={db.modules_data.job_tracker} onAddJob={handleAddJob} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/finnish"
            element={
              <ProtectedRoute>
                <FinnishPage logs={db.modules_data.finnish_tracker} onAddPractice={handleAddFinnishLog} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history/:tab"
            element={
              <ProtectedRoute>
                <HistoryPage db={db} onLogCommit={handleLogCommit} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {/* Renders global stealth footer across your application pages */}
      {/* We pass onOpenAdmin so the footer button can open the panel safely */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
    </div>
  );
}