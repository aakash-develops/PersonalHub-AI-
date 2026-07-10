// src/components/common/CircularProgress.tsx
import React from "react";
import "./CircularProgress.css";

type CircularProgressProps = {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  color?: string;
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 140,
  strokeWidth = 12,
  label,
  subLabel,
  color = "#4f8cff",
}) => {
  const percentage = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);
  const displayPercentage = Math.round(percentage * 100);

  // Convert to guaranteed number to bypass left-hand side arithmetic warnings
  const maxLabelWidth = Number(size) - 20;

  return (
    <div className="circle-wrapper" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      <div className="circle-content" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textAlign: 'center' }}>
        <div className="circle-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
          {displayPercentage}%
        </div>
        {label && (
          <div className="circle-label" style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginTop: '4px',
            maxWidth: `${maxLabelWidth}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {label}
          </div>
        )}
        {subLabel && <div className="circle-sublabel" style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>{subLabel}</div>}
      </div>
    </div>
  );
};

export default CircularProgress;