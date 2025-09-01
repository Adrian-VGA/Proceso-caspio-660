import React from 'react';
import { TrendingUp, Clock, Users } from 'lucide-react';

interface ProgressChartProps {
  title: string;
  current: number;
  goal: number;
  color: string;
  surveyType: string;
  isTotal?: boolean;
}

function ProgressChart({ title, current, goal, color, surveyType, isTotal = false }: ProgressChartProps) {
  const percentage = (current / goal) * 100;
  const remaining = goal - current;
  const isCompleted = current >= goal;

  return (
    <div className={`glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 ${isCompleted ? 'ring-2 ring-green-400' : ''}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg relative"
          style={{ backgroundColor: color }}
        >
          {isTotal ? <TrendingUp className="text-white" size={28} /> : <Users className="text-white" size={28} />}
          {isCompleted && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-blue-200 text-sm">{surveyType}</p>
      </div>

      {/* Main Content - Side by side layout */}
      <div className="flex items-center justify-between gap-6">
        {/* Progress Circle - Larger */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${percentage}, 100`}
              className="transition-all duration-1000 ease-out"
              style={{ filter: isCompleted ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))' : 'none' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{current}</div>
              <div className="text-blue-200 text-sm">/ {goal}</div>
            </div>
          </div>
        </div>

        {/* Stats - Larger numbers on the side */}
        <div className="flex-1 space-y-3">
          <div className="text-center p-4 bg-white/10 rounded-xl">
            <div className={`text-4xl font-bold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
              {percentage.toFixed(1)}%
            </div>
            <div className="text-blue-200 text-sm">Completado</div>
          </div>
          <div className="text-center p-4 bg-white/10 rounded-xl">
            <div className={`text-4xl font-bold ${remaining === 0 ? 'text-green-400' : 'text-orange-300'}`}>
              {remaining}
            </div>
            <div className="text-blue-200 text-sm">Faltan</div>
          </div>
        </div>
      </div>

      {/* Survey Type Info */}
      {!isTotal && (
        <div className="mt-4 flex items-center justify-center p-2 bg-white/5 rounded-lg">
          <Clock size={16} className="text-blue-300 mr-2" />
          <span className="text-blue-200 text-sm">{surveyType}</span>
        </div>
      )}
    </div>
  );
}

export default ProgressChart;