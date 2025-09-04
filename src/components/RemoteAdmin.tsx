import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Wifi, Users, Plus, Minus, Save, QrCode } from 'lucide-react';
import { SurveyData } from '../types/survey';
import QRCodeGenerator from './QRCodeGenerator';

interface RemoteAdminProps {
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
  goals: Record<keyof SurveyData, number>;
  currentUser: any;
  onBack: () => void;
}

function RemoteAdmin({ surveyData, setSurveyData, goals, currentUser, onBack }: RemoteAdminProps) {
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [tempData, setTempData] = useState<SurveyData>({ ...surveyData });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const remoteUrl = `${window.location.origin}${window.location.pathname}?mode=remote&session=${sessionId}&project=${currentUser?.username}`;

  useEffect(() => {
    // Simular conexiones remotas (en producción usarías WebSockets)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `caspio-remote-${sessionId}-${currentUser?.username}`) {
        const remoteData = JSON.parse(e.newValue || '{}');
        if (remoteData.surveyData) {
          setTempData(remoteData.surveyData);
          setSurveyData(remoteData.surveyData);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [sessionId, setSurveyData, currentUser]);

  const groupConfigs = [
    { 
      key: 'G6-8', 
      title: 'Grupo Etario G6-8', 
      color: 'from-pink-400 to-pink-500',
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-500/30',
      surveyType: 'L1 (15 minutos)',
      description: 'Menores de 9 años'
    },
    { 
      key: 'G9-11', 
      title: 'Grupo Etario G9-11', 
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      surveyType: 'L2 (30 minutos)',
      description: '9 a 11 años'
    },
    { 
      key: 'G12-14', 
      title: 'Grupo Etario G12-14', 
      color: 'from-blue-400 to-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      surveyType: 'L2 + SM Jóvenes',
      description: '12 a 14 años'
    },
    { 
      key: 'G15-18', 
      title: 'Grupo Etario G15-18', 
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      surveyType: 'L2 + SM Jóvenes',
      description: '15 a 18 años'
    },
    { 
      key: 'G19+', 
      title: 'Grupo Etario G19+', 
      color: 'from-orange-400 to-orange-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      surveyType: 'L2 + SM Jóvenes',
      description: '19 a 22 años'
    },
    { 
      key: 'STAFF', 
      title: 'STAFF/LIDERAZGO', 
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      surveyType: 'SM Staff',
      description: 'Personal y Liderazgo'
    }
  ];

  const updateCount = (key: keyof SurveyData, increment: boolean) => {
    const newData = {
      ...tempData,
      [key]: increment 
        ? Math.min(tempData[key] + 1, goals[key])
        : Math.max(tempData[key] - 1, 0)
    };
    setTempData(newData);
    setSurveyData(newData);
    
    // Sincronizar con dispositivos remotos
    localStorage.setItem(`caspio-remote-${sessionId}-${currentUser?.username}`, JSON.stringify({ surveyData: newData }));
  };

  const setDirectValue = (key: keyof SurveyData, value: string) => {
    const numValue = parseInt(value) || 0;
    const newData = {
      ...tempData,
      [key]: Math.min(Math.max(numValue, 0), goals[key])
    };
    setTempData(newData);
    setSurveyData(newData);
    
    // Sincronizar con dispositivos remotos
    localStorage.setItem(`caspio-remote-${sessionId}-${currentUser?.username}`, JSON.stringify({ surveyData: newData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 p-4">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <h1 className="text-2xl font-bold text-white text-center flex-1">
            <Smartphone className="inline mr-3" size={28} />
            ADMINISTRACIÓN REMOTA - PROYECTO {currentUser?.projectNumber}
          </h1>

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
          >
            <QrCode size={20} />
            {showQR ? 'Ocultar QR' : 'Mostrar QR'}
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      {showQR && (
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              <Wifi className="inline mr-2" size={24} />
              Acceso Remoto
            </h3>
            <p className="text-blue-200 mb-6">
              Escanea este código QR para administrar las encuestas desde tu dispositivo móvil
            </p>
            <QRCodeGenerator url={remoteUrl} />
            <div className="mt-4 p-4 bg-white/10 rounded-xl">
              <p className="text-blue-200 text-sm mb-2">URL de acceso directo:</p>
              <code className="text-green-300 text-xs break-all">{remoteUrl}</code>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-green-300">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Sesión activa - Proyecto {currentUser?.projectNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="glass rounded-xl p-4 mb-6 bg-green-500/20 border border-green-500/30">
          <p className="text-green-200 text-center font-semibold">
            ✅ Datos sincronizados exitosamente
          </p>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {groupConfigs
          .filter(config => goals[config.key as keyof SurveyData] > 0)
          .map((config) => {
          const current = tempData[config.key as keyof SurveyData];
          const goal = goals[config.key as keyof SurveyData];
          const remaining = goal - current;
          const percentage = (current / goal) * 100;

          return (
            <div key={config.key} className="glass rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className={`bg-gradient-to-br ${config.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
                <p className="text-blue-200 text-sm mb-1">{config.description}</p>
                <p className="text-blue-300 text-xs">{config.surveyType}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-blue-200 mb-2">
                  <span>Progreso</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${config.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Counter Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => updateCount(config.key as keyof SurveyData, false)}
                    className="w-12 h-12 bg-red-500/30 hover:bg-red-500/40 text-white rounded-xl flex items-center justify-center transition-all duration-300"
                    disabled={current <= 0}
                  >
                    <Minus size={20} />
                  </button>
                  
                  <div className="text-center">
                    <input
                      type="number"
                      value={current}
                      onChange={(e) => setDirectValue(config.key as keyof SurveyData, e.target.value)}
                      className="w-20 h-12 text-center text-2xl font-bold bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max={goal}
                    />
                    <div className="text-blue-300 text-sm mt-1">/ {goal}</div>
                  </div>

                  <button
                    onClick={() => updateCount(config.key as keyof SurveyData, true)}
                    className="w-12 h-12 bg-green-500/30 hover:bg-green-500/40 text-white rounded-xl flex items-center justify-center transition-all duration-300"
                    disabled={current >= goal}
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-3`}>
                    <div className="text-white font-bold text-lg">{current}</div>
                    <div className="text-blue-200 text-sm">Encuestados</div>
                  </div>
                  <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-3`}>
                    <div className="text-white font-bold text-lg">{remaining}</div>
                    <div className="text-blue-200 text-sm">Faltan</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">Resumen General</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {tempData['G6-8'] + tempData['G9-11'] + tempData['G12-14'] + tempData['G15-18'] + tempData['G19+']}
            </div>
            <div className="text-blue-200 text-sm">Total L1/L2 + SM</div>
            <div className="text-xs text-green-400">
              Meta: {goals['G6-8'] + goals['G9-11'] + goals['G12-14'] + goals['G15-18'] + goals['G19+']}
            </div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">{tempData.STAFF}</div>
            <div className="text-blue-200 text-sm">Staff/Liderazgo</div>
            <div className="text-xs text-green-400">Meta: {goals.STAFF}</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {Object.values(tempData).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-blue-200 text-sm">Total General</div>
            <div className="text-xs text-green-400">
              Meta: {Object.values(goals).reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {Object.values(goals).reduce((a, b) => a + b, 0) - Object.values(tempData).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-blue-200 text-sm">Faltan Total</div>
            <div className="text-xs text-orange-400">Por completar</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-6 text-blue-200">
        <div className="glass rounded-full px-6 py-3 inline-block">
          2025 By AVG TECH - Administración Remota
        </div>
      </footer>
    </div>
  );
}

export default RemoteAdmin;