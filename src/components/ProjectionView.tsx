import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { SurveyData } from '../types/survey';
import ProgressChart from './ProgressChart';

interface ProjectionViewProps {
  surveyData: SurveyData;
  goals: Record<keyof SurveyData, number>;
  onBack: () => void;
  isStandalone?: boolean;
}

function ProjectionView({ surveyData, goals, onBack, isStandalone = false }: ProjectionViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localSurveyData, setLocalSurveyData] = useState<SurveyData>(surveyData);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for real-time data updates
  useEffect(() => {
    // Update local state when props change
    setLocalSurveyData(surveyData);
  }, [surveyData]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'surveyData' && e.newValue) {
        const newData = JSON.parse(e.newValue);
        setLocalSurveyData(newData);
      }
    };

    const handleCustomUpdate = (e: CustomEvent) => {
      setLocalSurveyData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('surveyDataUpdate', handleCustomUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('surveyDataUpdate', handleCustomUpdate as EventListener);
    };
  }, []);

  const openInNewWindow = () => {
    const projectionUrl = `${window.location.origin}${window.location.pathname}?mode=projection&auth=true`;
    const projectionWindow = window.open(
      projectionUrl, 
      'projection', 
      'width=1920,height=1080,fullscreen=yes,toolbar=no,menubar=no,scrollbars=no'
    );
    
    if (projectionWindow) {
      // Transferir datos a la nueva ventana
      projectionWindow.addEventListener('load', () => {
        projectionWindow.postMessage({
          type: 'INIT_PROJECTION',
          surveyData,
          goals,
          authenticated: true
        }, '*');
      });
    }
  };

  const totalL2SM = surveyData['G9-11'] + surveyData['G12-14'] + surveyData['G15-18'] + surveyData['G19+'];
  const totalL2SMGoal = goals['G9-11'] + goals['G12-14'] + goals['G15-18'] + goals['G19+'];

  const chartConfigs = [
    { key: 'G9-11', title: 'Grupo Etario G9-11', color: '#ff7f7f', surveyType: 'L2 (30 min)' },
    { key: 'G12-14', title: 'Grupo Etario G12-14', color: '#4a90e2', surveyType: 'L2 + SM Jóvenes' },
    { key: 'G15-18', title: 'Grupo Etario G15-18', color: '#8e44ad', surveyType: 'L2 + SM Jóvenes' },
    { key: 'G19+', title: 'Grupo Etario G19+', color: '#ff8c42', surveyType: 'L2 + SM Jóvenes' },
    { key: 'STAFF', title: 'STAFF/LIDERAZGO', color: '#27ae60', surveyType: 'SM Staff' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          {!isStandalone && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
          )}
          
          {isStandalone && <div className="w-32"></div>}
          
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            PROYECCIÓN DE RESULTADOS - CASPIO 660
          </h1>

          {!isStandalone && (
            <button
              onClick={openInNewWindow}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 text-white rounded-lg hover:bg-purple-500/40 transition-all duration-300"
            >
              <ExternalLink size={20} />
              Ventana Externa
            </button>
          )}
          
          {isStandalone && (
            <button
              onClick={() => window.close()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
            >
              <ArrowLeft size={20} />
              Cerrar Ventana
            </button>
          )}
        </div>
      </div>

      {/* Time Display */}
      <div className="glass rounded-2xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <Clock size={32} className="text-blue-300" />
          <div className="text-4xl font-bold text-white">
            {currentTime.toLocaleTimeString('es-ES', { 
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true
            })}
          </div>
          <div className="text-blue-300 text-lg">
            {currentTime.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {chartConfigs.map((config) => (
          <ProgressChart
            key={config.key}
            title={config.title}
            current={localSurveyData[config.key as keyof SurveyData]}
            goal={goals[config.key as keyof SurveyData]}
            color={config.color}
            surveyType={config.surveyType}
          />
        ))}

        {/* Total L2 Y SM Chart */}
        <ProgressChart
          title="Total RESULTADOS L2 Y SM"
          current={localSurveyData['G9-11'] + localSurveyData['G12-14'] + localSurveyData['G15-18'] + localSurveyData['G19+']}
          goal={totalL2SMGoal}
          color="#e74c3c"
          surveyType="Total (Excluye Staff)"
          isTotal={true}
        />
      </div>

      {/* Footer */}
      <footer className="text-center text-blue-200">
        <div className="glass rounded-full px-6 py-3 inline-block">
          2025 By AVG TECH - Sistema de Logística CASPIO 660
        </div>
      </footer>
    </div>
  );
}

export default ProjectionView;