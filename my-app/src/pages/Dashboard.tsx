// src/pages/Dashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "../components/common/CircularProgress";
import DashboardCard from "../components/common/DashboardCard";
import DashboardGrid from "../components/common/DashboardGrid";
import { useTheme } from "../components/layout/ThemeProvider";
import type { AppDatabaseState } from "../types/schema";
import "../App.css";

interface StudyLog {
  id: string;
  activity: string;
  minutes_spent: number;
  date: string;
}

interface DashboardProps {
  db: AppDatabaseState;
  metrics: {
    currentDailyTasks: number;
    maxDailyTasks: number;
    currentWeeklyGoals: number;
    maxWeeklyGoals: number;
    activeProjects: number;
    currentWeekStr: string;
    savedNotesCount: number;
    totalCommits: number;
    jobApplicationsCount: number;
    finnishPracticeStr: string;
    habitConsistencyStr: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);

  const isCosmic = theme === "cosmic";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/study-logs');
        if (response.ok) {
          const data = await response.json();
          setStudyLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch contribution data.", err);
      }
    };
    fetchLogs();
  }, []);

  const minutesByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    studyLogs.forEach(log => {
      const cleanDate = log.date.split(',')[0].trim();
      counts[cleanDate] = (counts[cleanDate] || 0) + log.minutes_spent;
    });
    return counts;
  }, [studyLogs]);

  const getGridColor = (minutes: number, cellDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [day, month, year] = cellDate.split('/').map(Number);
    const cellDateTime = new Date(year, month - 1, day);

    if (cellDateTime > today) {
      return isCosmic
        ? { bg: 'rgba(255, 255, 255, 0.04)', border: 'transparent' }
        : { bg: 'rgba(0, 0, 0, 0.04)', border: 'transparent' };
    }
    if (!minutes || minutes === 0) {
      return isCosmic
        ? { bg: 'rgba(235, 94, 85, 0.12)', border: 'rgba(235, 94, 85, 0.25)' }
        : { bg: 'rgba(235, 94, 85, 0.08)', border: 'rgba(235, 94, 85, 0.2)' };
    }
    if (minutes <= 30) return { bg: isCosmic ? '#0e4a29' : '#c6f6d5', border: 'transparent' };
    if (minutes <= 60) return { bg: isCosmic ? '#047857' : '#9decb9', border: 'transparent' };
    if (minutes <= 120) return { bg: isCosmic ? '#059669' : '#4ade80', border: 'transparent' };
    return { bg: '#10b981', border: 'rgba(16, 185, 129, 0.4)' };
  };

  const allMonthsData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = [];
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
      const daysArray = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${currentYear}`;
        daysArray.push(dateStr);
      }
      months.push({
        name: new Date(currentYear, m).toLocaleString('en-US', { month: 'long' }),
        days: daysArray
      });
    }
    return months;
  }, []);

  const currentMonthData = useMemo(() => {
    const now = new Date();
    return allMonthsData[now.getMonth()];
  }, [allMonthsData]);

  return (
    <div className="w-full h-screen max-w-[1480px] mx-auto p-6 md:p-10 flex flex-col box-border overflow-hidden bg-transparent text-dynamic-primary font-sans select-none">

      {/* GLOWING HEADER BLOCK */}
      <header className="flex-shrink-0 mb-10 border-b border-dynamic/60 pb-5 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight m-0 text-dynamic-primary uppercase font-mono">
            Quantum Command Hub
          </h1>
          <p className="m-0 mt-1.5 text-xs text-dynamic-primary font-semibold font-mono tracking-wider opacity-90 dark:text-zinc-300">
            Execution analytics interface live.
          </p>
        </div>
        <div className="text-xs font-mono font-bold uppercase hidden sm:block tracking-widest text-dynamic-primary opacity-80">
          Node Status: Operational
        </div>
      </header>

      {/* ASYMMETRIC VISUALIZATION INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0">

        {/* LEFT COLUMN: PRIMARY DIALS & COMPONENTS (8/12 Width) */}
        <div className="lg:col-span-8 flex flex-col gap-8 min-h-0">

          {/* HIGH-POWER ANALYTIC INTERFACES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-shrink-0">

            {/* Index Dials */}
            <div className="relative group overflow-hidden rounded-2xl border-2 border-dynamic bg-[var(--bg-glass)] bg-opacity-70 dark:bg-zinc-900/40 p-8 flex items-center justify-between shadow-xl min-h-[160px]">
              <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-pink-500" />
              <div className="flex flex-col gap-1.5 max-w-[60%]">
                <span className="text-xs font-extrabold font-mono text-pink-500 uppercase tracking-widest">DAILY INDEX</span>
                <h3 className="text-xl font-black tracking-tight text-dynamic-primary mt-1">Routine Target Flow</h3>
                <p className="text-xs font-semibold text-dynamic-primary opacity-80 dark:text-zinc-300 m-0 font-mono">Dynamic queue checklists</p>
              </div>
              <CircularProgress
                value={metrics.currentDailyTasks}
                max={metrics.maxDailyTasks}
                label={`${metrics.currentDailyTasks}/${metrics.maxDailyTasks}`}
                color="#ec4899"
                size={105}
              />
            </div>

            <div className="relative group overflow-hidden rounded-2xl border-2 border-dynamic bg-[var(--bg-glass)] bg-opacity-70 dark:bg-zinc-900/40 p-8 flex items-center justify-between shadow-xl min-h-[160px]">
              <div className="absolute top-0 left-0 bottom-0 w-[5px] bg-cyan-400" />
              <div className="flex flex-col gap-1.5 max-w-[60%]">
                <span className="text-xs font-extrabold font-mono text-cyan-400 uppercase tracking-widest">WEEKLY OUTPUT</span>
                <h3 className="text-xl font-black tracking-tight text-dynamic-primary mt-1">Milestone Capacity</h3>
                <p className="text-xs font-semibold text-dynamic-primary opacity-80 dark:text-zinc-300 m-0 font-mono">Macro operational targets</p>
              </div>
              <CircularProgress
                value={metrics.currentWeeklyGoals}
                max={metrics.maxWeeklyGoals}
                label={`${metrics.currentWeeklyGoals}/${metrics.maxWeeklyGoals}`}
                color="#22d3ee"
                size={105}
              />
            </div>

          </div>

          {/* DYNAMIC COMPONENT CHIPS */}
          <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs text-dynamic-primary dark:text-zinc-300 tracking-[2px] font-black font-mono uppercase">
                System Core Branches
              </span>
              <div className="flex-1 h-[1px] bg-dynamic/50" />
            </div>

            <DashboardGrid>
              <DashboardCard onClick={() => navigate("/projects")} title="Active Projects" value={metrics.activeProjects} subtitle="Threshold tracking node" color="#a55eea" />
              <DashboardCard onClick={() => navigate("/roadmap")} title="ML Roadmap" value={metrics.currentWeekStr} subtitle="Curriculum phase vector" color="#ff9f43" />
              <DashboardCard onClick={() => navigate("/notes")} title="Learning Notes" value={metrics.savedNotesCount} subtitle="Documented ledger index" color="#ff5c75" />
              <DashboardCard onClick={() => navigate("/history/github")} title="GitHub Dev Engine" value={metrics.totalCommits} subtitle="Live repository sync telemetry" color="#00d2d3" />
              <DashboardCard onClick={() => navigate("/jobs")} title="Job Tracker" value={metrics.jobApplicationsCount} subtitle="Funnel applications status" color="#54a0ff" />
              <DashboardCard onClick={() => navigate("/finnish")} title="Finnish Hub" value={metrics.finnishPracticeStr} subtitle="Language tracking matrix" color="#eab308" />
            </DashboardGrid>
          </div>

        </div>

        {/* RIGHT COLUMN: RADAR THERMAL FEED (4/12 Width) */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-dynamic-primary dark:text-zinc-300 tracking-[2px] font-black font-mono uppercase">
              Thermal Radar Map
            </span>
            <div className="flex-1 h-[1px] bg-dynamic/50" />
          </div>

          <div
            onClick={() => setIsMatrixExpanded(true)}
            className="group relative bg-[var(--bg-glass)] bg-opacity-70 dark:bg-zinc-900/40 border-2 border-dynamic rounded-2xl p-6 cursor-pointer shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-dynamic-primary/50 min-h-[280px]"
            title="Expand Ledger Display Matrix"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-black tracking-tight m-0 text-dynamic-primary">Consistency Ledger</h3>
                  <p className="m-0 mt-1 text-xs font-semibold text-dynamic-primary opacity-70 dark:text-zinc-400 font-mono">{currentMonthData.name}</p>
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded font-black ${isCosmic ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30' : 'text-emerald-800 bg-emerald-100 border border-emerald-200'}`}>
                  IDX {metrics.habitConsistencyStr}
                </span>
              </div>
            </div>

            {/* Micro-Thermal Plot Array */}
            <div className="bg-[var(--pill-bg)] bg-opacity-90 p-4 rounded-xl border-2 border-dynamic/80 my-5">
              <div className="grid grid-cols-6 gap-2">
                {currentMonthData.days.map((dateStr, dIdx) => {
                  const totalMins = minutesByDate[dateStr] || 0;
                  const style = getGridColor(totalMins, dateStr);
                  return (
                    <div
                      key={dIdx}
                      style={{ aspectRatio: '1/1', backgroundColor: style.bg, borderColor: style.border }}
                      className="rounded-[4px] border-2 transition-transform duration-200 group-hover:scale-[1.08]"
                    />
                  );
                })}
              </div>
            </div>

            <div className="text-center text-xs font-bold font-mono text-dynamic-primary dark:text-zinc-300 pt-3 border-t-2 border-dynamic/50 group-hover:text-dynamic-primary transition-colors tracking-wider">
              INSPECT FULL SYSTEM RECORD ↗
            </div>
          </div>
        </div>

      </div>

      {/* OVERLAY POPUP LEDGER VIEW */}
      {isMatrixExpanded && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setIsMatrixExpanded(false)}
        >
          <div
            className="bg-[var(--bg-glass)] border-2 border-dynamic rounded-2xl w-full max-w-[1000px] p-8 shadow-2xl backdrop-blur-3xl text-dynamic-primary relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b-2 border-dynamic pb-4">
              <div>
                <h2 className="m-0 text-xl font-black uppercase font-mono tracking-tight">LOG CONSISTENCY DECK</h2>
                <p className="m-0 mt-1 text-xs font-semibold text-dynamic-primary opacity-70 dark:text-zinc-300 font-mono">Comprehensive historical execution log grid</p>
              </div>
              <button
                onClick={() => setIsMatrixExpanded(false)}
                className="bg-[var(--pill-bg)] border-2 border-dynamic text-dynamic-primary font-bold text-xs font-mono px-5 py-2.5 rounded-xl cursor-pointer hover:bg-dynamic/20 transition-all shadow-md"
              >
                ✕ CLOSE ENGINE
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-h-[65vh] overflow-y-auto pr-2 hide-scrollbar">
              {allMonthsData.map((month) => (
                <div key={month.name} className="bg-[var(--pill-bg)] bg-opacity-95 border-2 border-dynamic rounded-xl p-4 flex flex-col justify-between">
                  <div className="text-xs font-black text-dynamic-primary opacity-80 dark:text-zinc-300 uppercase mb-3 tracking-widest font-mono">
                    {month.name}
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {month.days.map((dateStr, dIdx) => {
                      const totalMins = minutesByDate[dateStr] || 0;
                      const style = getGridColor(totalMins, dateStr);
                      return (
                        <div
                          key={dIdx}
                          title={`${dateStr} : ${totalMins} mins`}
                          style={{ aspectRatio: '1/1', backgroundColor: style.bg, borderColor: style.border }}
                          className="rounded-[3px] border-2 cursor-pointer transition-transform duration-100 hover:scale-125 hover:z-10"
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;