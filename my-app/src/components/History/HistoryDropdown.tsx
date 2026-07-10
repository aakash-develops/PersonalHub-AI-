import React from "react";
import { Link } from "react-router-dom";
import "./HistoryDropdown.css";

interface HistoryDropdownProps {
  onClose: () => void;
}

const HistoryDropdown: React.FC<HistoryDropdownProps> = ({ onClose }) => {
  return (
    <div className="history-dropdown-wrapper" onClick={onClose}>
      <Link to="/history/daily" className="dropdown-item">
        <span>📋</span> Daily Tasks Log
      </Link>
      <Link to="/history/projects" className="dropdown-item">
        <span>⚡</span> Project Archives
      </Link>
      <Link to="/history/github" className="dropdown-item">
        <span>💻</span> Commit History
      </Link>
      <Link to="/history/jobs" className="dropdown-item">
        <span>💼</span> Job Applications
      </Link>
      <Link to="/history/finnish" className="dropdown-item">
        <span>🇫🇮</span> Finnish Logs
      </Link>
      <Link to="/history/habits" className="dropdown-item">
        <span>✅</span> Habit History
      </Link>
    </div>
  );
};

export default HistoryDropdown;