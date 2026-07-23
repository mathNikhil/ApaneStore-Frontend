import React from 'react';

const ProgressBar = ({ currentStep = 1, totalSteps = 7 }) => {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;