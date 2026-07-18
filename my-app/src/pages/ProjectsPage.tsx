// src/pages/ProjectsPage.tsx
import React, { useState } from "react";
import DashboardGrid from "../components/common/DashboardGrid";

interface ProjectItem {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  status: "Ongoing" | "Completed";
  minutesTracked: number;
}

interface ProjectsPageProps {
  db: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
}

type FilterType = "All" | "High" | "Ongoing" | "Completed";

const ProjectsPage: React.FC<ProjectsPageProps> = ({ db, setDb }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [timeInput, setTimeInput] = useState<{ [key: string]: string }>({});
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const projectsList: ProjectItem[] = db?.modules_data?.projects || [];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: ProjectItem = {
      id: Date.now().toString(),
      name: name.trim(),
      priority,
      status: "Ongoing",
      minutesTracked: 0,
    };

    setDb((prev: any) => ({
      ...prev,
      modules_data: {
        ...(prev?.modules_data || {}),
        projects: [...(prev?.modules_data?.projects || []), newProject]
      }
    }));

    setName("");
    setPriority("Medium");
    setIsModalOpen(false);
  };

  const handleToggleComplete = (id: string) => {
    setDb((prev: any) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        projects: prev.modules_data.projects.map((p: ProjectItem) =>
          p.id === id ? { ...p, status: p.status === "Ongoing" ? "Completed" : "Ongoing" } : p
        )
      }
    }));
  };

  const handleLogTime = (id: string, customMinutes?: number) => {
    const minutes = customMinutes ?? parseInt(timeInput[id] || "0", 10);
    if (isNaN(minutes) || minutes <= 0) return;

    setDb((prev: any) => ({
      ...prev,
      modules_data: {
        ...prev.modules_data,
        projects: prev.modules_data.projects.map((p: ProjectItem) =>
          p.id === id ? { ...p, minutesTracked: (p.minutesTracked || 0) + minutes } : p
        )
      }
    }));

    if (!customMinutes) {
      setTimeInput((prev) => ({ ...prev, [id]: "" }));
    }
  };

  // 1. FILTER COMPUTATION ENGINE
  const filteredProjects = projectsList.filter((project) => {
    if (activeFilter === "High") return project.priority === "High";
    if (activeFilter === "Ongoing") return project.status === "Ongoing" || !project.status;
    if (activeFilter === "Completed") return project.status === "Completed";
    return true;
  });

  // 2. SMART PRIORITY-BASED SORTING ENGINE
  // Ongoing drops by High -> Medium -> Low priority scale. Completed is pushed to the absolute bottom.
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.status === "Completed" && b.status !== "Completed") return 1;
    if (a.status !== "Completed" && b.status === "Completed") return -1;

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };
    return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
  });

  const getPriorityThemeClasses = (p: "High" | "Medium" | "Low") => {
    if (p === "High") {
      return {
        cardBg: "bg-gradient-to-br from-red-950/20 to-black/40 backdrop-blur-md",
        border: "border-red-500/40 focus-within:border-red-500",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        glow: "shadow-[0_0_20px_rgba(239,68,68,0.08)]"
      };
    }
    if (p === "Medium") {
      return {
        cardBg: "bg-gradient-to-br from-blue-950/20 to-black/40 backdrop-blur-md",
        border: "border-blue-500/40 focus-within:border-blue-500",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.08)]"
      };
    }
    return {
      cardBg: "bg-gradient-to-br from-emerald-950/20 to-black/40 backdrop-blur-md",
      border: "border-emerald-500/40 focus-within:border-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]"
    };
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 md:p-6 box-border page-fade-in select-none" style={{ color: "var(--text-main)" }}>

      {/* Title Header */}
      <div className="w-full max-w-[850px] mb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight m-0 uppercase" style={{ fontFamily: "var(--font-display)" }}>
          Project Pipeline Execution
        </h2>
        <p className="text-xs md:text-sm m-0 mt-1" style={{ color: "var(--text-muted)" }}>
          Manage engineering instances, define critical scopes, and catalog developmental metrics.
        </p>
      </div>

      {/* ULTRA SLEEK FILTER SEGMENTATION TABS */}
      <div className="w-full max-w-[850px] flex gap-2 p-1.5 rounded-xl border mt-4 mb-6" style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-glass)" }}>
        {(["All", "High", "Ongoing", "Completed"] as FilterType[]).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="flex-1 border-none rounded-lg py-2 px-4 text-xs font-semibold cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: isActive ? "var(--accent-color)" : "transparent",
                color: isActive ? "var(--bg-fallback)" : "var(--text-muted)",
              }}
            >
              {filter} Pipelines
            </button>
          );
        })}
      </div>

      {/* Grid Canvas */}
      <div className="w-full max-w-[850px]">
        <DashboardGrid>

          {/* DYNAMIC INSTANCE LIST RENDERING */}
          {sortedProjects.map((project) => {
            const ui = getPriorityThemeClasses(project.priority || "Medium");
            const isCompleted = project.status === "Completed";

            return (
              <div
                key={project.id}
                className={`rounded-xl border p-5 flex flex-col justify-between min-h-[250px] transition-all duration-300 ${ui.cardBg} ${ui.border} ${ui.glow}`}
                style={{ boxShadow: "var(--shadow-premium)" }}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border ${ui.badge}`}>
                      {project.priority || "Medium"}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleComplete(project.id); }}
                      className="text-[11px] font-bold py-1 px-2.5 rounded-md border cursor-pointer transition-colors duration-200"
                      style={{
                        backgroundColor: isCompleted ? "rgba(16, 185, 129, 0.15)" : "var(--pill-bg)",
                        borderColor: isCompleted ? "rgb(16, 185, 129)" : "var(--border-subtle)",
                        color: isCompleted ? "rgb(52, 211, 153)" : "var(--text-main)"
                      }}
                    >
                      {isCompleted ? "✓ Done" : "Mark Done"}
                    </button>
                  </div>

                  <h4 className="text-base font-bold tracking-wide m-0 mb-2 truncate" style={{ color: "var(--text-main)" }}>
                    {project.name}
                  </h4>
                  <p className="text-xs font-medium m-0" style={{ color: "var(--text-muted)" }}>
                    🕒 Accrued Context: <span className="font-bold font-mono" style={{ color: "var(--text-main)" }}>{project.minutesTracked || 0} mins</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--border-glass)" }}>

                  {/* 3. QUICK LOG PRESET BUTTONS */}
                  <div className="flex gap-1 mb-2">
                    {["45", "60", "90"].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleLogTime(project.id, parseInt(mins, 10))}
                        className="text-[10px] font-mono font-bold border rounded px-1.5 py-0.5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      placeholder="Mins"
                      value={timeInput[project.id] || ""}
                      onChange={(e) => setTimeInput({ ...timeInput, [project.id]: e.target.value })}
                      className="border rounded-lg px-3 py-1.5 text-xs font-mono w-20 focus:outline-none"
                      style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                    />
                    <button
                      onClick={() => handleLogTime(project.id)}
                      className="text-xs font-bold py-1.5 px-3 rounded-lg border cursor-pointer flex-1 transition-all duration-200"
                      style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--card-bg-hover)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--pill-bg)"}
                    >
                      Log Delta
                    </button>
                  </div>

                  <div className="text-[10px] font-black tracking-wider text-right uppercase mt-3">
                    <span style={{ color: isCompleted ? "rgb(52, 211, 153)" : "var(--secondary-accent)" }}>
                      ● {isCompleted ? "Completed" : "Ongoing"}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}

          {/* INITIALIZE BUTTON CARD */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl border-2 border-dashed p-5 flex flex-col items-center justify-center min-h-[250px] gap-3 text-center cursor-pointer transition-all duration-300"
            style={{ backgroundColor: "var(--bg-glass)", borderColor: "var(--border-subtle)" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--secondary-accent)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-subtle)"}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold border transition-colors duration-200"
                 style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-glass)", color: "var(--secondary-accent)" }}>
              +
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-main)" }}>Initialize Instance</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Deploy new project tracker</div>
            </div>
          </div>

        </DashboardGrid>
      </div>

      {/* PORTAL MODAL WINDOW OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div
            className="border w-full max-w-[440px] p-6 shadow-2xl rounded-xl"
            style={{ backgroundColor: "var(--bg-fallback)", borderColor: "var(--border-glass)", color: "var(--text-main)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold font-mono uppercase tracking-tight m-0 mb-5">Deploy Project Scope</h3>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Identifier Designation</label>
                <input
                  type="text"
                  className="border rounded-lg p-2.5 text-xs focus:outline-none"
                  style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                  placeholder="e.g., Deep Learning Optimizer Engine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Execution Priority Stack</label>
                <select
                  className="border rounded-lg p-2.5 text-xs focus:outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--pill-bg)", borderColor: "var(--border-subtle)", color: "var(--text-main)" }}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="text-xs font-mono font-bold px-4 py-2 rounded-lg border cursor-pointer"
                  style={{ backgroundColor: "transparent", borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white text-xs font-mono font-bold px-5 py-2 rounded-lg border shadow-sm cursor-pointer transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--accent-color)", borderColor: "var(--accent-color)" }}
                >
                  Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;