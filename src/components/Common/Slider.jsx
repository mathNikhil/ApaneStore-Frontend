import React from 'react';

const Slider = ({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueLabel,
  unit = '',
  className = '',
}) => {
  // Calculate percentage for the track fill
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        {label && (
          <label className="font-label-md text-[#3c4a3d] text-xs uppercase tracking-wider">
            {label}
          </label>
        )}
        {valueLabel && (
          <span className="bg-[#25D366]/20 text-[#005523] px-3 py-1 rounded-full font-bold text-sm">
            {valueLabel}
          </span>
        )}
      </div>
      
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-transparent absolute z-10"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            outline: 'none',
          }}
        />
        {/* Custom track background */}
        <div className="absolute w-full h-1.5 rounded-lg bg-[#e0e3e6]">
          <div 
            className="h-full rounded-lg bg-[#006d2f] transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-[#556067] font-medium px-1">
        <span>{min}{unit}</span>
        <span>{Math.round((min + max) / 2)}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {/* Custom styles for the slider thumb */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #006d2f;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 20;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.05);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #006d2f;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 20;
        }
        input[type="range"]::-moz-range-track {
          height: 6px;
          background: transparent;
          border: none;
        }
        input[type="range"]:focus {
          outline: none;
        }
        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(0, 109, 47, 0.2);
        }
        input[type="range"]:focus::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(0, 109, 47, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Slider;