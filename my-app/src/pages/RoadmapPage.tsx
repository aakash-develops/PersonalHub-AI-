import React, { useState } from "react";

interface SubtopicGrid {
  id: string;
  title: string;
  contents: string;
  coreStudies: string;
  durationMinutes: number;
  lastViewed?: string;
  remarks?: string;
  isCompleted?: boolean;
  completedAt?: string;
}

interface RoadmapRow {
  id: string;
  title: string;
  timeline: string;
  color: string;
  grids: SubtopicGrid[];
}

interface RoadmapPageProps {
  db: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
}

const LOGICAL_ORDERED_TAXONOMY: RoadmapRow[] = [
  {
    id: "row-1",
    title: "1. Mathematical Foundations & Optimization",
    timeline: "Week 1 • Essential Core Dependency",
    color: "#a855f7",
    grids: [
      {
        id: "grid-2-1",
        title: "Linear Vector Algebra",
        contents: "Coordinate transformations, coordinate space reflections, factorization layers.",
        coreStudies: "Matrix vector multiplication coordinates, transposes, dot directional bounds, Eigenvalues, Eigenvectors, and Singular Value Decomposition (SVD).",
        durationMinutes: 120,
        remarks: "",
        isCompleted: false
      },
      {
        id: "grid-2-2",
        title: "Differential Calculus & Optimization",
        contents: "Multi-variable rate change functions, error surface minimization setups.",
        coreStudies: "Partial derivatives derivation, calculus chain rule application, Jacobian/Hessian trajectory calculation, and coding Gradient Descent entirely from scratch.",
        durationMinutes: 90,
        remarks: "",
        isCompleted: false
      }
    ]
  },
  {
    id: "row-2",
    title: "2. Software Systems & Data Engineering",
    timeline: "Weeks 2-3 • Tier 1 Execution Pipeline",
    color: "#3b82f6",
    grids: [
      {
        id: "grid-1-1",
        title: "Systems & Algorithmic Complexity",
        contents: "OS virtualization limits, CPU/GPU structures, memory cache locality layouts.",
        coreStudies: "Big O space-time execution bounds. Constructing Arrays, custom Linked Lists, Binary Trees, and directed Graphs from scratch without standard syntax utilities.",
        durationMinutes: 90,
        remarks: "",
        isCompleted: false
      },
      {
        id: "grid-1-2",
        title: "Relational Storage Systems",
        contents: "Advanced Python OOP patterns, exception propagation loops, ACID schema models.",
        coreStudies: "Out-of-memory data generators, typing declarations, multi-table complex JOIN actions, nested common table queries, and B-Tree optimization indices.",
        durationMinutes: 60,
        remarks: "",
        isCompleted: false
      },
      {
        id: "grid-1-3",
        title: "Tabular Engineering Pipelines",
        contents: "Memory-aligned vectorized matrix transformations, multi-index tables.",
        coreStudies: "NumPy broadcasting parameters, axis mutations, Pandas tabular parsing streams, text cleaning schemas, and structural missing parameter resolution arrays.",
        durationMinutes: 90,
        remarks: "",
        isCompleted: false
      }
    ]
  },
  {
    id: "row-3",
    title: "3. Predictive Model Engineering",
    timeline: "Weeks 4-6 • Model Training & Training Frameworks",
    color: "#06b6d4",
    grids: [
      {
        id: "grid-3-1",
        title: "Classical Regressions & Splits",
        contents: "Parametric forecasting, spatial boundary configurations, normalization ranges.",
        coreStudies: "Linear and Logistic Regression equations, target encoding frameworks, Train/Test splitting parameters, and standard Z-score data modifications.",
        durationMinutes: 60,
        remarks: "",
        isCompleted: false
      },
      {
        id: "grid-3-2",
        title: "Supervised Tree Ensembles",
        contents: "Recursive data splits, non-parametric paths, variance minimization models.",
        coreStudies: "Decision Tree generation routines via Gini index optimization, and Random Forest Bootstrap Aggregation (Bagging) weak-estimator systems.",
        durationMinutes: 90,
        remarks: "",
        isCompleted: false
      },
      {
        id: "grid-3-3",
        title: "Unsupervised Clusters & Dimensions",
        contents: "Spatial density parsing, grouping matrices, component consolidation layers.",
        coreStudies: "K-Means centroid adjustment routines, DBSCAN density segmentation, and Principal Component Analysis (PCA) multi-dimensional coordinate drops.",
        durationMinutes: 90,
        remarks: "",
        isCompleted: false
      }
    ]
  },
  {
    id: "row-4",
    title: "4. Validation & MLOps Ingestion",
    timeline: "Weeks 7-8 • Pipeline Deployment & Production",
    color: "#10b981",
    grids: [
      {
        id: "grid-4-1",
        title: "Evaluation Metrics & Diagnostics",
        contents: "Cross-validation matrices, decision boundaries, structural thresholds.",
        coreStudies: "K-Fold evaluation segmenting, Confusion Matrix diagnostics, Precision-Recall tuning curves, F1-Scores, and ROC-AUC curve parsing.",
        durationMinutes: 60,
        remarks: "",
        isCompleted: false
      },
      {
        id: "grid-4-2",
        title: "Production Serving Infrastructure",
        contents: "Async web entry pipelines, virtual container isolations, model lifecycle lines.",
        coreStudies: "FastAPI inference routes, Pydantic data contract rules, multi-stage optimized Docker builds, and experiment tracking logs inside MLflow configurations.",
        durationMinutes: 120,
        remarks: "",
        isCompleted: false
      }
    ]
  }
];

const RoadmapPage: React.FC<RoadmapPageProps> = ({ db, setDb }) => {
  const currentRows: RoadmapRow[] = db?.modules_data?.ml_roadmap_matrix || LOGICAL_ORDERED_TAXONOMY;

  const [dailyTargetHours, setDailyTargetHours] = useState<number>(
    db?.modules_data?.velocity_config?.daily_target_hours || 2.5
  );

  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeGrid, setActiveGrid] = useState<SubtopicGrid | null>(null);
  const [hoveredGridId, setHoveredGridId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false); // Syllabus Dropdown State

  const [scratchpadTab, setScratchpadTab] = useState<"write" | "preview">("write");

  const [newRowTitle, setNewRowTitle] = useState("");
  const [newRowTimeline, setNewRowTimeline] = useState("");
  const [newRowColor, setNewRowColor] = useState("#3b82f6");

  const [targetRowForGrid, setTargetRowForGrid] = useState<string>("");
  const [newGridTitle, setNewGridTitle] = useState("");
  const [newGridContents, setNewGridContents] = useState("");
  const [newGridStudies, setNewGridStudies] = useState("");
  const [newGridDuration, setNewGridDuration] = useState<number>(60);

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

  const calculateRowProgress = (row: RoadmapRow) => {
    if (row.grids.length === 0) return 0;
    const completedCount = row.grids.filter((g) => g.isCompleted).length;
    return Math.round((completedCount / row.grids.length) * 100);
  };

  const isRowUnlocked = (rowIndex: number): boolean => {
    if (rowIndex === 0) return true;
    const stepPrerequisiteRow = currentRows[rowIndex - 1];
    return calculateRowProgress(stepPrerequisiteRow) === 100;
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
    setScratchpadTab("write");

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
      isCompleted: false
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
    <div className="w-full max-w-[1000px] mx-auto p-4 md:p-6 box-border select-none" style={{ color: "var(--text-main)" }}>

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

        {/* VARIABLE REALTIME VELOCITY FORECASTER */}
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

      {/* SYLLABUS DIRECTORY SYSTEM DROPDOWN ACCORDING TO CATEGORIES */}
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
                        {grid.isCompleted ? `Completed At: ${grid.completedAt?.split(',')[0]}` : `${(grid.durationMinutes / 60).toFixed(1)}h required`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPONENT CONTENT CONTROL HEADER */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight m-0 uppercase" style={{ fontFamily: "var(--font-display)" }}>Machine Learning Engineering Roadmap</h2>
          <p className="text-xs md:text-sm m-0 mt-1" style={{ color: "var(--text-muted)" }}>
            Sequential dependency architecture. Detailed curiosity exploration allowed; Completion locks enforce track order.
          </p>
        </div>
        <button onClick={() => setIsEditModalOpen(true)} className="border-none rounded-lg py-2 px-3.5 text-xs font-semibold cursor-pointer transition-all shrink-0" style={{ backgroundColor: "var(--accent-color)", color: "var(--bg-fallback)" }}>
          ⚙️ Manage Pipeline
        </button>
      </div>

      {/* ORDER-PRIORITIZED MATRIX FLOW */}
      <div className="flex flex-col gap-6">
        {currentRows.map((row, rowIndex) => {
          const progressVal = calculateRowProgress(row);
          const { studiedHours, leftHours } = calculateRowHourMetrics(row);
          const nextRowReference = currentRows[rowIndex + 1];
          const unlocked = isRowUnlocked(rowIndex);

          return (
            <div
              key={row.id}
              className="rounded-xl border p-5 backdrop-blur-md transition-all relative overflow-hidden"
              style={{
                backgroundColor: "var(--bg-glass)",
                borderColor: "var(--border-glass)",
                opacity: unlocked ? 1 : 0.6,
                filter: unlocked ? "none" : "grayscale(20%)"
              }}
            >
              {!unlocked && (
                <div className="absolute top-2 right-3 z-10 flex items-center gap-1 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-md">
                  🔒 Gated: Complete prior tiers to check off
                </div>
              )}

              {/* Row Banner Metadata Information */}
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
                    <span style={{ color: "var(--text-muted)" }}>Phase Completion Metrics</span>
                    <span style={{ color: row.color }}>{progressVal}%</span>
                  </div>
                  <div className="telemetry-bar-bg h-1.5 w-full rounded overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
                    <div className="h-full" style={{ width: `${progressVal}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              </div>

              {/* Grid Subtopics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {row.grids.map((grid) => {
                  const isHovered = hoveredGridId === grid.id;
                  let cardStyles: React.CSSProperties = {
                    backgroundColor: "var(--pill-bg)",
                    borderColor: "var(--border-subtle)",
                    cursor: "pointer" // Allowed curiosity exploration clicking anywhere anytime
                  };

                  if (grid.isCompleted) {
                    cardStyles.backgroundColor = "rgba(16, 185, 129, 0.05)";
                    cardStyles.borderColor = "rgba(16, 185, 129, 0.4)";
                  } else if (isHovered) {
                    cardStyles.borderColor = row.color;
                  }

                  return (
                    <div
                      key={grid.id}
                      onClick={() => handleOpenGridWorkspace(row.id, grid)}
                      onMouseEnter={() => setHoveredGridId(grid.id)}
                      onMouseLeave={() => setHoveredGridId(null)}
                      className="rounded-xl border p-4 flex flex-col justify-between min-h-[160px] transition-all duration-200 relative overflow-hidden"
                      style={cardStyles}
                    >
                      {grid.isCompleted && (
                        <div className="absolute top-0 right-0 text-[9px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-bl-lg">✓ Completed</div>
                      )}

                      <div>
                        <h5 className="text-sm font-bold m-0 mb-1.5 truncate pr-8" style={{ color: "var(--text-main)" }}>{grid.title}</h5>
                        <p className="text-xs m-0 line-clamp-3" style={{ color: "var(--text-muted)" }}>{grid.contents}</p>
                      </div>

                      <div className="text-[10px] font-medium font-mono pt-3 mt-3 border-t" style={{ borderColor: "var(--border-subtle)", color: grid.isCompleted ? "#34d399" : grid.lastViewed ? row.color : "var(--text-muted)" }}>
                        {grid.isCompleted ? `✓ Read out: ${(grid.durationMinutes / 60).toFixed(1)}h` : grid.lastViewed ? `👁️ Active (${grid.lastViewed.split(',')[0]})` : "⏳ Unexplored Node"}
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

      {/* STRUCTURAL ARCHITECT MODAL HUB */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div className="border w-full max-w-[650px] p-6 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto relative" style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)", color: "var(--text-main)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 bg-transparent border-none text-base cursor-pointer" style={{ color: "var(--text-muted)" }}>✕</button>

            <div className="mb-5">
              <h3 className="text-base font-bold font-mono uppercase tracking-tight m-0">Curriculum Architecture Hub</h3>
              <p className="text-xs m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>Append dependencies or shift row pipelines directly into the runtime matrix.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleCreateRow} className="flex flex-col gap-3">
                <h4 className="text-xs font-black tracking-wider uppercase m-0 border-b pb-1.5" style={{ borderColor: "var(--border-subtle)" }}>➕ Deploy Phase Component Row</h4>
                <input type="text" placeholder="Phase Row Title Descriptor" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newRowTitle} onChange={(e) => setNewRowTitle(e.target.value)} required />
                <input type="text" placeholder="Timeline Block Target (e.g. Week 4)" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newRowTimeline} onChange={(e) => setNewRowTimeline(e.target.value)} />
                <div className="flex justify-between items-center text-xs">
  <label style={{ color: "var(--text-muted)" }}>Highlighter Accent:</label>
  <input
    type="color"
    className="border-none w-8 h-8 rounded cursor-pointer p-0"
    value={newRowColor}
    onChange={(e) => setNewRowColor(e.target.value)}
  />
</div>
                <button type="submit" className="text-white text-xs font-mono font-bold py-2 px-4 rounded-lg border cursor-pointer transition-opacity hover:opacity-90 mt-2" style={{ backgroundColor: "var(--accent-color)", borderColor: "var(--accent-color)" }}>Inject Matrix Track Row</button>
              </form>

              <form onSubmit={handleCreateGrid} className="flex flex-col gap-3">
                <h4 className="text-xs font-black tracking-wider uppercase m-0 border-b pb-1.5" style={{ borderColor: "var(--border-subtle)" }}>➕ Inject Subtopic Core Segment Module</h4>
                <select className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border cursor-pointer" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} required value={targetRowForGrid} onChange={(e) => setTargetRowForGrid(e.target.value)}>
                  <option value="">-- Target Prerequisite Row Assignment --</option>
                  {currentRows.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                <input type="text" placeholder="Module Subtopic Title" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridTitle} onChange={(e) => setNewGridTitle(e.target.value)} required />
                <input type="text" placeholder="Brief Abstract Summary" className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridContents} onChange={(e) => setNewGridContents(e.target.value)} />
                <textarea placeholder="Core Deliverables Target Details..." className="border rounded-lg p-2.5 text-xs focus:outline-none w-full box-border resize-y min-h-[60px]" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridStudies} onChange={(e) => setNewGridStudies(e.target.value)} />
                <div className="flex justify-between items-center text-xs">
                  <label style={{ color: "var(--text-muted)" }}>Allocation (Minutes):</label>
                  <input type="number" className="border rounded-lg p-1.5 text-xs font-mono w-20 text-center focus:outline-none" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }} value={newGridDuration} onChange={(e) => setNewGridDuration(Number(e.target.value))} />
                </div>
                <button type="submit" className="text-black text-xs font-mono font-bold py-2 px-4 rounded-lg border cursor-pointer transition-opacity hover:opacity-90 mt-2" style={{ backgroundColor: "rgb(16, 185, 129)", borderColor: "rgb(16, 185, 129)" }}>Inject Component Node Module</button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <h4 className="text-xs font-black tracking-wider text-red-400 uppercase m-0 mb-3">Destructive Matrix Modifications Zone</h4>
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

      {/* ACTIVE WORKSPACE DRILLDOWN HUB */}
      {activeGrid && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setActiveGrid(null); setActiveRowId(null); }}>
          <div className="border w-full max-w-[750px] p-6 shadow-2xl rounded-xl relative" style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)", color: "var(--text-main)" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setActiveGrid(null); setActiveRowId(null); }} className="absolute top-4 right-4 bg-transparent border-none text-base cursor-pointer" style={{ color: "var(--text-muted)" }}>✕</button>

            <div className="mb-4">
              <span className="text-[9px] font-mono font-black tracking-widest text-cyan-400 uppercase">Active Workspace Context Target Frame</span>
              <h3 className="text-base font-bold uppercase tracking-tight m-0 mt-1 truncate pr-8">
                {activeGrid.title} {activeGrid.isCompleted && <span className="text-emerald-400 lowercase text-xs">(✓ Core Block Verified)</span>}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
              <div className="md:col-span-2 flex flex-col gap-3.5">
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider m-0 mb-1" style={{ color: "var(--text-muted)" }}>Abstract Parameters</h5>
                  <p className="text-xs m-0 leading-relaxed">{activeGrid.contents}</p>
                </div>

                <div className="p-3.5 rounded-lg border" style={{ backgroundColor: "rgba(34, 211, 238, 0.02)", borderColor: "rgba(34, 211, 238, 0.2)" }}>
                  <h5 className="text-[10px] font-bold tracking-wider uppercase text-cyan-400 m-0 mb-1.5">🎯 Task Deliverables</h5>
                  <p className="text-xs m-0 leading-relaxed" style={{ color: "var(--text-main)" }}>{activeGrid.coreStudies}</p>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <label className="font-semibold" style={{ color: "var(--text-muted)" }}>Time Bound Allocation:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      className="border rounded-lg p-1 text-xs font-mono w-16 text-center focus:outline-none"
                      style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                      disabled={activeGrid.isCompleted}
                      value={activeGrid.durationMinutes || 0}
                      onChange={(e) => setActiveGrid({ ...activeGrid, durationMinutes: Number(e.target.value) })}
                    />
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>min</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3 border rounded-xl p-3 flex flex-col gap-2" style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)" }}>
                <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
                  <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>💻 Architecture Scratchpad</label>
                  <div className="flex border rounded overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
                    <button
                      type="button"
                      className="text-[10px] font-bold px-2.5 py-1 border-none cursor-pointer"
                      style={{ backgroundColor: scratchpadTab === "write" ? "var(--accent-color)" : "transparent", color: scratchpadTab === "write" ? "black" : "var(--text-main)" }}
                      onClick={() => setScratchpadTab("write")}
                    >
                      Write Code/Notes
                    </button>
                    <button
                      type="button"
                      className="text-[10px] font-bold px-2.5 py-1 border-none cursor-pointer"
                      style={{ backgroundColor: scratchpadTab === "preview" ? "var(--accent-color)" : "transparent", color: scratchpadTab === "preview" ? "black" : "var(--text-main)" }}
                      onClick={() => setScratchpadTab("preview")}
                    >
                      Plaintext Preview
                    </button>
                  </div>
                </div>

                {scratchpadTab === "write" ? (
                  <textarea
                    className="border rounded-lg p-2 text-xs font-mono focus:outline-none resize-none bg-black/40 text-emerald-400 border-none w-full box-border"
                    rows={8}
                    placeholder={`# Stash calculations or algorithm execution matrices here...\ndef custom_gradient_descent():\n    # Implement mathematical trajectory calculations`}
                    value={activeGrid.remarks || ""}
                    onChange={(e) => setActiveGrid({ ...activeGrid, remarks: e.target.value })}
                  />
                ) : (
                  <div className="text-xs p-2 rounded bg-black/20 font-sans text-stone-300 min-h-[148px] max-h-[148px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                    {activeGrid.remarks ? activeGrid.remarks : <span className="italic text-stone-500">Scratchpad context layer remains unwritten.</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions Control Cluster */}
            <div className="flex justify-between gap-3 mt-5 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                {!activeGrid.isCompleted && (
                  isRowUnlocked(currentRows.findIndex(r => r.id === activeRowId)) ? (
                    <button type="button" onClick={() => handleUpdateGridParameters(true)} className="text-black text-xs font-mono font-bold py-2 px-3 rounded-lg border cursor-pointer" style={{ backgroundColor: "rgb(16, 185, 129)", borderColor: "rgb(16, 185, 129)" }}>
                      ✓ Complete Sprint Node
                    </button>
                  ) : (
                    <div className="text-[11px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-2 rounded-lg">
                      🔒 Gated: Finish prerequisite completion blocks above to check off this node
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setActiveGrid(null); setActiveRowId(null); }} className="text-xs font-mono font-bold px-3 py-2 rounded-lg border cursor-pointer" style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}>
                  Dismiss
                </button>
                <button type="button" onClick={() => handleUpdateGridParameters(false)} className="text-xs font-mono font-bold px-4 py-2 rounded-lg border cursor-pointer" style={{ backgroundColor: "var(--accent-color)", borderColor: "var(--accent-color)", color: "var(--bg-fallback)" }}>
                  Commit Modifications
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