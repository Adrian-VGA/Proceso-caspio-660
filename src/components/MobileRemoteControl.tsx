import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Minus, Users, Wifi, WifiOff } from 'lucide-react';
import { SurveyData } from '../types/survey';

interface MobileRemoteControlProps {
  sessionId: string;
  projectNumber: string;
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
  goals: Record<keyof SurveyData, number>;
}

function MobileRemoteControl({ sessionId, projectNumber, surveyData, setSurveyData, goals }: MobileRemoteControlProps) {
  const [isConnected, setIsConnected] = useState(true);

  const groupConfigs = [
    { key: 'G6-8', title: 'G6-8', color: '#ff69b4', surveyType: 'L1 (15 min)' },
    { key: 'G9-11', title: 'G9-11', color: '#ff7f7f', surveyType: 'L2 (30 min)' },
    { key: 'G12-14', title: 'G12-14', color: '#4a90e2', surveyType: 'L2 + SM' },
    { key: 'G15-18', title: 'G15-18', color: '#8e44ad', surveyType: 'L2 + SM' },
    { key: 'G19+', title: 'G19+', color: '#ff8c42', surveyType: 'L2 + SM' },
    { key: 'STAFF', title: 'STAFF', color: '#27ae60', surveyType: 'SM Staff' },
  ];

  const updateCount = (key: keyof SurveyData, increment: boolean) => {
    const newData = {
      ...surveyData,
      [key]: increment 
        ? Math.min(surveyData[key] + 1, goals[key])
        : Math.max(surveyData[key] - 1, 0)
    };
    setSurveyData(newData);
    
    // Sincronizar con la aplicación principal
    try {
      localStorage.setItem(`caspio-remote-${sessionId}-${projectNumber}`, JSON.stringify({ surveyData: newData }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: `caspio-remote-${sessionId}-${projectNumber}`,
        newValue: JSON.stringify({ surveyData: newData })
      }));
    } catch (error) {
      setIsConnected(false);
      setTimeout(() => setIsConnected(true), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4">
      {/* Header */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="text-white" size={24} />
            <div>
              <h1 className="text-lg font-bold text-white">Control Remoto</h1>
              <p className="text-blue-200 text-sm">PROYECTO {projectNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="text-green-400" size={20} />
            ) : (
              <WifiOff className="text-red-400" size={20} />
            )}
            <span className="text-xs text-blue-200">
              {isConnected ? 'Conectado' : 'Reconectando...'}
            </span>
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4 mb-6">
        {groupConfigs
          .filter(config => goals[config.key as keyof SurveyData] > 0)
          .map((config) => {
          const current = surveyData[config.key as keyof SurveyData];
          const goal = goals[config.key as keyof SurveyData];
          const remaining = goal - current;

          return (
            <div key={config.key} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: config.color }}
                  >
                    <Users className="text-white" size={16} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{config.title}</h3>
                    <p className="text-blue-200 text-xs">{config.surveyType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{current}/{goal}</div>
                  <div className="text-orange-300 text-sm">Faltan: {remaining}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateCount(config.key as keyof SurveyData, false)}
                  className="w-12 h-12 bg-red-500/30 hover:bg-red-500/40 text-white rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95"
                  disabled={current <= 0}
                >
                  <Minus size={20} />
                </button>
                
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-white">{current}</div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((current / goal) * 100, 100)}%`,
                        backgroundColor: config.color
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => updateCount(config.key as keyof SurveyData, true)}
                  className="w-12 h-12 bg-green-500/30 hover:bg-green-500/40 text-white rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95"
                  disabled={current >= goal}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="text-center text-blue-200">
        <div className="glass rounded-full px-4 py-2 inline-block">
          <span className="text-xs">2025 By AVG TECH</span>
        </div>
      </footer>
    </div>
  );
}

export default MobileRemoteControl;