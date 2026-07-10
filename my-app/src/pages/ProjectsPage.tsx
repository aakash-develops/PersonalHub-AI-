// src/pages/ProjectsPage.tsx
import React, { useState } from "react";
import DashboardGrid from "../components/common/DashboardGrid";
import "../App.css";

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

  // Tab Filter State
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

  const handleLogTime = (id: string) => {
    const minutes = parseInt(timeInput[id] || "0", 10);
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

    setTimeInput((prev) => ({ ...prev, [id]: "" }));
  };

  // Filter Computation Engine
  const filteredProjects = projectsList.filter((project) => {
    if (activeFilter === "High") return project.priority === "High";
    if (activeFilter === "Ongoing") return project.status === "Ongoing" || !project.status;
    if (activeFilter === "Completed") return project.status === "Completed";
    return true; // "All"
  });

  const getPriorityTheme = (p: "High" | "Medium" | "Low") => {
    if (p === "High") {
      return {
        background: "linear-gradient(135deg, #2a0f14 0%, #150508 100%)",
        border: "2px solid #ff5c75",
        badgeBg: "rgba(255, 92, 117, 0.2)",
        badgeText: "#ff8597",
        glow: "rgba(255, 92, 117, 0.15) 0px 0px 20px"
      };
    }
    if (p === "Medium") {
      return {
        background: "linear-gradient(135deg, #0f1b36 0%, #060d1c 100%)",
        border: "2px solid #4f8cff",
        badgeBg: "rgba(79, 140, 255, 0.2)",
        badgeText: "#82afff",
        glow: "rgba(79, 140, 255, 0.15) 0px 0px 20px"
      };
    }
    return {
      background: "linear-gradient(135deg, #092419 0%, #030f0a 100%)",
      border: "2px solid #1dd1a1",
      badgeBg: "rgba(29, 209, 161, 0.2)",
      badgeText: "#52e4bc",
      glow: "rgba(29, 209, 161, 0.15) 0px 0px 20px"
    };
  };

  return (
    <div className="dashboard-container page-fade-in" style={{ maxWidth: "1000px" }}>
      <div style={{ width: "100%", maxWidth: "850px", marginBottom: "8px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px 0", color: "#ffffff" }}>
          Project Pipeline Execution
        </h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Manage engineering instances, define critical scopes, and catalog developmental metrics.
        </p>
      </div>

      {/* NEW FEATURE: ULTRA SLEEK FILTER SEGMENTATION TABS */}
      <div style={{
        width: "100%",
        maxWidth: "850px",
        display: "flex",
        gap: "8px",
        background: "#0d0d12",
        padding: "6px",
        borderRadius: "8px",
        border: "1px solid #16161c",
        marginTop: "8px"
      }}>
        {(["All", "High", "Ongoing", "Completed"] as FilterType[]).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                flex: 1,
                background: isActive ? "#4f8cff" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {filter} Pipelines
            </button>
          );
        })}
      </div>

      <div style={{ width: "100%", maxWidth: "850px" }}>
        <DashboardGrid>

          {/* DYNAMIC INSTANCE LIST RENDERING FROM ACTIVE FILTER */}
          {filteredProjects.map((project) => {
            const theme = getPriorityTheme(project.priority || "Medium");
            return (
              <div
                key={project.id}
                className="dashboard-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "225px",
                  background: theme.background,
                  border: theme.border,
                  boxShadow: `rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px, ${theme.glow}`
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      background: theme.badgeBg,
                      color: theme.badgeText,
                      border: `1px solid rgba(255,255,255,0.1)`,
                      letterSpacing: "0.5px"
                    }}>
                      {project.priority || "Medium"}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleComplete(project.id); }}
                      style={{
                        background: project.status === "Completed" ? "rgba(29, 209, 161, 0.2)" : "rgba(0,0,0,0.3)",
                        border: project.status === "Completed" ? "1px solid #1dd1a1" : "1px solid rgba(255,255,255,0.15)",
                        color: project.status === "Completed" ? "#1dd1a1" : "#ffffff",
                        fontSize: "11px",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.2s"
                      }}
                    >
                      {project.status === "Completed" ? "✓ Done" : "Mark Done"}
                    </button>
                  </div>

                  <h4 style={{ fontSize: "17px", fontWeight: 700, margin: "4px 0 8px 0", color: "#ffffff", letterSpacing: "0.3px" }}>
                    {project.name}
                  </h4>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>
                    🕒 Accrued Context: <span style={{ color: "#ffffff", fontWeight: 700 }}>{project.minutesTracked || 0} mins</span>
                  </p>
                </div>

                <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px" }}>
                  <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      placeholder="Mins"
                      value={timeInput[project.id] || ""}
                      onChange={(e) => setTimeInput({ ...timeInput, [project.id]: e.target.value })}
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        color: "#ffffff",
                        fontSize: "12px",
                        width: "75px"
                      }}
                    />
                    <button
                      onClick={() => handleLogTime(project.id)}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#ffffff",
                        fontSize: "11px",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 700,
                        flex: 1,
                        transition: "background 0.2s"
                      }}
                    >
                      Log Delta
                    </button>
                  </div>

                  <div style={{
                    fontSize: "10px",
                    textAlign: "right",
                    color: project.status === "Completed" ? "#1dd1a1" : "#ff9f43",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    marginTop: "10px",
                    letterSpacing: "0.5px"
                  }}>
                    ● {project.status === "Completed" ? "Completed" : "Ongoing"}
                  </div>
                </div>

              </div>
            );
          })}

          {/* INITIALIZE BUTTON CARD: Positioned at the very end of the row context */}
          <div
            className="dashboard-card"
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "#08080c",
              border: "2px dashed #223152",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "225px",
              gap: "12px",
              textAlign: "center"
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(79, 140, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4f8cff",
              fontSize: "22px",
              fontWeight: "bold"
            }}>+</div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff" }}>Initialize Instance</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>Deploy new project tracker</div>
            </div>
          </div>

        </DashboardGrid>
      </div>

      {/* PORTAL MODAL WINDOW OVERLAY */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: "18px", margin: "0 0 20px 0", fontWeight: 700, color: "#ffffff" }}>Deploy Project Scope</h3>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Identifier Designation</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Deep Learning Optimizer Engine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label>Execution Priority Stack</label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="Low">Low Priority (Green Layout)</option>
                  <option value="Medium">Medium Priority (Blue Layout)</option>
                  <option value="High">High Priority (Red Layout)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Initialize</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;