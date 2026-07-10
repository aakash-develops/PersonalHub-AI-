import React from "react";
import "./DashboardGrid.css";

type DashboardGridProps = {
  children: React.ReactNode;
};

const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return <div className="dashboard-grid">{children}</div>;
};

export default DashboardGrid;