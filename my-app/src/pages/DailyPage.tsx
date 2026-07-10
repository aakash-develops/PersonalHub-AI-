// src/pages/DailyPage.tsx
import React, { useState, useEffect } from "react";
import "../App.css";

interface TaskItem {
  task: string;
  scope: string;
  durationMins: number;
}

interface DisplayItem extends TaskItem {
  timeLabel: string;
}

interface DailyPageProps {
  db: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
  onToggleTask?: (time: string) => void;
}

const FIXED_TIMELINE_SLOTS = [
  "07:00 - 08:00",
  "08:00 - 08:45",
  "08:45 - 10:15",
  "10:30 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:30",
  "15:30 - 16:30",
  "18:30 - 20:00",
  "21:00 - 22:00",
  "22:00 - 23:30"
];

const DEFAULT_TASKS: TaskItem[] = [
  { task: "Wake + routine", scope: "Immediate morning alignment, glass of water, light stretching.", durationMins: 60 },
  { task: "Finnish listening & speaking", scope: "Dedicated language immersion window. Pronunciation drills.", durationMins: 45 },
  { task: "ML theory study", scope: "Mathematical validation, papers, and architectural core concepts.", durationMins: 90 },
  { task: "ML coding practice", scope: "Pipeline engineering, model testing, and algorithmic building.", durationMins: 90 },
  { task: "Career (CV, LinkedIn, jobs)", scope: "Market tracking, resume optimization, outreach, and applications.", durationMins: 60 },
  { task: "ML project building", scope: "Feature extraction, training cycles, and full-stack architecture implementation.", durationMins: 90 },
  { task: "Exercise", scope: "Physical reset, cardio/lifting, and cognitive recovery window.", durationMins: 60 },
  { task: "ML practice/project", scope: "Code refining, documentation tuning, and secondary project loops.", durationMins: 90 },
  { task: "Review & revision", scope: "Anki retention cards, look back over code logic, review notes.", durationMins: 60 },
  { task: "Planning + rest", scope: "Tomorrow's agenda strategy, clear dev rigs, screen blackout.", durationMins: 90 }
];

const DailyPage: React.FC<DailyPageProps> = ({ db, setDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [scopeInput, setScopeInput] = useState("");
  const [durationInput, setDurationInput] = useState("60");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const getLocalDateString = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayKey = getLocalDateString(currentTime);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dailyRecords = db?.daily_records || {};
  const todayRecord = dailyRecords[todayKey] || {
    tasks: DEFAULT_TASKS,
    progress: {},
    holiday_mode: false
  };

  const currentRawTasks: TaskItem[] = todayRecord.tasks || DEFAULT_TASKS;
  const progressClicks = todayRecord.progress || {};
  const isHolidayMode = !!todayRecord.holiday_mode;

  const schedule: DisplayItem[] = currentRawTasks.map((item, idx) => {
    if (idx < FIXED_TIMELINE_SLOTS.length) {
      return { ...item, timeLabel: FIXED_TIMELINE_SLOTS[idx] };
    }

    let previousEndTime = "23:30";
    if (idx > 0) {
      const prevSlot = FIXED_TIMELINE_SLOTS[idx - 1];
      if (prevSlot && prevSlot.includes("-")) {
        previousEndTime = prevSlot.split("-")[1].trim();
      }
    }

    const [hrs, mins] = previousEndTime.split(":").map(Number);
    const startTotalMins = hrs * 60 + mins;
    const endTotalMins = (startTotalMins + item.durationMins) % 1440;

    const formatTimeStr = (totalMins: number) => {
      const h = Math.floor(totalMins / 60).toString().padStart(2, "0");
      const m = (totalMins % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };

    return { ...item, timeLabel: `${previousEndTime} - ${formatTimeStr(endTotalMins)}` };
  });

  const totalTasks = schedule.length;
  const completedTasks = Object.values(progressClicks).filter(Boolean).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getTimeOfDayIcon = (timeRangeStr: string): string => {
    const startHour = parseInt(timeRangeStr.split(":")[0], 10);
    if (isNaN(startHour)) return "⚙️";
    if (startHour >= 5 && startHour < 12) return "🌅";
    if (startHour >= 12 && startHour < 17) return "☀️";
    if (startHour >= 17 && startHour < 21) return "🌇";
    return "🌌";
  };

  const currentHour = currentTime.getHours();
  const showNightDeck = currentHour >= 23 || currentHour < 4;

  const updateTodayRecord = (updatedFields: Partial<typeof todayRecord>) => {
    setDb((prev: any) => ({
      ...prev,
      daily_records: {
        ...(prev?.daily_records || {}),
        [todayKey]: {
          ...todayRecord,
          ...updatedFields
        }
      }
    }));
  };

  const handleToggleTaskInternal = (timeLabel: string) => {
    const updatedProgress = { ...progressClicks };
    updatedProgress[timeLabel] = !updatedProgress[timeLabel];
    updateTodayRecord({ progress: updatedProgress });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const newRawTask: TaskItem = {
      task: taskInput.trim(),
      scope: scopeInput.trim() || "Dynamic custom block frame.",
      durationMins: parseInt(durationInput, 10) || 60
    };

    updateTodayRecord({ tasks: [...currentRawTasks, newRawTask] });

    setTaskInput("");
    setScopeInput("");
    setDurationInput("60");
    setIsModalOpen(false);
  };

  const handleDeleteTask = (indexToDelete: number) => {
    updateTodayRecord({ tasks: currentRawTasks.filter((_, idx) => idx !== indexToDelete) });
  };

  const handleResetDay = () => {
    updateTodayRecord({ progress: {}, holiday_mode: false });
  };

  const getTomorrowKey = () => {
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalDateString(tomorrow);
  };

  const handleSetSameRoutineTomorrow = () => {
    const tomorrowKey = getTomorrowKey();
    setDb((prev: any) => ({
      ...prev,
      daily_records: {
        ...(prev?.daily_records || {}),
        [tomorrowKey]: { tasks: DEFAULT_TASKS, progress: {}, holiday_mode: false }
      }
    }));
    alert("Tomorrow's sequence has been compiled based on your template!");
  };

  const handleClearDayHolidayTomorrow = () => {
    const tomorrowKey = getTomorrowKey();
    setDb((prev: any) => ({
      ...prev,
      daily_records: {
        ...(prev?.daily_records || {}),
        [tomorrowKey]: { tasks: [], progress: {}, holiday_mode: true }
      }
    }));
    alert("Tomorrow set to Holiday Mode. Rest sequence logged!");
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => e.preventDefault();

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const rearranged = [...currentRawTasks];
    const [draggedItem] = rearranged.splice(draggedIndex, 1);
    rearranged.splice(targetIndex, 0, draggedItem);

    updateTodayRecord({ tasks: rearranged });
    setDraggedIndex(null);
  };

  return (
    <div className="dashboard-container page-fade-in" style={{ maxWidth: "1140px", paddingBottom: "140px" }}>

      {/* Header Deck */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", width: "100%", marginBottom: "28px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px 0", color: "#ffffff", letterSpacing: "-0.8px" }}>
            Daily Routine Execution
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Unit Segment ID: <span style={{ color: "#4f8cff", fontWeight: 700, marginRight: "16px" }}>{todayKey}</span>
            Hardware Clock: <span style={{ color: "rgba(255,255,255,0.65)" }}>{currentTime.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: "1px" }}>
            Efficiency Index
          </div>
          <div style={{ fontSize: "40px", fontWeight: 950, color: isHolidayMode ? "#1dd1a1" : (completionRate === 100 ? "#1dd1a1" : "#4f8cff"), lineHeight: 1, letterSpacing: "-1px" }}>
            {isHolidayMode ? "100%" : `${completionRate}%`}
          </div>
        </div>
      </div>

      {/* High Fidelity Progress Metric Line */}
      <div style={{ width: "100%", height: "8px", background: "#13131a", borderRadius: "4px", overflow: "hidden", marginBottom: "36px", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
        <div style={{
          width: isHolidayMode ? "100%" : `${completionRate}%`, height: "100%",
          background: isHolidayMode || completionRate === 100 ? "linear-gradient(90deg, #1dd1a1, #10ac84)" : "linear-gradient(90deg, #3b82f6, #1d4ed8)",
          transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: isHolidayMode || completionRate === 100 ? "0 0 12px #1dd1a1" : "0 0 12px #3b82f6"
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", marginBottom: "28px" }}>
        <button
          onClick={handleResetDay}
          style={{
            background: "#181013", border: "1px solid #4c1d23", color: "#f43f5e",
            padding: "12px 26px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s ease", boxShadow: "0 4px 14px rgba(244, 63, 94, 0.08)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#221318"; e.currentTarget.style.boxShadow = "0 0 20px rgba(244, 63, 94, 0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#181013"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(244, 63, 94, 0.08)"; }}
        >
          🔄 Reset Today's Checks
        </button>
      </div>

      {/* TIMELINE GRID CONTAINER */}
      {isHolidayMode ? (
        <div style={{ padding: "90px 20px", textAlign: "center", background: "#0b0b11", borderRadius: "20px", border: "1px dashed rgba(29, 209, 161, 0.25)", boxShadow: "0 0 40px rgba(29, 209, 161, 0.03)" }}>
          <span style={{ fontSize: "54px" }}>🏖️</span>
          <h3 style={{ color: "#1dd1a1", marginTop: "20px", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>Holiday Mode Active</h3>
          <p style={{ color: "rgba(255,255,255,0.35)", margin: "8px 0 0 0", fontSize: "15px" }}>Disconnect from operational grids. Enjoy your rest architecture fully.</p>
        </div>
      ) : (
        <div className="timeline-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {schedule.map((item, index) => {
            const isDone = !!progressClicks[item.timeLabel];
            const isHovered = hoveredIndex === index;

            // Centered Ambient Shadow Engine Math
            let cardBoxShadow = "0 8px 30px rgba(0, 0, 0, 0.3)";
            if (isDone) {
              cardBoxShadow = isHovered ? "0 0 35px rgba(29, 209, 161, 0.25)" : "0 0 22px rgba(29, 209, 161, 0.12)";
            } else if (isHovered) {
              cardBoxShadow = "0 0 35px rgba(59, 130, 246, 0.25)";
            }

            return (
              <div
                key={`${item.timeLabel}-${index}`}
                className={`timeline-row ${isDone ? "is-completed" : ""}`}
                onClick={() => handleToggleTaskInternal(item.timeLabel)}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isDone ? "linear-gradient(135deg, #05140e 0%, #020806 100%)" : "#0a0a10",
                  border: isDone ? "1px solid rgba(29, 209, 161, 0.25)" : "1px solid #161622",
                  borderLeft: isDone ? "6px solid #1dd1a1" : "6px solid #3b82f6",
                  borderRadius: "16px",
                  padding: "32px 40px", // ⚡ Significantly wider and more elongated layout parameters
                  cursor: "grab",
                  opacity: draggedIndex === index ? 0.35 : 1,
                  boxShadow: cardBoxShadow, // 🔥 High premium centralized light source box shadows
                  transform: isHovered && draggedIndex === null ? "translateY(-3px) scale(1.006)" : "translateY(0) scale(1)",
                  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" // 🔥 Responsive fluid structural ease settings
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "28px", width: "90%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "20px", cursor: "grab" }}>☰</span>
                    <button
                      onClick={() => handleDeleteTask(index)}
                      style={{ background: "transparent", border: "none", color: "rgba(239,68,68,0.3)", cursor: "pointer", fontSize: "16px", transition: "color 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "rgba(239,68,68,0.9)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "rgba(239,68,68,0.3)"}
                    >
                      🗑️
                    </button>
                  </div>

                  <span style={{ fontSize: "28px", transition: "transform 0.3s ease", transform: isHovered ? "scale(1.12)" : "scale(1)", filter: isDone ? "grayscale(95%) opacity(0.35)" : "none" }}>
                    {getTimeOfDayIcon(item.timeLabel)}
                  </span>

                  <div style={{ minWidth: "150px", fontSize: "15.5px", fontWeight: 800, fontFamily: "monospace", color: isDone ? "#10ac84" : "#3b82f6", letterSpacing: "0.6px" }}>
                    {item.timeLabel}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: isDone ? "rgba(255,255,255,0.6)" : "#ffffff", letterSpacing: "-0.3px", textDecoration: isDone ? "line-through" : "none", transition: "all 0.2s" }}>
                      {item.task}
                    </h4>
                    <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: isDone ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.4)", lineHeight: "1.5" }}>
                      {item.scope}
                    </p>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <div
                    onClick={() => handleToggleTaskInternal(item.timeLabel)}
                    style={{
                      cursor: "pointer", width: "28px", height: "28px", borderRadius: "8px",
                      border: isDone ? "1px solid #1dd1a1" : "1px solid rgba(255,255,255,0.12)",
                      background: isDone ? "rgba(29, 209, 161, 0.15)" : "rgba(0,0,0,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: isDone ? "#1dd1a1" : "transparent",
                      fontWeight: 900, fontSize: "14px", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isHovered ? "scale(1.08)" : "scale(1)"
                    }}
                  >
                    ✓
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ➕ CUSTOM TASK INJECTION LAYER */}
      {!isHolidayMode && (
        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "40px" }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: "100%", background: "#0b1326", border: "1px dashed #1d3566", color: "#3b82f6",
              padding: "20px", borderRadius: "16px", fontSize: "14px", fontWeight: 700, cursor: "pointer",
              transition: "all 0.3s", boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#0f1b35"; e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 25px rgba(59,130,246,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#0b1326"; e.currentTarget.style.borderColor = "#1d3566"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
          >
            ➕ Inject Custom Task Block
          </button>
        </div>
      )}

      {/* 🌌 CONSOLE CONTROL NIGHT STRATEGY FRAME */}
      {showNightDeck && (
        <div style={{
          marginTop: "54px", padding: "32px", background: "#06060a",
          border: "1px solid #13131f", borderRadius: "20px", boxShadow: "0 15px 50px rgba(0,0,0,0.6)"
        }}>
          <h3 style={{ color: "#ffffff", fontSize: "18px", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.4px" }}>
            🌙 Night Sync Strategy Frame
          </h3>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", margin: "0 0 26px 0" }}>
            Late hour detection event confirmed. Initialize parameters for tomorrow's template sequence:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            <button
              onClick={() => {
                const tomorrowKey = getTomorrowKey();
                setDb((prev: any) => ({
                  ...prev,
                  daily_records: {
                    ...(prev?.daily_records || {}),
                    [tomorrowKey]: { tasks: currentRawTasks, progress: {}, holiday_mode: false }
                  }
                }));
                setIsModalOpen(true);
              }}
              style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#38bdf8", padding: "18px", borderRadius: "12px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              📝 Plan Your Next Day
            </button>
            <button
              onClick={handleSetSameRoutineTomorrow}
              style={{ background: "#061512", border: "1px solid #0f2d24", color: "#4ade80", padding: "18px", borderRadius: "12px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(74,222,128,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              🔄 Run Same Routine
            </button>
            <button
              onClick={handleClearDayHolidayTomorrow}
              style={{ background: "#1c0d10", border: "1px solid #3b141a", color: "#f87171", padding: "18px", borderRadius: "12px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 20px rgba(248,113,113,0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              🏖️ Clear My Day (Holiday)
            </button>
          </div>
        </div>
      )}

      {/* ENTRY LAYOUT INTERFACING MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.7)", border: "1px solid #1c1c28", borderRadius: "20px" }}>
            <h3 style={{ fontSize: "19px", margin: "0 0 24px 0", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.4px" }}>Inject Operational Frame</h3>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Operational Assignment Title</label>
                <input
                  type="text" className="form-input" placeholder="e.g., Deep Learning Architecture Sprint"
                  value={taskInput} onChange={(e) => setTaskInput(e.target.value)} required autoFocus
                />
              </div>
              <div className="form-group">
                <label>Execution Parameters / Target Scope</label>
                <input
                  type="text" className="form-input" placeholder="e.g., Focus on vision transformer heads."
                  value={scopeInput} onChange={(e) => setScopeInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Time Duration Allocation (Minutes)</label>
                <input
                  type="number" className="form-input" placeholder="60"
                  value={durationInput} onChange={(e) => setDurationInput(e.target.value)} required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "14px", marginTop: "32px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Inject Block</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPage;