// src/pages/Dashboard.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CircularProgress from "../components/common/CircularProgress";
import DashboardCard from "../components/common/DashboardCard";
import DashboardGrid from "../components/common/DashboardGrid";
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

const Dashboard: React.FC<DashboardProps> = ({ db, metrics }) => {
  const navigate = useNavigate();
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);

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
      return { bg: 'rgba(255, 255, 255, 0.02)', border: 'transparent' };
    }
    if (!minutes || minutes === 0) {
      return { bg: 'rgba(235, 94, 85, 0.08)', border: 'rgba(235, 94, 85, 0.15)' };
    }
    if (minutes <= 30) return { bg: '#0b3a20', border: 'transparent' };
    if (minutes <= 60) return { bg: '#005a28', border: 'transparent' };
    if (minutes <= 120) return { bg: '#1f8a34', border: 'transparent' };
    return { bg: '#1dd1a1', border: 'rgba(29, 209, 161, 0.3)' };
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
    <div
      className="dashboard-container page-fade-in"
      style={{
        maxWidth: '1440px',
        height: '100vh',
        margin: '0 auto',
        padding: '32px 40px',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >

      {/* HEADER SECTION */}
      <header style={{ flexShrink: 0, marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 300, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
          System <span style={{ fontWeight: 600, color: '#a55eea' }}>Core</span> Workspace
        </h1>
        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)' }}>
          Real-time execution diagnostics engine active.
        </p>
      </header>

      {/* DISTINCT ZONE SPLIT LAYOUT WITH ENHANCED GAP SEPARATION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 260px', // Shrinks matrix width and allocates more priority to the left
          gap: '56px', // Massive gap pushing the matrix further to the right edge
          flex: 1,
          minHeight: 0
        }}
      >

        {/* ZONE A (LEFT): PRIMARY FEATURE MODULE CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minHeight: 0 }}>

          {/* Main Indices: Side-by-Side Progress Rings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexShrink: 0 }}>
            <div style={progressPanelStyle('#4f8cff')}>
              <div>
                <h3 style={panelLabelStyle}>Daily Execution Index</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Routine task targets</p>
              </div>
              <CircularProgress
                value={metrics.currentDailyTasks}
                max={metrics.maxDailyTasks}
                label={`${metrics.currentDailyTasks}/${metrics.maxDailyTasks}`}
                color="#4f8cff"
                size={85}
              />
            </div>

            <div style={progressPanelStyle('#2ee59d')}>
              <div>
                <h3 style={panelLabelStyle}>Weekly Output Target</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Macro milestone achievements</p>
              </div>
              <CircularProgress
                value={metrics.currentWeeklyGoals}
                max={metrics.maxWeeklyGoals}
                label={`${metrics.currentWeeklyGoals}/${metrics.maxWeeklyGoals}`}
                color="#2ee59d"
                size={85}
              />
            </div>
          </div>

          {/* Feature Grid Segment */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="hide-scrollbar">
            <h2 style={sectionTitleStyle}>Operational Components</h2>
            <DashboardGrid>
              <div onClick={() => navigate("/projects")} style={gridInteractiveWrapper}>
                <DashboardCard title="Active Projects" value={metrics.activeProjects} subtitle="Threshold" color="#a55eea" />
              </div>
              <div onClick={() => navigate("/roadmap")} style={gridInteractiveWrapper}>
                <DashboardCard title="ML Roadmap" value={metrics.currentWeekStr} subtitle="Active Curriculum" color="#ff9f43" />
              </div>
              <div onClick={() => navigate("/notes")} style={gridInteractiveWrapper}>
                <DashboardCard title="Learning Notes" value={metrics.savedNotesCount} subtitle="Documented Logs" color="#ff5c75" />
              </div>
              <div onClick={() => navigate("/history/github")} style={gridInteractiveWrapper}>
                <DashboardCard title="GitHub Dev Engine" value={metrics.totalCommits} subtitle="Live Sync Matrix" color="#00d2d3" />
              </div>
              <div onClick={() => navigate("/jobs")} style={gridInteractiveWrapper}>
                <DashboardCard title="Job Tracker" value={metrics.jobApplicationsCount} subtitle="Applications" color="#54a0ff" />
              </div>
              <div onClick={() => navigate("/finnish")} style={gridInteractiveWrapper}>
                <DashboardCard title="Finnish Hub" value={metrics.finnishPracticeStr} subtitle="Speaking Track" color="#ffca28" />
              </div>
            </DashboardGrid>
          </div>

        </div>

        {/* VISUAL BOUNDARY DIVISION */}
        <div style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.00), rgba(255,255,255,0.05), rgba(255,255,255,0.00))', height: '80%', alignSelf: 'center' }} />

        {/* ZONE B (RIGHT): SEPARATED & MINIMAL SIDEBAR LAYER */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
          <h2 style={sectionTitleStyle}>Secondary Telemetry</h2>

          <div
            onClick={() => setIsMatrixExpanded(true)}
            style={sideMatrixContainerStyle}
            title="Click to zoom annual history"
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0, letterSpacing: '0.2px' }}>
                  Habit Radar
                </h3>
                <span style={{ fontSize: '9px', color: '#1dd1a1', background: 'rgba(29, 209, 161, 0.08)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  IDX {metrics.habitConsistencyStr}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                Segment: {currentMonthData.name}
              </p>
            </div>

            {/* Dense isolated heatmap module */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.01)', margin: '16px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3.5px' }}>
                {currentMonthData.days.map((dateStr, dIdx) => {
                  const totalMins = minutesByDate[dateStr] || 0;
                  const style = getGridColor(totalMins, dateStr);
                  return (
                    <div
                      key={dIdx}
                      style={{
                        aspectRatio: '1/1',
                        backgroundColor: style.bg,
                        border: `1px solid ${style.border}`,
                        borderRadius: '2px'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
              Analyze Annual Deck ↗
            </div>
          </div>
        </div>

      </div>

      {/* OVERLAY POPUP COMPONENT DECK */}
      {isMatrixExpanded && (
        <div style={modalOverlayStyle} onClick={() => setIsMatrixExpanded(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Annual Consistency Ledger</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>System history overview ledger</p>
              </div>
              <button onClick={() => setIsMatrixExpanded(false)} style={closeButtonStyle}>✕ Close Deck</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {allMonthsData.map((month) => (
                <div key={month.name} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    {month.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3px' }}>
                    {month.days.map((dateStr, dIdx) => {
                      const totalMins = minutesByDate[dateStr] || 0;
                      const style = getGridColor(totalMins, dateStr);
                      return (
                        <div
                          key={dIdx}
                          title={`${dateStr} : ${totalMins} mins`}
                          style={{
                            aspectRatio: '1/1',
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            borderRadius: '1.5px',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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

// Layout Panel Tokens
const progressPanelStyle = (accentColor: string): React.CSSProperties => ({
  background: 'rgba(20, 26, 43, 0.35)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderLeft: `3px solid ${accentColor}`,
  borderRadius: '16px',
  padding: '16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
});

const sideMatrixContainerStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #13182a, #0c101f)',
  border: '1px solid rgba(255,255,255,0.02)',
  borderRadius: '16px',
  padding: '16px',
  cursor: 'pointer',
  boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
  transition: 'transform 0.2s ease'
};

const panelLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.85)',
  margin: 0,
  letterSpacing: '0.2px'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "10px",
  color: "rgba(255,255,255,0.25)",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  margin: "0 0 12px 0",
  fontWeight: 700,
  flexShrink: 0
};

const gridInteractiveWrapper: React.CSSProperties = {
  cursor: 'pointer',
  transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(5, 8, 18, 0.85)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalContentStyle: React.CSSProperties = {
  background: '#0f1424',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '920px',
  padding: '28px',
  boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
};

const closeButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#ffffff',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '11px',
  fontWeight: 500
};

export default Dashboard;