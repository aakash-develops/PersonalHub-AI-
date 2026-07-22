import React, { useState } from "react";
// Import master dataset & types from curriculumData.ts
import type { RoadmapRow, SubtopicGrid } from "../types/curriculumData";
import {FULL_CURRICULUM_DATA} from "../types/curriculumData";

interface RoadmapPageProps {
  db: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
}

const RoadmapPage: React.FC<RoadmapPageProps> = ({ db, setDb }) => {
  // Safe matrix extraction with immediate fallback to master curriculum file
  const storedMatrix = db?.modules_data?.ml_roadmap_matrix;
  const currentRows: RoadmapRow[] =
    Array.isArray(storedMatrix) && storedMatrix.length > 0
      ? storedMatrix
      : FULL_CURRICULUM_DATA;

  const [dailyTargetHours, setDailyTargetHours] = useState<number>(
    db?.modules_data?.velocity_config?.daily_target_hours || 2.5
  );

  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeGrid, setActiveGrid] = useState<SubtopicGrid | null>(null);
  const [hoveredGridId, setHoveredGridId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);

  // Modal active view tab
  const [modalTab, setModalTab] = useState<"overview" | "studies" | "notes" | "code">("overview");

  // Dynamic creation state variables
  const [newRowTitle, setNewRowTitle] = useState("");
  const [newRowTimeline, setNewRowTimeline] = useState("");
  const [newRowColor, setNewRowColor] = useState("#3b82f6");

  const [targetRowForGrid, setTargetRowForGrid] = useState<string>("");
  const [newGridTitle, setNewGridTitle] = useState("");
  const [newGridContents, setNewGridContents] = useState("");
  const [newGridStudies, setNewGridStudies] = useState("");
  const [newGridDuration, setNewGridDuration] = useState<number>(60);

  // PERSISTENCE ENGINE: Pushes updates to parent React state -> auto-syncs with D Drive backend
  const saveRoadmapToDb = (updatedMatrix: RoadmapRow[], targetHours = dailyTargetHours) => {
    setDb((prev: any) => ({
      ...prev,
      modules_data: {
        ...(prev?.modules_data || {}),
        ml_roadmap_matrix: updatedMatrix,
        velocity_config: { daily_target_hours: targetHours }
      }
    }));
  };

  const handleUpdateHours = (val: number) => {
    const cleaned = Math.max(0.1, Number(val) || 1);
    setDailyTargetHours(cleaned);
    saveRoadmapToDb(currentRows, cleaned);
  };

  // PROGRESSION & UNLOCK COMPUTATION
  const calculateRowProgress = (row: RoadmapRow) => {
    if (!row.grids || row.grids.length === 0) return 0;
    const completedCount = row.grids.filter((g) => g.isCompleted).length;
    return Math.round((completedCount / row.grids.length) * 100);
  };

  const isRowUnlocked = (rowIndex: number): boolean => {
    if (rowIndex === 0) return true;
    const stepPrerequisiteRow = currentRows[rowIndex - 1];
    return calculateRowProgress(stepPrerequisiteRow) === 100;
  };

  const isNodeUnlocked = (rowIndex: number, gridIndex: number): boolean => {
    if (!isRowUnlocked(rowIndex)) return false;
    if (gridIndex === 0) return true;
    const previousGrids = currentRows[rowIndex].grids.slice(0, gridIndex);
    return previousGrids.every((g) => g.isCompleted);
  };

  const calculateGlobalPageProgress = () => {
    let totalGrids = 0;
    let completedGrids = 0;
    currentRows.forEach((r) => {
      totalGrids += r.grids.length;
      completedGrids += r.grids.filter((g) => g.isCompleted).length;
    });
    return {
      percent: totalGrids === 0 ? 0 : Math.round((completedGrids / totalGrids) * 100),
      totalGrids,
      completedGrids
    };
  };

  const calculateTotalRemainingTime = () => {
    let aggregateMinutesRemaining = 0;
    currentRows.forEach((row) => {
      row.grids.forEach((grid) => {
        if (!grid.isCompleted) {
          aggregateMinutesRemaining += grid.durationMinutes || 0;
        }
      });
    });
    const hoursRemaining = aggregateMinutesRemaining / 60;
    const daysRemaining = hoursRemaining / dailyTargetHours;
    return {
      hoursRemaining: hoursRemaining.toFixed(1),
      daysRemaining: daysRemaining.toFixed(1)
    };
  };

  const calculateRowHourMetrics = (row: RoadmapRow) => {
    let studiedMinutes = 0;
    let leftMinutes = 0;
    row.grids.forEach((g) => {
      if (g.isCompleted) studiedMinutes += g.durationMinutes || 0;
      else leftMinutes += g.durationMinutes || 0;
    });
    return {
      studiedHours: (studiedMinutes / 60).toFixed(1),
      leftHours: (leftMinutes / 60).toFixed(1)
    };
  };

  // ACTIONS & HANDLERS
  const handleOpenGridWorkspace = (rowId: string, gridItem: SubtopicGrid) => {
    const timestamp = new Date().toLocaleString("en-GB", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
    });

    const updated = currentRows.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          grids: row.grids.map((g) => (g.id === gridItem.id ? { ...g, lastViewed: timestamp } : g))
        };
      }
      return row;
    });

    saveRoadmapToDb(updated);
    setActiveRowId(rowId);
    setModalTab("overview");

    const activeRowRef = updated.find((r) => r.id === rowId);
    const activeGridRef = activeRowRef?.grids.find((g) => g.id === gridItem.id);
    if (activeGridRef) setActiveGrid({ ...activeGridRef });
  };

  const handleUpdateGridParameters = (markCompleteFlag?: boolean) => {
    if (!activeGrid || !activeRowId) return;

    let finalGridState = { ...activeGrid };

    if (markCompleteFlag) {
      const completionTime = new Date().toLocaleString("en-GB", {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
      });
      finalGridState.isCompleted = true;
      finalGridState.status = "Completed";
      finalGridState.completedAt = completionTime;
    }

    const updated = currentRows.map((row) => {
      if (row.id === activeRowId) {
        return {
          ...row,
          grids: row.grids.map((g) => (g.id === activeGrid.id ? finalGridState : g))
        };
      }
      return row;
    });

    saveRoadmapToDb(updated);
    setActiveGrid(null);
    setActiveRowId(null);
  };

  const handleForceResetWithMasterData = () => {
    if (window.confirm("Overwrites Drive D database with fresh curriculumData.ts template. Proceed?")) {
      saveRoadmapToDb(FULL_CURRICULUM_DATA);
    }
  };

  const handleCreateRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowTitle.trim()) return;

    const newRow: RoadmapRow = {
      id: `row-${Date.now()}`,
      title: newRowTitle.trim(),
      timeline: newRowTimeline.trim() || "Dynamic Timeline Target",
      color: newRowColor,
      grids: []
    };

    saveRoadmapToDb([...currentRows, newRow]);
    setNewRowTitle("");
    setNewRowTimeline("");
  };

  const handleDeleteRow = (rowId: string) => {
    if (!window.confirm("Purge this tactical roadmap row?")) return;
    saveRoadmapToDb(currentRows.filter((r) => r.id !== rowId));
  };

  const handleCreateGrid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRowForGrid || !newGridTitle.trim()) return;

    const newBlock: SubtopicGrid = {
      id: `grid-${Date.now()}`,
      title: newGridTitle.trim(),
      contents: newGridContents.trim() || "Custom specification parameter metrics.",
      coreStudies: newGridStudies.trim() || "Deep study execution blocks mapping core taxonomy values.",
      durationMinutes: Number(newGridDuration) || 60,
      remarks: "",
      isCompleted: false,
      status: "Not Started"
    };

    const updated = currentRows.map((row) => {
      if (row.id === targetRowForGrid) {
        return { ...row, grids: [...row.grids, newBlock] };
      }
      return row;
    });

    saveRoadmapToDb(updated);
    setNewGridTitle("");
    setNewGridContents("");
    setNewGridStudies("");
    setNewGridDuration(60);
  };

  const globalTelemetry = calculateGlobalPageProgress();
  const velocityForecast = calculateTotalRemainingTime();

  return (
    <div className="w-full max-w-[1100px] mx-auto p-4 md:p-6 box-border select-none" style={{ color: "var(--text-main)" }}>

      {/* GLOBAL MASTER METRICS & VELOCITY PANEL */}
      <div className="w-full p-5 rounded-xl border mb-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-glass)" }}>
        <div className="md:col-span-2">
          <div className="flex gap-3 items-center mb-3">
            <span className="text-xl">🏆</span>
            <div>
              <h4 className="text-sm font-bold tracking-wide m-0">Overall Matrix Milestones</h4>
              <p className="text-[11px] m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
                Modules Complete: {globalTelemetry.completedGrids} / {globalTelemetry.totalGrids}
              </p>
            </div>
          </div>
          <div className="w-full">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span style={{ color: "var(--text-muted)" }}>Curriculum Matrix Completed</span>
              <span>{globalTelemetry.percent}%</span>
            </div>
            <div className="telemetry-bar-bg w-full h-2 rounded overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
              <div
                className="h-full transition-all duration-1000"
                style={{ width: `${globalTelemetry.percent}%`, backgroundColor: "var(--accent-color)" }}
              />
            </div>
          </div>
        </div>

        {/* REALTIME VELOCITY FORECASTER */}
        <div className="p-3.5 rounded-lg border flex flex-col justify-between h-full" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">⚡ Velocity Engine</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                className="w-12 text-center text-xs p-0.5 font-mono font-bold rounded border"
                style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                value={dailyTargetHours}
                onChange={(e) => handleUpdateHours(parseFloat(e.target.value))}
              />
              <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>h/day</span>
            </div>
          </div>
          <div className="mt-1">
            <div className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Remaining: <span className="font-mono text-white font-bold">{velocityForecast.hoursRemaining}h</span></div>
            <div className="text-xs font-bold mt-1 text-cyan-400 font-mono">≈ {velocityForecast.daysRemaining} Calibration Days</div>
          </div>
        </div>
      </div>

      {/* SYLLABUS DIRECTORY SYSTEM DROPDOWN */}
      <div className="w-full mb-6 border rounded-xl overflow-hidden backdrop-blur-md transition-all" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-glass)" }}>
        <button
          onClick={() => setIsSyllabusOpen(!isSyllabusOpen)}
          className="w-full p-4 flex justify-between items-center border-none bg-transparent font-bold text-sm tracking-wide text-left cursor-pointer transition-colors"
          style={{ color: "var(--text-main)", fontFamily: "var(--font-display)" }}
        >
          <div className="flex items-center gap-2">
            <span>📚</span>
            <span>FULL DIRECTORY SYLLABUS VIEW</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800">
              {globalTelemetry.totalGrids} Structural Core Elements
            </span>
          </div>
          <span className="text-xs transition-transform duration-200" style={{ transform: isSyllabusOpen ? "rotate(180deg)" : "rotate(0deg)" }}>👇</span>
        </button>

        {isSyllabusOpen && (
          <div className="p-4 border-t flex flex-col gap-4 max-h-[400px] overflow-y-auto" style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(0,0,0,0.1)" }}>
            {currentRows.map((row) => (
              <div key={`syllabus-${row.id}`} className="border rounded-lg p-3" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-fallback)" }}>
                <div className="flex justify-between items-center border-b pb-1.5 mb-2" style={{ borderColor: "var(--border-subtle)" }}>
                  <h4 className="text-xs font-bold m-0" style={{ color: row.color }}>{row.title}</h4>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>({calculateRowProgress(row)}% Done)</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {row.grids.map((grid) => (
                    <div key={`syllabus-grid-${grid.id}`} className="flex justify-between items-center text-xs p-1.5 rounded" style={{ backgroundColor: "var(--pill-bg)" }}>
                      <div className="flex items-center gap-2 truncate pr-4">
                        <span className="text-[10px]">{grid.isCompleted ? "🟩" : "⬜"}</span>
                        <span className="font-medium truncate">{grid.title}</span>
                      </div>
                      <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                        {grid.isCompleted ? `Completed At: ${grid.completedAt?.split(',')[0]}` : `${((grid.durationMinutes || 60) / 60).toFixed(1)}h required`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HEADER & CONTROLS */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight m-0 uppercase" style={{ fontFamily: "var(--font-display)" }}>Machine Learning Engineering Roadmap</h2>
          <p className="text-xs md:text-sm m-0 mt-1" style={{ color: "var(--text-muted)" }}>
            Sequential dependency architecture synced directly to Drive D.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleForceResetWithMasterData} className="border border-stone-700 rounded-lg py-2 px-3 text-xs font-semibold cursor-pointer transition-all bg-stone-800 text-stone-200 hover:bg-stone-700">
            🔄 Sync Master Template
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="border-none rounded-lg py-2 px-3.5 text-xs font-semibold cursor-pointer transition-all shrink-0" style={{ backgroundColor: "var(--accent-color)", color: "var(--bg-fallback)" }}>
            ⚙️ Manage Pipeline
          </button>
        </div>
      </div>

      {/* MATRIX FLOW */}
      <div className="flex flex-col gap-6">
        {currentRows.map((row, rowIndex) => {
          const progressVal = calculateRowProgress(row);
          const { studiedHours, leftHours } = calculateRowHourMetrics(row);
          const nextRowReference = currentRows[rowIndex + 1];
          const phaseUnlocked = isRowUnlocked(rowIndex);

          return (
            <div
              key={row.id}
              className="rounded-xl border p-5 backdrop-blur-md transition-all relative overflow-hidden"
              style={{
                backgroundColor: "var(--bg-glass)",
                borderColor: "var(--border-glass)",
                opacity: phaseUnlocked ? 1 : 0.65,
                filter: phaseUnlocked ? "none" : "grayscale(30%)"
              }}
            >
              {!phaseUnlocked && (
                <div className="absolute top-2 right-3 z-10 flex items-center gap-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md">
                  🔒 Gated Phase: Complete prior tier to unlock
                </div>
              )}

              {/* Row Banner Metadata */}
              <div className="flex flex-col md:flex-row justify-between gap-4 pb-4 mb-4 border-b border-dashed" style={{ borderColor: "var(--border-subtle)" }}>
                <div>
                  <h3 className="text-base font-bold tracking-wide m-0" style={{ color: row.color }}>{row.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>{row.timeline}</span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(34, 211, 238, 0.1)", color: "var(--secondary-accent)" }}>⏱️ {studiedHours}h processed</span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(244, 114, 182, 0.1)", color: "var(--accent-color)" }}>⏳ {leftHours}h left</span>
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span style={{ color: "var(--text-muted)" }}>Phase Completion</span>
                    <span style={{ color: row.color }}>{progressVal}%</span>
                  </div>
                  <div className="telemetry-bar-bg h-1.5 w-full rounded overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
                    <div className="h-full" style={{ width: `${progressVal}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              </div>

              {/* Grid Subtopics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {row.grids.map((grid, gridIndex) => {
                  const nodeUnlocked = isNodeUnlocked(rowIndex, gridIndex);
                  const isHovered = hoveredGridId === grid.id;

                  let cardStyles: React.CSSProperties = {
                    backgroundColor: "var(--pill-bg)",
                    borderColor: "var(--border-subtle)",
                    cursor: nodeUnlocked ? "pointer" : "not-allowed",
                    opacity: nodeUnlocked ? 1 : 0.6
                  };

                  if (grid.isCompleted) {
                    cardStyles.backgroundColor = "rgba(16, 185, 129, 0.05)";
                    cardStyles.borderColor = "rgba(16, 185, 129, 0.4)";
                  } else if (isHovered && nodeUnlocked) {
                    cardStyles.borderColor = row.color;
                  }

                  return (
                    <div
                      key={grid.id}
                      onClick={() => {
                        if (nodeUnlocked) handleOpenGridWorkspace(row.id, grid);
                      }}
                      onMouseEnter={() => setHoveredGridId(grid.id)}
                      onMouseLeave={() => setHoveredGridId(null)}
                      className="rounded-xl border p-4 flex flex-col justify-between min-h-[170px] transition-all duration-200 relative overflow-hidden"
                      style={cardStyles}
                    >
                      {grid.isCompleted ? (
                        <div className="absolute top-0 right-0 text-[9px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-bl-lg">✓ Completed</div>
                      ) : !nodeUnlocked ? (
                        <div className="absolute top-0 right-0 text-[9px] font-bold bg-amber-950/90 text-amber-400 px-2 py-0.5 rounded-bl-lg border-l border-b border-amber-800">🔒 Locked</div>
                      ) : null}

                      <div>
                        <div className="flex items-center gap-2 mb-1.5 pr-12">
                          <h5 className="text-sm font-bold m-0 truncate" style={{ color: "var(--text-main)" }}>{grid.title}</h5>
                        </div>

                        <p className="text-xs m-0 line-clamp-2" style={{ color: "var(--text-muted)" }}>{grid.contents}</p>

                        {grid.tags && grid.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {grid.tags.map((tag) => (
                              <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 border border-white/10" style={{ color: "var(--text-muted)" }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] font-medium font-mono pt-3 mt-3 border-t flex justify-between items-center" style={{ borderColor: "var(--border-subtle)", color: grid.isCompleted ? "#34d399" : grid.lastViewed ? row.color : "var(--text-muted)" }}>
                        <span>
                          {grid.isCompleted ? `✓ Done` : grid.lastViewed ? `👁️ Viewed` : nodeUnlocked ? "⏳ Available" : "🔒 Locked"}
                        </span>
                        <span>{((grid.durationMinutes || 60) / 60).toFixed(1)}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5" style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                <span>➡️ NEXT PIPELINE UPGRADE:</span>
                <span style={{ color: "var(--text-main)" }}>{nextRowReference ? nextRowReference.title : "🏁 Curriculum Core Mastery Complete"}</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* MANAGE PIPELINE / EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="border w-full max-w-[650px] p-6 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto relative" style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)", color: "var(--text-main)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 bg-transparent border-none text-base cursor-pointer" style={{ color: "var(--text-muted)" }}>✕</button>

            <div className="mb-5">
              <h3 className="text-base font-bold font-mono uppercase tracking-tight m-0">Curriculum Architecture Hub</h3>
              <p className="text-xs m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>Append custom dependencies or shift row pipelines dynamically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleCreateRow} className="flex flex-col gap-3">
                <h4 className="text-xs font-black tracking-wider uppercase m-0 border-b pb-1.5" style={{ borderColor: "var(--border-subtle)" }}>➕ Deploy Phase Row</h4>
                <input type="text" placeholder="Phase Row Title Descriptor" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newRowTitle} onChange={(e) => setNewRowTitle(e.target.value)} required />
                <input type="text" placeholder="Timeline Target (e.g. Week 4)" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newRowTimeline} onChange={(e) => setNewRowTimeline(e.target.value)} />
                <div className="flex justify-between items-center text-xs">
                  <label style={{ color: "var(--text-muted)" }}>Accent Color:</label>
                  <input type="color" className="border-none w-8 h-8 rounded cursor-pointer p-0" value={newRowColor} onChange={(e) => setNewRowColor(e.target.value)} />
                </div>
                <button type="submit" className="text-white text-xs font-mono font-bold py-2 px-4 rounded-lg border cursor-pointer transition-opacity hover:opacity-90 mt-2" style={{ backgroundColor: "var(--accent-color)", borderColor: "var(--accent-color)" }}>Inject Matrix Track Row</button>
              </form>

              <form onSubmit={handleCreateGrid} className="flex flex-col gap-3">
                <h4 className="text-xs font-black tracking-wider uppercase m-0 border-b pb-1.5" style={{ borderColor: "var(--border-subtle)" }}>➕ Inject Subtopic Module</h4>
                <select className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border cursor-pointer" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} required value={targetRowForGrid} onChange={(e) => setTargetRowForGrid(e.target.value)}>
                  <option value="">-- Select Parent Phase Assignment --</option>
                  {currentRows.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                <input type="text" placeholder="Module Subtopic Title" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridTitle} onChange={(e) => setNewGridTitle(e.target.value)} required />
                <input type="text" placeholder="Brief Abstract Summary" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridContents} onChange={(e) => setNewGridContents(e.target.value)} />
                <textarea placeholder="Core Deliverables Target Details..." className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border resize-y min-h-[60px]" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridStudies} onChange={(e) => setNewGridStudies(e.target.value)} />
                <div className="flex justify-between items-center text-xs">
                  <label style={{ color: "var(--text-muted)" }}>Allocation (Minutes):</label>
                  <input type="number" className="border rounded-lg p-1.5 text-xs font-mono w-20 text-center focus:outline-none" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridDuration} onChange={(e) => setNewGridDuration(Number(e.target.value))} />
                </div>
                <button type="submit" className="text-black text-xs font-mono font-bold py-2 px-4 rounded-lg border cursor-pointer transition-opacity hover:opacity-90 mt-2" style={{ backgroundColor: "rgb(16, 185, 129)", borderColor: "rgb(16, 185, 129)" }}>Inject Component Node</button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <h4 className="text-xs font-black tracking-wider text-red-400 uppercase m-0 mb-3">Destructive Actions Zone</h4>
              <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                {currentRows.map((r) => (
                  <div key={r.id} className="flex justify-between items-center p-2 rounded border text-xs" style={{ backgroundColor: "rgba(239, 68, 68, 0.02)", borderColor: "var(--border-subtle)" }}>
                    <span className="truncate pr-4">{r.title} <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>({r.grids.length} child modules)</span></span>
                    <button type="button" onClick={() => handleDeleteRow(r.id)} className="border-none bg-transparent font-bold text-red-400 hover:text-red-300 cursor-pointer text-xs">Drop Row 🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RICH ACTIVE WORKSPACE MODAL HUB */}
      {activeGrid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setActiveGrid(null); setActiveRowId(null); }}>
          <div className="border w-full max-w-[800px] p-6 shadow-2xl rounded-xl relative max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)", color: "var(--text-main)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setActiveGrid(null); setActiveRowId(null); }} className="absolute top-4 right-4 bg-transparent border-none text-base cursor-pointer" style={{ color: "var(--text-muted)" }}>✕</button>

            <div className="mb-4 pr-8">
              <span className="text-[9px] font-mono font-black tracking-widest text-cyan-400 uppercase">Subtopic Module Workspace</span>
              <h3 className="text-lg font-bold uppercase tracking-tight m-0 mt-0.5 flex items-center gap-2">
                <span>{activeGrid.title}</span>
                {activeGrid.isCompleted && <span className="text-emerald-400 text-xs font-mono font-normal">(✓ Verified)</span>}
              </h3>
            </div>

            <div className="flex border-b mb-4 gap-2" style={{ borderColor: "var(--border-subtle)" }}>
              {[
                { id: "overview", label: "📋 Overview" },
                { id: "studies", label: "📚 Core Studies & Resources" },
                { id: "notes", label: "🧠 Notes & Tracking" },
                { id: "code", label: "💻 Code Scratchpad" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className="pb-2 px-3 text-xs font-bold border-b-2 bg-transparent cursor-pointer transition-colors"
                  style={{
                    borderColor: modalTab === tab.id ? "var(--accent-color)" : "transparent",
                    color: modalTab === tab.id ? "var(--text-main)" : "var(--text-muted)"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {modalTab === "overview" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 m-0 mb-1">Abstract & Summary</h5>
                  <p className="text-xs m-0 leading-relaxed text-stone-200">{activeGrid.contents}</p>
                </div>

                {activeGrid.whyImportant && (
                  <div className="p-3 rounded-lg border bg-amber-950/20 border-amber-800/40">
                    <h5 className="text-[10px] font-bold tracking-wider uppercase text-amber-400 m-0 mb-1">💡 Why Important</h5>
                    <p className="text-xs m-0 leading-relaxed text-stone-300">{activeGrid.whyImportant}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 rounded border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)" }}>
                    <span className="text-[10px] text-stone-400 block font-semibold">Allocation Time</span>
                    <span className="text-xs font-mono font-bold mt-0.5 block">{activeGrid.durationMinutes || 60} Minutes ({(((activeGrid.durationMinutes || 60)) / 60).toFixed(1)}h)</span>
                  </div>
                  <div className="p-2.5 rounded border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)" }}>
                    <span className="text-[10px] text-stone-400 block font-semibold">Status / Completion</span>
                    <span className="text-xs font-mono font-bold mt-0.5 block text-cyan-400">{activeGrid.isCompleted ? `Completed (${activeGrid.completedAt?.split(',')[0]})` : activeGrid.status || "In Progress"}</span>
                  </div>
                </div>
              </div>
            )}

            {modalTab === "studies" && (
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-lg border bg-cyan-950/20 border-cyan-800/40">
                  <h5 className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 m-0 mb-1.5">🎯 Core Curriculum Studies</h5>
                  <p className="text-xs m-0 leading-relaxed text-stone-200">{activeGrid.coreStudies}</p>
                </div>

                {activeGrid.resources && activeGrid.resources.length > 0 && (
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 m-0 mb-2">🔗 Recommended Resources</h5>
                    <ul className="m-0 pl-4 text-xs flex flex-col gap-1 text-cyan-400 font-mono">
                      {activeGrid.resources.map((res, i) => (
                        <li key={i}>
                          <a href={res} target="_blank" rel="noreferrer" className="underline hover:text-cyan-300">{res}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {modalTab === "notes" && (
              <div className="flex flex-col gap-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 m-0">Self Assessment & Reflective Notes</h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 block mb-1">Confused Concepts</label>
                    <textarea
                      className="border rounded p-2 text-xs w-full box-border"
                      style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                      rows={2}
                      value={activeGrid.notes?.confused || ""}
                      onChange={(e) => setActiveGrid({ ...activeGrid, notes: { ...(activeGrid.notes || {}), confused: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-stone-400 block mb-1">Key Mistakes / Gotchas</label>
                    <textarea
                      className="border rounded p-2 text-xs w-full box-border"
                      style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                      rows={2}
                      value={activeGrid.notes?.mistakes || ""}
                      onChange={(e) => setActiveGrid({ ...activeGrid, notes: { ...(activeGrid.notes || {}), mistakes: e.target.value } })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-stone-400 block mb-1">Topics To Revisit Later</label>
                  <input
                    type="text"
                    className="border rounded p-2 text-xs w-full box-border"
                    style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                    value={activeGrid.notes?.revisit || ""}
                    onChange={(e) => setActiveGrid({ ...activeGrid, notes: { ...(activeGrid.notes || {}), revisit: e.target.value } })}
                  />
                </div>
              </div>
            )}

            {modalTab === "code" && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">💻 Code Scratchpad</label>
                <textarea
                  className="border rounded-lg p-3 text-xs font-mono focus:outline-none resize-none bg-black/60 text-emerald-400 border-stone-800 w-full box-border"
                  rows={10}
                  placeholder={`# Stash custom computations, code implementations, or notes here...`}
                  value={activeGrid.remarks || ""}
                  onChange={(e) => setActiveGrid({ ...activeGrid, remarks: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-between items-center gap-3 mt-6 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                {!activeGrid.isCompleted ? (
                  <button type="button" onClick={() => handleUpdateGridParameters(true)} className="text-black text-xs font-mono font-bold py-2 px-4 rounded-lg border cursor-pointer" style={{ backgroundColor: "rgb(16, 185, 129)", borderColor: "rgb(16, 185, 129)" }}>
                    ✓ Complete Sprint Node
                  </button>
                ) : (
                  <span className="text-xs font-mono text-emerald-400 font-bold">✓ Sprint Node Marked Completed</span>
                )}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setActiveGrid(null); setActiveRowId(null); }} className="text-xs font-mono font-bold px-3 py-2 rounded-lg border cursor-pointer" style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                  Dismiss
                </button>
                <button type="button" onClick={() => handleUpdateGridParameters(false)} className="text-xs font-mono font-bold px-4 py-2 rounded-lg border cursor-pointer" style={{ backgroundColor: "var(--accent-color)", borderColor: "var(--accent-color)", color: "var(--bg-fallback)" }}>
                  Save Modifications
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RoadmapPage;