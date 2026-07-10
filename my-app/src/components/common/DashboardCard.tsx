import React from "react";
import "./DashboardCard.css";

type DashboardCardProps = {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  color?: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  onClick,
  color = "#4f8cff",
}) => {
  return (
    <div
      className="dashboard-card"
      onClick={onClick}
      style={{ borderColor: color }}
    >
      <div className="card-top">
        {icon && <div className="card-icon">{icon}</div>}
        <div className="card-value">{value}</div>
      </div>

      <div className="card-title">{title}</div>

      {subtitle && <div className="card-subtitle">{subtitle}</div>}

      <div className="card-hover">Click to open →</div>
    </div>
  );
};

export default DashboardCard;