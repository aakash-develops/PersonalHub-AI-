// src/pages/RoadmapPage.tsx
import React, { useState } from "react";
import "../App.css";

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

const INITIAL_TAXONOMY_MAP: RoadmapRow[] = [
  {
    id: "row-1",
    title: "Software Systems & Data Engineering",
    timeline: "Weeks 1-2 • Tier 1 Priority",
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
    id: "row-2",
    title: "Mathematical Foundations & Optimization",
    timeline: "Week 3 • Core Dependency",
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
    id: "row-3",
    title: "Predictive Model Engineering",
    timeline: "Weeks 4-6 • Model Training",
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
    title: "Validation & MLOps Ingestion",
    timeline: "Weeks 7-8 • Pipeline Deployment",
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
  const currentRows: RoadmapRow[] = db?.ml_roadmap_matrix || INITIAL_TAXONOMY_MAP;

  // Active UI Workspace Anchors
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [activeGrid, setActiveGrid] = useState<SubtopicGrid | null>(null);
  const [hoveredGridId, setHoveredGridId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Configuration Hub Inputs
  const [newRowTitle, setNewRowTitle] = useState("");
  const [newRowTimeline, setNewRowTimeline] = useState("");
  const [newRowColor, setNewRowColor] = useState("#3b82f6");

  const [targetRowForGrid, setTargetRowForGrid] = useState<string>("");
  const [newGridTitle, setNewGridTitle] = useState("");
  const [newGridContents, setNewGridContents] = useState("");
  const [newGridStudies, setNewGridStudies] = useState("");
  const [newGridDuration, setNewGridDuration] = useState<number>(60);

  // Global Study Target Configurations (Based on Daily Split Planning Metrics)
  const DAILY_STUDY_TARGET_HOURS = 2.5;

  const saveRoadmapToDb = (updatedMatrix: RoadmapRow[]) => {
    setDb((prev: any) => ({
      ...prev,
      ml_roadmap_matrix: updatedMatrix
    }));
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

  // Math Metrics: Calculating Progression States
  const calculateRowProgress = (row: RoadmapRow) => {
    if (row.grids.length === 0) return 0;
    const completedCount = row.grids.filter((g) => g.isCompleted).length;
    return Math.round((completedCount / row.grids.length) * 100);
  };

  const calculateGlobalPageProgress = () => {
    let totalGrids = 0;
    let completedGrids = 0;
    currentRows.forEach((r) => {
      totalGrids += r.grids.length;
      completedGrids += r.grids.filter((g) => g.isCompleted).length;
    });
    if (totalGrids === 0) return 0;
    return Math.round((completedGrids / totalGrids) * 100);
  };

  const calculateRowHourMetrics = (row: RoadmapRow) => {
    let studiedMinutes = 0;
    let leftMinutes = 0;

    row.grids.forEach((g) => {
      if (g.isCompleted) {
        studiedMinutes += g.durationMinutes || 0;
      } else {
        leftMinutes += g.durationMinutes || 0;
      }
    });

    return {
      studiedHours: (studiedMinutes / 60).toFixed(1),
      leftHours: (leftMinutes / 60).toFixed(1)
    };
  };

  // Matrix Modifiers (Forms Execution Actions)
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
    if (!window.confirm("Purge this tactical roadmap row and all its assigned grid subtopics?")) return;
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

  const globalPagePercent = calculateGlobalPageProgress();

  return (
    <div className="dashboard-container page-fade-in" style={{ maxWidth: "1140px", paddingBottom: "120px", position: "relative", paddingTop: "20px" }}>

      {/* 🏅 TOP OVERALL PAGE MASTER TRACK BAR */}
      <div style={{
        width: "100%",
        background: "#08080d",
        border: "1px solid #1a1a26",
        borderRadius: "14px",
        padding: "16px 24px",
        marginBottom: "32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "16px" }}>🏆</span>
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>Overall Curriculum Metrics</h4>
            <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.35)" }}>Target Daily Split Allocation: {DAILY_STUDY_TARGET_HOURS} Hours / Day</p>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: "60%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "6px", fontWeight: 700 }}>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Global Master Metric Progress</span>
            <span style={{ color: "#6366f1" }}>{globalPagePercent}%</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#11111c", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              width: `${globalPagePercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
              boxShadow: "0 0 10px rgba(99,102,241,0.6)",
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 8px 0", color: "#ffffff", letterSpacing: "-0.8px" }}>
            Machine Learning Engineering Roadmap
          </h2>
          <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Sequential tracking grid environment. Commit daily blocks and finalize tracks with active completion handles.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          style={{
            background: "#0d0d14", border: "1px solid #27272a", color: "#a1a1aa",
            padding: "12px 24px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.color = "#ffffff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#a1a1aa"; }}
        >
          ⚙️ Manage Matrix Hub
        </button>
      </div>

      {/* MATRIX FLOW ROW MAP */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
        {currentRows.map((row) => {
          const progressVal = calculateRowProgress(row);
          const { studiedHours, leftHours } = calculateRowHourMetrics(row);

          return (
            <div
              key={row.id}
              style={{
                background: "#0a0a0f", border: "1px solid #171725", borderRadius: "20px",
                padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
              }}
            >
              {/* Row Upper Info Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: "0 0 6px 0" }}>
                    {row.title}
                  </h3>

                  {/* Timeline with Metric Badges (Green for Studied / Red for Left) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                      {row.timeline}
                    </span>
                    <span style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                      ⏱️ {studiedHours} hours studied
                    </span>
                    <span style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                      ⏳ {leftHours} hours left
                    </span>
                  </div>
                </div>

                {/* Progress Alignment Box */}
                <div style={{ width: "220px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "6px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                    <span>Track Completion</span>
                    <span style={{ color: row.color }}>{progressVal}%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "#161622", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      width: `${progressVal}%`, height: "100%",
                      background: row.color, boxShadow: `0 0 8px ${row.color}`,
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>
              </div>

              {/* Subtopic Inner Grids Matrix Stack */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px", marginTop: "4px"
              }}>
                {row.grids.map((grid) => {
                  const isHovered = hoveredGridId === grid.id;

                  let cardBorder = "1px solid #161622";
                  let cardGlow = "0 4px 12px rgba(0,0,0,0.2)";
                  let opacityStyle = "1";
                  let backdropBlur = "none";

                  if (grid.isCompleted) {
                    cardBorder = `1px solid rgba(16, 185, 129, 0.4)`;
                    opacityStyle = "0.75";
                    backdropBlur = "blur(1.5px)";
                  } else if (isHovered) {
                    cardBorder = `1px solid ${row.color}`;
                    cardGlow = `0 0 20px ${row.color}33`;
                  } else if (grid.lastViewed) {
                    cardBorder = `1px solid ${row.color}55`;
                  }

                  return (
                    <div
                      key={grid.id}
                      onClick={() => handleOpenGridWorkspace(row.id, grid)}
                      onMouseEnter={() => setHoveredGridId(grid.id)}
                      onMouseLeave={() => setHoveredGridId(null)}
                      style={{
                        background: "#0e0e16", border: cardBorder, borderRadius: "14px",
                        padding: "20px", cursor: "pointer", boxShadow: cardGlow,
                        opacity: opacityStyle,
                        filter: backdropBlur !== "none" ? backdropBlur : undefined,
                        transform: isHovered && !grid.isCompleted ? "translateY(-4px) scale(1.015)" : "translateY(0) scale(1)",
                        transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        position: "relative"
                      }}
                    >
                      {/* Completion Premium Banner Overlay Graphics */}
                      {grid.isCompleted && (
                        <div style={{ position: "absolute", top: "12px", right: "12px", background: "#10b981", color: "#fff", fontSize: "9px", fontWeight: 900, textTransform: "uppercase", padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.5px" }}>
                          ✓ Completed
                        </div>
                      )}

                      <h5 style={{ margin: "0 0 8px 0", fontSize: "14.5px", fontWeight: 700, color: grid.isCompleted ? "#10b981" : "#ffffff", paddingRight: grid.isCompleted ? "65px" : "0" }}>
                        {grid.title}
                      </h5>

                      <p style={{ margin: "0 0 14px 0", fontSize: "12.5px", color: "rgba(255,255,255,0.38)", lineHeight: "1.45" }}>
                        {grid.contents.length > 90 ? `${grid.contents.substring(0, 90)}...` : grid.contents}
                      </p>

                      {/* Log Analytics Footer Line Status Engine */}
                      {grid.isCompleted ? (
                        <div style={{ fontSize: "10px", fontWeight: 700, fontFamily: "monospace", color: "#10b981" }}>
                          ⭐️ Finished in {(grid.durationMinutes / 60).toFixed(1)}h at {grid.completedAt?.split(",")[1] || grid.completedAt}
                        </div>
                      ) : grid.lastViewed ? (
                        <div style={{ fontSize: "10.5px", fontWeight: 600, fontFamily: "monospace", color: row.color, display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>👁️</span> Reviewed: {grid.lastViewed.split(",")[1] || grid.lastViewed}
                        </div>
                      ) : (
                        <div style={{ fontSize: "10.5px", color: "rgba(255,255,255,0.15)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          ⏳ Unopened Module
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL LAYER 1: TRACK & GRID STRUCTURAL EDITOR */}
      {isEditModalOpen && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }} onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: "800px", width: "92%", background: "#08080f", border: "1px solid #1f1f2e", borderRadius: "24px", padding: "40px", position: "relative" }} onClick={(e) => e.stopPropagation()}>

            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{ position: "absolute", top: "24px", right: "24px", background: "#141420", border: "1px solid #27273a", color: "rgba(255,255,255,0.5)", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
            >
              ✕
            </button>

            <div style={{ marginBottom: "28px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", margin: 0 }}>Structure Configuration Hub</h3>
              <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0 0" }}>Append or remove timeline blocks. Cancel or cross out to exit without mutating.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px", maxHeight: "45vh", overflowY: "auto", paddingRight: "8px" }}>

              {/* Form A: Row Insertion */}
              <form onSubmit={handleCreateRow} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ color: "#ffffff", margin: "0 0 4px 0", fontSize: "14.5px", fontWeight: 800 }}>➕ Deploy New Track Row</h4>
                <input
                  type="text" className="form-input" placeholder="Track Row Title"
                  value={newRowTitle} onChange={(e) => setNewRowTitle(e.target.value)} required
                />
                <input
                  type="text" className="form-input" placeholder="Timeline Segment (e.g. Weeks 1-2)"
                  value={newRowTimeline} onChange={(e) => setNewRowTimeline(e.target.value)}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Accent Spectrum:</label>
                  <input type="color" value={newRowColor} onChange={(e) => setNewRowColor(e.target.value)} style={{ background: "transparent", border: "none", cursor: "pointer" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px", fontSize: "13px" }}>Inject Track Row</button>
              </form>

              {/* Form B: Grid Subtopic Node Insertion */}
              <form onSubmit={handleCreateGrid} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ color: "#ffffff", margin: "0 0 4px 0", fontSize: "14.5px", fontWeight: 800 }}>➕ Inject Grid Subtopic Node</h4>
                <select className="form-input" required value={targetRowForGrid} onChange={(e) => setTargetRowForGrid(e.target.value)} style={{ color: "#fff", background: "#0a0a10" }}>
                  <option value="">-- Target Track Row --</option>
                  {currentRows.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
                <input type="text" className="form-input" placeholder="Subtopic Title" value={newGridTitle} onChange={(e) => setNewGridTitle(e.target.value)} required />
                <input type="text" className="form-input" placeholder="Brief Summary Abstract" value={newGridContents} onChange={(e) => setNewGridContents(e.target.value)} />
                <textarea className="form-input" placeholder="Core Studies Deliverables" value={newGridStudies} onChange={(e) => setNewGridStudies(e.target.value)} style={{ minHeight: "50px", resize: "vertical" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Allocation (Minutes):</label>
                  <input type="number" className="form-input" value={newGridDuration} onChange={(e) => setNewGridDuration(Number(e.target.value))} style={{ maxWidth: "80px" }} />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px", fontSize: "13px", background: "#0f766e", border: "1px solid #14b8a6" }}>Inject Subtopic</button>
              </form>

            </div>

            {/* Row Clear Destruction Matrix Panel */}
            <div style={{ marginTop: "24px", borderTop: "1px solid #161622", paddingTop: "16px" }}>
              <h4 style={{ color: "#ef4444", margin: "0 0 12px 0", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Danger Zone Row Drop</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "120px", overflowY: "auto" }}>
                {currentRows.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d0d14", padding: "8px 14px", borderRadius: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#fff" }}>{r.title} <span style={{ color: "rgba(255,255,255,0.3)" }}>({r.grids.length} nodes)</span></span>
                    <button type="button" onClick={() => handleDeleteRow(r.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px" }}>Drop Track Row 🗑️</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "transparent", border: "1px solid #27273a", color: "#a1a1aa", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                Close Hub
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL LAYER 2: CORE ANALYSIS FOCUS WORKSPACE */}
      {activeGrid && (
        <div className="modal-overlay" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }} onClick={() => { setActiveGrid(null); setActiveRowId(null); }}>
          <div className="modal-content" style={{ maxWidth: "640px", width: "90%", boxShadow: "0 25px 70px rgba(0,0,0,0.85)", border: "1px solid #1e1e2f", borderRadius: "24px", padding: "36px", position: "relative", background: "#08080f" }} onClick={(e) => e.stopPropagation()}>

            <button
              onClick={() => { setActiveGrid(null); setActiveRowId(null); }}
              style={{ position: "absolute", top: "24px", right: "24px", background: "#141420", border: "1px solid #27273a", color: "rgba(255,255,255,0.5)", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
            >
              ✕
            </button>

            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "#3b82f6", letterSpacing: "1px" }}>
                Operational Study Module Target
              </span>
              <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", margin: "6px 0 0 0" }}>
                {activeGrid.title} {activeGrid.isCompleted && <span style={{ color: "#10b981", fontSize: "14px", marginLeft: "10px" }}>(✓ Completed)</span>}
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
              <div>
                <h5 style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 700, margin: "0 0 6px 0", textTransform: "uppercase" }}>Abstract parameters</h5>
                <p style={{ margin: 0, color: "#ffffff", fontSize: "14px", lineHeight: "1.5" }}>{activeGrid.contents}</p>
              </div>

              <div style={{ padding: "18px", background: "#0e0e18", border: "1px solid #1c1c2e", borderRadius: "14px" }}>
                <h5 style={{ color: "#14b8a6", fontSize: "11px", fontWeight: 800, margin: "0 0 8px 0", textTransform: "uppercase" }}>🎯 Core Study Execution Deliverables</h5>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "13.5px", lineHeight: "1.5" }}>{activeGrid.coreStudies}</p>
              </div>
            </div>

            {/* Allocation Box */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid #161622", paddingTop: "18px", marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>Target Allocation Duration (Minutes):</label>
              <input
                type="number" className="form-input"
                disabled={activeGrid.isCompleted}
                value={activeGrid.durationMinutes || 0}
                onChange={(e) => setActiveGrid({ ...activeGrid, durationMinutes: Number(e.target.value) })}
                style={{ maxWidth: "100px", textAlign: "center", fontWeight: "bold", opacity: activeGrid.isCompleted ? 0.5 : 1 }}
              />
            </div>

            {/* Note Remarks Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
              <label style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>✍️ Module Activity Remarks & Notes</label>
              <textarea
                className="form-input" rows={4}
                placeholder="Write custom notes, formulas, or sprint tracking references here..."
                value={activeGrid.remarks || ""}
                onChange={(e) => setActiveGrid({ ...activeGrid, remarks: e.target.value })}
                style={{ padding: "14px", background: "#040408", fontSize: "13.5px", resize: "none" }}
              />
            </div>

            {/* Bottom Form Action Buttons */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                {!activeGrid.isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleUpdateGridParameters(true)}
                    style={{ background: "#065f46", border: "1px solid #059669", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" }}
                  >
                    ✓ Mark As Complete
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => { setActiveGrid(null); setActiveRowId(null); }}
                  style={{ background: "transparent", border: "1px solid #27273a", color: "#a1a1aa", padding: "12px 24px", borderRadius: "10px", fontSize: "13.5px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button type="button" onClick={() => handleUpdateGridParameters(false)} className="btn-primary" style={{ padding: "12px 32px", fontSize: "13.5px", fontWeight: 700, borderRadius: "10px" }}>
                  Commit Changes
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