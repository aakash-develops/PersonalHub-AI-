// src/pages/DailyPage.tsx
import React, { useState, useEffect, useMemo } from "react";
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

const DEFAULT_TASKS: TaskItem[] = [
  { task: "Wake + routine", scope: "Immediate morning alignment, water, light stretching.", durationMins: 60 },
  { task: "Finnish listening & speaking", scope: "Dedicated language immersion window. Pronunciation drills.", durationMins: 45 },
  { task: "ML theory study", scope: "Mathematical validation, papers, and architectural core concepts.", durationMins: 90 },
  { task: "ML coding practice", scope: "Pipeline engineering, model testing, and algorithmic building.", durationMins: 90 },
  { task: "Career (CV, LinkedIn, jobs)", scope: "Market tracking, resume optimization, outreach, and applications.", durationMins: 60 },
  { task: "ML project building", scope: "Feature extraction, training cycles, and full-stack architecture.", durationMins: 90 },
  { task: "Exercise", scope: "Physical reset, cardio/lifting, and cognitive recovery window.", durationMins: 60 },
  { task: "ML practice/project", scope: "Code refining, documentation tuning, and secondary loops.", durationMins: 90 },
  { task: "Review & revision", scope: "Anki retention cards, look back over code logic, review notes.", durationMins: 60 },
  { task: "Planning + rest", scope: "Tomorrow's agenda strategy, clear dev rigs, screen blackout.", durationMins: 90 }
];

const FAMOUS_QUOTES = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
  { quote: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Arise, awake, and stop not until the goal is reached.", author: "Swami Vivekananda" }
];

const DailyPage: React.FC<DailyPageProps> = ({ db, setDb }) => {
  // Modal & Input States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [scopeInput, setScopeInput] = useState("");
  const [durationInput, setDurationInput] = useState("60");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingDurationIndex, setEditingDurationIndex] = useState<number | null>(null);

  // Custom Warning Dialog State
  const [warningConfig, setWarningConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    emoji: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", emoji: "⚠️", onConfirm: () => {} });

  // Custom Prompt States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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

  const dailyQuote = useMemo(() => {
    const dayNumeric = currentTime.getDate();
    return FAMOUS_QUOTES[dayNumeric % FAMOUS_QUOTES.length];
  }, [currentTime]);

  const dailyRecords = db?.daily_records || {};
  const todayRecord = dailyRecords[todayKey] || {
    tasks: DEFAULT_TASKS,
    progress: {},
    holiday_mode: false,
    waking_time: "07:00",
    penalty_score: 0
  };

  const currentRawTasks: TaskItem[] = todayRecord.tasks || DEFAULT_TASKS;
  const progressClicks = todayRecord.progress || {};
  const isHolidayMode = !!todayRecord.holiday_mode;
  const currentWakingTime = todayRecord.waking_time || "07:00";
  const penaltyScore = todayRecord.penalty_score || 0;

  // DYNAMIC CASCADING TIMELINE ENGINE
  const schedule: DisplayItem[] = useMemo(() => {
    const [wakeHrs, wakeMins] = currentWakingTime.split(":").map(Number);
    let currentStartMins = (isNaN(wakeHrs) ? 7 : wakeHrs) * 60 + (isNaN(wakeMins) ? 0 : wakeMins);

    return currentRawTasks.map((item) => {
      const startMins = currentStartMins;
      const endMins = (startMins + item.durationMins) % 1440;

      const formatTimeStr = (totalMins: number) => {
        const h = Math.floor(totalMins / 60).toString().padStart(2, "0");
        const m = (totalMins % 60).toString().padStart(2, "0");
        return `${h}:${m}`;
      };

      const computedLabel = `${formatTimeStr(startMins)} - ${formatTimeStr(endMins)}`;
      currentStartMins = startMins + item.durationMins;

      return {
        ...item,
        timeLabel: computedLabel
      };
    });
  }, [currentRawTasks, currentWakingTime]);

  const totalTasks = schedule.length;
  const completedTasks = Object.values(progressClicks).filter(Boolean).length;

  const completionRate = useMemo(() => {
    if (totalTasks === 0) return 0;
    const baseRate = Math.round((completedTasks / totalTasks) * 100);
    const penalizedRate = baseRate - (penaltyScore * 15);
    return Math.max(0, penalizedRate);
  }, [completedTasks, totalTasks, penaltyScore]);

  const getTimeOfDayIcon = (timeRangeStr: string): string => {
    const startHour = parseInt(timeRangeStr.split(":")[0], 10);
    if (isNaN(startHour)) return "⚙️";
    if (startHour >= 5 && startHour < 12) return "🌅";
    if (startHour >= 12 && startHour < 17) return "☀️";
    if (startHour >= 17 && startHour < 21) return "🌇";
    return "🌌";
  };

  // Triggers the Night Sync Control box between 23:00 and 04:00
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

  const handleWakingTimeChange = (newTime: string) => {
    updateTodayRecord({ waking_time: newTime });
  };

  const handleToggleTaskInternal = (timeLabel: string) => {
    const updatedProgress = { ...progressClicks };
    updatedProgress[timeLabel] = !updatedProgress[timeLabel];
    updateTodayRecord({ progress: updatedProgress });
  };

  const checkTimelineOverflow = (tasksToTest: TaskItem[]): boolean => {
    const [wakeHrs, wakeMins] = currentWakingTime.split(":").map(Number);
    const startMins = (isNaN(wakeHrs) ? 7 : wakeHrs) * 60 + (isNaN(wakeMins) ? 0 : wakeMins);
    const totalDuration = tasksToTest.reduce((sum, t) => sum + t.durationMins, 0);
    return (startMins + totalDuration) > 1440;
  };

  const handleUpdateDuration = (index: number, newMins: number) => {
    const updatedTasks = [...currentRawTasks];
    updatedTasks[index] = { ...updatedTasks[index], durationMins: newMins };

    if (checkTimelineOverflow(updatedTasks)) {
      setWarningConfig({
        isOpen: true,
        emoji: "⏳",
        title: "Timeline Boundary Alert",
        message: "Modifying this block breaks past the midnight (00:00) barrier. Proceeding adds a systematic penalty to your Consistency Index.",
        onConfirm: () => {
          updateTodayRecord({ tasks: updatedTasks, penalty_score: penaltyScore + 1 });
          setWarningConfig(prev => ({ ...prev, isOpen: false }));
        }
      });
    } else {
      updateTodayRecord({ tasks: updatedTasks });
    }
    setEditingDurationIndex(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    const newRawTask: TaskItem = {
      task: taskInput.trim(),
      scope: scopeInput.trim() || "Dynamic custom block frame.",
      durationMins: parseInt(durationInput, 10) || 60
    };

    const targetTasks = [...currentRawTasks, newRawTask];

    if (checkTimelineOverflow(targetTasks)) {
      setWarningConfig({
        isOpen: true,
        emoji: "🚀",
        title: "Operational Routine Overflow",
        message: "Injected task pushes execution past 00:00. This configuration will lower consistency scores to encourage time discipline.",
        onConfirm: () => {
          updateTodayRecord({ tasks: targetTasks, penalty_score: penaltyScore + 1 });
          setWarningConfig(prev => ({ ...prev, isOpen: false }));
          setIsModalOpen(false);
        }
      });
    } else {
      updateTodayRecord({ tasks: targetTasks });
      setIsModalOpen(false);
    }

    setTaskInput("");
    setScopeInput("");
    setDurationInput("60");
  };

  const handleDeleteTask = (indexToDelete: number) => {
    updateTodayRecord({ tasks: currentRawTasks.filter((_, idx) => idx !== indexToDelete) });
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
        [tomorrowKey]: { tasks: currentRawTasks, progress: {}, holiday_mode: false, waking_time: currentWakingTime, penalty_score: 0 }
      }
    }));
  };

  const handleClearDayHolidayTomorrow = () => {
    const tomorrowKey = getTomorrowKey();
    setDb((prev: any) => ({
      ...prev,
      daily_records: {
        ...(prev?.daily_records || {}),
        [tomorrowKey]: { tasks: [], progress: {}, holiday_mode: true, penalty_score: 0 }
      }
    }));
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
    <div className="w-full max-w-[1480px] mx-auto p-5 md:p-8 flex flex-col box-border pb-20 select-none page-fade-in bg-transparent" style={{ color: "var(--text-main)" }}>

      {/* FLOATING BOXLESS HIGHLIGHTED QUOTE */}
      <div className="w-full mb-6 text-center border-b border-dashed pb-3" style={{ borderColor: "var(--border-subtle)" }}>
        <span className="text-sm md:text-base font-semibold tracking-wide italic" style={{ color: "var(--text-main)" }}>
          "{dailyQuote.quote}"
        </span>
        <span className="text-xs font-bold font-mono tracking-wider uppercase ml-3" style={{ color: "var(--accent-color)" }}>
          — {dailyQuote.author}
        </span>
      </div>

      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight m-0 uppercase" style={{ fontFamily: "var(--font-display)" }}>
            Daily Routine Execution
          </h2>
          <div className="m-0 mt-2 text-xs font-mono tracking-wider flex flex-wrap items-center gap-x-5 gap-y-2" style={{ color: "var(--text-muted)" }}>
            <span>Unit ID: <strong style={{ color: "var(--secondary-accent)" }}>{todayKey}</strong></span>

            <span className="flex items-center gap-1.5 font-bold">
              Clock:
              <span className="px-2 py-0.5 rounded text-xs font-black" style={{ backgroundColor: "var(--pill-bg)", color: "var(--text-main)", border: "1px solid var(--border-glass)" }}>
                {currentTime.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </span>

            <span className="flex items-center gap-1.5 font-bold">
              ☀️ Wake Time:
              <input
                type="time"
                value={currentWakingTime}
                onChange={(e) => handleWakingTimeChange(e.target.value)}
                className="px-1.5 py-0.5 rounded text-xs font-bold font-mono border focus:outline-none"
                style={{ backgroundColor: "var(--pill-bg)", color: "var(--text-main)", borderColor: "var(--border-subtle)" }}
              />
            </span>

            {penaltyScore > 0 && (
              <span className="font-bold text-xs px-2 py-0.5 rounded border animate-pulse" style={{ borderColor: "rgba(239, 68, 68, 1)", color: "rgba(239, 68, 68, 1)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}>
                🚨 BOUNDARY OVERFLOWS: {penaltyScore}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto text-right">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-80" style={{ color: "var(--text-muted)" }}>
              Efficiency Index
            </div>
            <div className="text-2xl font-bold font-mono tracking-tighter transition-all" style={{ color: completionRate >= 80 || isHolidayMode ? "var(--secondary-accent)" : "var(--accent-color)" }}>
              {isHolidayMode ? "100%" : `${completionRate}%`}
            </div>
          </div>
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="font-mono text-[10px] px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200"
            style={{
              backgroundColor: "var(--pill-bg)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-main)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--card-bg-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--pill-bg)"}
          >
            🔄 Reset Vector
          </button>
        </div>
      </div>

      {/* Dynamic Telemetry System Bar */}
      <div className="telemetry-bar-bg mb-6">
        <div
          className="telemetry-fill"
          style={{
            width: isHolidayMode ? "100%" : `${completionRate}%`,
            background: `linear-gradient(90deg, var(--accent-color) 0%, var(--secondary-accent) 100%)`
          }}
        />
      </div>

      {/* 2-COLUMN BALANCED SYSTEM ROUTINE CARDS */}
      {isHolidayMode ? (
        <div className="w-full py-12 text-center rounded-xl border-2 border-dashed" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-subtle)" }}>
          <span className="text-3xl">🏖️</span>
          <h3 className="mt-3 text-base font-bold uppercase tracking-tight" style={{ color: "var(--secondary-accent)" }}>Holiday Mode Active</h3>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {schedule.map((item, index) => {
            const isDone = !!progressClicks[item.timeLabel];
            return (
              <div
                key={`${item.timeLabel}-${index}`}
                onClick={() => handleToggleTaskInternal(item.timeLabel)}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                className="group rounded-xl border p-4 cursor-grab select-none transition-all duration-200 flex items-center justify-between min-h-[70px] relative overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-glass)",
                  borderColor: isDone ? "var(--accent-color)" : "var(--border-glass)",
                  boxShadow: "var(--shadow-premium)",
                  opacity: draggedIndex === index ? 0.35 : (isDone ? 0.65 : 1),
                  borderLeftWidth: "4px",
                  borderLeftColor: isDone ? "var(--accent-color)" : "var(--secondary-accent)"
                }}
              >
                <div className="flex items-center gap-3.5 w-[92%] overflow-hidden">

                  {/* Sorting & Deletion Controls */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="font-bold text-sm cursor-grab opacity-40 hover:opacity-100" style={{ color: "var(--text-main)" }}>☰</span>
                    <button
                      onClick={() => handleDeleteTask(index)}
                      className="bg-transparent border-none opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-xs"
                      style={{ color: "var(--text-main)" }}
                      title="Delete task (Allows penalty-free replacement tracking)"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Time Icon */}
                  <span className="text-base flex-shrink-0 hidden sm:block">
                    {getTimeOfDayIcon(item.timeLabel)}
                  </span>

                  {/* TIME MATRIX INLINE DURATION CONTROLLER */}
                  <div
                    className="text-xs font-bold font-mono tracking-wide flex-shrink-0 min-w-[95px] cursor-pointer hover:underline decoration-dotted relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDurationIndex(editingDurationIndex === index ? null : index);
                    }}
                    title="Click to tweak block length"
                  >
                    {editingDurationIndex === index ? (
                      <select
                        value={item.durationMins}
                        onChange={(selectEvent) => handleUpdateDuration(index, parseInt(selectEvent.target.value, 10))}
                        onClick={(selectEvent) => selectEvent.stopPropagation()}
                        className="text-[11px] font-mono rounded border p-1 focus:outline-none"
                        style={{ backgroundColor: "var(--bg-fallback)", color: "var(--text-main)", borderColor: "var(--border-subtle)" }}
                      >
                        <option value={15}>15m</option>
                        <option value={30}>30m</option>
                        <option value={45}>45m</option>
                        <option value={60}>1h 00m</option>
                        <option value={75}>1h 15m</option>
                        <option value={90}>1h 30m</option>
                        <option value={120}>2h 00m</option>
                        <option value={150}>2h 30m</option>
                        <option value={180}>3h 00m</option>
                        <option value={240}>4h 00m</option>
                        <option value={300}>5h 00m</option>
                      </select>
                    ) : (
                      <span>⏰ {item.timeLabel}</span>
                    )}
                  </div>

                  {/* Text Information Elements */}
                  <div className="flex flex-col min-w-0 flex-1 pr-1">
                    <h4 className="m-0 text-sm font-bold tracking-tight truncate transition-all"
                        style={{
                          color: "var(--text-main)",
                          textDecoration: isDone ? "line-through" : "none",
                          opacity: isDone ? 0.5 : 1
                        }}>
                      {item.task}
                    </h4>
                    <p className="m-0 text-[11px] font-sans truncate mt-0.5 transition-all"
                       style={{
                         color: "var(--text-muted)",
                         textDecoration: isDone ? "line-through" : "none",
                         opacity: isDone ? 0.4 : 0.95
                       }}>
                      {item.scope} <span className="text-[10px] opacity-60 font-mono">({item.durationMins}m)</span>
                    </p>
                  </div>
                </div>

                {/* Status Switch Interactive Box */}
                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
                  <div
                    onClick={() => handleToggleTaskInternal(item.timeLabel)}
                    className="w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all duration-200 font-mono text-[9px] font-black cursor-pointer"
                    style={{
                      backgroundColor: isDone ? "var(--accent-color)" : "transparent",
                      borderColor: isDone ? "var(--accent-color)" : "var(--border-subtle)",
                      color: isDone ? "var(--bg-fallback)" : "transparent"
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

      {/* INJECT DYNAMIC BLOCK BUTTON */}
      {!isHolidayMode && (
        <div className="w-full flex justify-center mt-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full border border-dashed font-bold text-xs font-mono py-3 rounded-xl cursor-pointer transition-all duration-300 shadow-sm"
            style={{
              backgroundColor: "var(--bg-glass)",
              borderColor: "var(--border-subtle)",
              color: "var(--secondary-accent)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--secondary-accent)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-subtle)"}
          >
            ▲ Inject Custom Task Block
          </button>
        </div>
      )}

      {/* NIGHT SYNC STRATEGY FRAMES DEPLOYMENT BOARD (Triggers automatically at 23:00) */}
      {showNightDeck && (
        <div className="mt-6 p-4 rounded-xl border shadow-lg animate-fade-in" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-glass)" }}>
          <h3 className="text-sm font-bold font-mono uppercase tracking-tight mb-3" style={{ color: "var(--text-main)" }}>
            🌙 Night Sync Strategy Frame
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                const tomorrowKey = getTomorrowKey();
                setDb((prev: any) => ({
                  ...prev,
                  daily_records: {
                    ...(prev?.daily_records || {}),
                    [tomorrowKey]: { tasks: currentRawTasks, progress: {}, holiday_mode: false, waking_time: currentWakingTime, penalty_score: 0 }
                  }
                }));
                setIsModalOpen(true);
              }}
              className="border font-bold text-xs font-mono py-2 rounded-lg cursor-pointer transition-colors"
              style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
            >
              📝 Plan Tomorrow
            </button>
            <button
              onClick={() => {
                handleSetSameRoutineTomorrow();
                alert("Tomorrow's sequence duplicated seamlessly.");
              }}
              className="border font-bold text-xs font-mono py-2 rounded-lg cursor-pointer transition-colors"
              style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--secondary-accent)" }}
            >
              🔄 Repeat Routine
            </button>
            <button
              onClick={() => {
                handleClearDayHolidayTomorrow();
                alert("Tomorrow set to Holiday Mode.");
              }}
              className="border font-bold text-xs font-mono py-2 rounded-lg cursor-pointer transition-colors"
              style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--accent-color)" }}
            >
              🏖️ Set Holiday
            </button>
          </div>
        </div>
      )}

      {/* ================= MODALS & DIALOGS SECTION ================= */}

      {/* PREMIUM HIGH-ATTRACTION OVERFLOW WARNING DIALOG BOX */}
      {warningConfig.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div
            className="border w-full max-w-[420px] p-6 shadow-2xl rounded-2xl text-center transform transition-all scale-100"
            style={{ backgroundColor: "var(--bg-fallback)", borderColor: "rgba(239, 68, 68, 0.4)", color: "var(--text-main)" }}
          >
            <div className="text-5xl mb-3 animate-bounce">{warningConfig.emoji}</div>
            <h3 className="text-base font-bold font-mono uppercase tracking-wider text-red-500 mb-2">
              {warningConfig.title}
            </h3>
            <p className="text-xs font-sans leading-relaxed opacity-90 mb-5" style={{ color: "var(--text-muted)" }}>
              {warningConfig.message}
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="text-xs font-mono font-bold px-4 py-2 rounded-xl border transition-colors"
                style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                onClick={() => setWarningConfig(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel Vector
              </button>
              <button
                className="text-white text-xs font-mono font-bold px-5 py-2 rounded-xl border shadow-md transition-opacity bg-red-600 border-red-600 hover:opacity-90"
                onClick={warningConfig.onConfirm}
              >
                Accept Penalty & Inject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTRACTIVE SYSTEM VECTOR RESET MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsResetModalOpen(false)}>
          <div
            className="border w-full max-w-[400px] p-5 shadow-2xl rounded-xl text-center"
            style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl mb-2">🔄</div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-tight mb-2">Reset Routine Core</h3>
            <p className="text-xs opacity-80 mb-4" style={{ color: "var(--text-muted)" }}>Choose a reconfiguration state framework:</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  updateTodayRecord({ tasks: DEFAULT_TASKS, progress: {}, holiday_mode: false, waking_time: "07:00", penalty_score: 0 });
                  setIsResetModalOpen(false);
                }}
                className="text-xs font-mono font-bold py-2.5 rounded-lg border w-full transition-all"
                style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--secondary-accent)" }}
              >
                ⚡ Restore Pristine Defaults
              </button>
              <button
                onClick={() => {
                  updateTodayRecord({ tasks: [], progress: {}, holiday_mode: false, waking_time: "07:00", penalty_score: 0 });
                  setIsResetModalOpen(false);
                }}
                className="text-xs font-mono font-bold py-2.5 rounded-lg border w-full transition-all"
                style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "rgba(239, 68, 68, 1)" }}
              >
                🗑️ Clean Slate Wipe
              </button>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-xs font-mono font-bold py-2 rounded-lg border w-full mt-2"
                style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INPUT SYSTEM MODAL BLOCK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="border w-full max-w-[440px] p-5 shadow-2xl rounded-xl"
            style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)", color: "var(--text-main)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold font-mono uppercase tracking-tight mb-3">Inject Operational Frame</h3>
            <form onSubmit={handleAddTask} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Assignment Title</label>
                <input
                  type="text"
                  className="border rounded-lg p-2.5 text-xs focus:outline-none"
                  style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Target Scope</label>
                <input
                  type="text"
                  className="border rounded-lg p-2.5 text-xs focus:outline-none"
                  style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                  value={scopeInput}
                  onChange={(e) => setScopeInput(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Duration (Minutes)</label>
                <input
                  type="number"
                  className="border rounded-lg p-2.5 text-xs focus:outline-none font-mono"
                  style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border"
                  style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white text-xs font-mono font-bold px-4 py-1.5 rounded-lg border shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--accent-color)", borderColor: "var(--accent-color)" }}
                >
                  Inject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyPage;