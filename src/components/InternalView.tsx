import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Minus, Save, RotateCcw, UserPlus, List, Download, Zap } from 'lucide-react';
import { SurveyData, ParticipantData, Participant } from '../types/survey';
import ParticipantModal from './ParticipantModal';
import QuickAddModal from './QuickAddModal';

interface InternalViewProps {
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
  goals: Record<keyof SurveyData, number>;
  onBack: () => void;
}

function InternalView({ surveyData, setSurveyData, goals, onBack }: InternalViewProps) {
  const [tempData, setTempData] = useState<SurveyData>({ ...surveyData });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [participantData, setParticipantData] = useState<ParticipantData>(() => {
    const saved = localStorage.getItem('participantData');
    return saved ? JSON.parse(saved) : {
      'G9-11': [],
      'G12-14': [],
      'G15-18': [],
      'G19+': [],
      'STAFF': []
    };
  });
  const [selectedGroup, setSelectedGroup] = useState<keyof SurveyData | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState<keyof SurveyData | null>(null);
  const [participantDatabase, setParticipantDatabase] = useState<any[]>([]);

  // Load participant database from localStorage
  useEffect(() => {
    const savedDatabase = localStorage.getItem('participantDatabase');
    if (savedDatabase) {
      setParticipantDatabase(JSON.parse(savedDatabase));
    } else {
      // Load default database
      import('../data/participantDatabase').then(module => {
        setParticipantDatabase(module.participantDatabase);
        localStorage.setItem('participantDatabase', JSON.stringify(module.participantDatabase));
      });
    }
  }, []);

  const findParticipantByCode = (code: string) => {
    return participantDatabase.find(p => p.code.toLowerCase() === code.toLowerCase());
  };

  // Save participant data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('participantData', JSON.stringify(participantData));
  }, [participantData]);

  // Sync with projection view in real-time
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state before page unload
      setSurveyData(tempData);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tempData, setSurveyData]);

  // Auto-save changes every 2 seconds
  React.useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      setSurveyData(tempData);
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [tempData, setSurveyData]);

  const groupConfigs = [
    { 
      key: 'G9-11', 
      title: 'Grupo Etario G9-11', 
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      surveyType: 'L2 (30 minutos)',
      description: 'Menores de 12 años'
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
    setTempData(prev => ({
      ...prev,
      [key]: increment 
        ? Math.min(prev[key] + 1, goals[key])
        : Math.max(prev[key] - 1, 0)
    }));
  };

  const setDirectValue = (key: keyof SurveyData, value: string) => {
    const numValue = parseInt(value) || 0;
    setTempData(prev => ({
      ...prev,
      [key]: Math.min(Math.max(numValue, 0), goals[key])
    }));
  };

  const saveChanges = () => {
    setSurveyData(tempData);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const resetValues = () => {
    setTempData({ ...surveyData });
  };

  const resetAll = () => {
    const emptyData: SurveyData = {
      'G9-11': 0,
      'G12-14': 0,
      'G15-18': 0,
      'G19+': 0,
      'STAFF': 0
    };
    setTempData(emptyData);
  };

  const addParticipant = (participant: Omit<Participant, 'id' | 'timestamp'>) => {
    const newParticipant: Participant = {
      ...participant,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setParticipantData(prev => ({
      ...prev,
      [participant.group]: [...prev[participant.group], newParticipant]
    }));
    
    // Auto-update survey count
    setTempData(prev => ({
      ...prev,
      [participant.group]: Math.min(prev[participant.group] + 1, goals[participant.group])
    }));
  };

  const removeParticipant = (participantId: string, groupKey: keyof SurveyData) => {
    setParticipantData(prev => ({
      ...prev,
      [groupKey]: prev[groupKey].filter(p => p.id !== participantId)
    }));
    
    // Auto-update survey count
    setTempData(prev => ({
      ...prev,
      [groupKey]: Math.max(prev[groupKey] - 1, 0)
    }));
  };

  const exportAllParticipants = () => {
    const allParticipants: Participant[] = [];
    Object.values(participantData).forEach(group => {
      allParticipants.push(...group);
    });
    
    const csvContent = allParticipants.map(p => 
      `${p.code},${p.name},${p.group}`
    ).join('\n');
    
    const header = 'CODIGO,NOMBRE,GRUPO ETARIO\n';
    const fullContent = header + csvContent;
    
    const blob = new Blob([fullContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos_participantes_caspio660_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const quickAddParticipant = (code: string, groupKey: keyof SurveyData) => {
    const participantRecord = findParticipantByCode(code);
    if (participantRecord) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        code: participantRecord.code,
        name: participantRecord.name,
        group: groupKey,
        timestamp: new Date().toISOString()
      };
      
      setParticipantData(prev => ({
        ...prev,
        [groupKey]: [...prev[groupKey], newParticipant]
      }));
      
      // Auto-update survey count
      setTempData(prev => ({
        ...prev,
        [groupKey]: Math.min(prev[groupKey] + 1, goals[groupKey])
      }));
    }
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
            <Users className="inline mr-3" size={28} />
            ADMINISTRACIÓN INTERNA - CASPIO 660
          </h1>

          <div className="flex gap-2">
            <button
              onClick={exportAllParticipants}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
            >
              <Download size={20} />
              Exportar Todos
            </button>
            <button
              onClick={resetValues}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/30 text-white rounded-lg hover:bg-yellow-500/40 transition-all duration-300"
            >
              <RotateCcw size={20} />
              Deshacer
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
            >
              <RotateCcw size={20} />
              Reiniciar Todo
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="glass rounded-xl p-4 mb-6 bg-green-500/20 border border-green-500/30">
          <p className="text-green-200 text-center font-semibold">
            ✅ Datos guardados exitosamente
          </p>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {groupConfigs.map((config) => {
          const current = tempData[config.key as keyof SurveyData];
          const goal = goals[config.key as keyof SurveyData];
          const remaining = goal - current;
          const percentage = (current / goal) * 100;
          const groupParticipants = participantData[config.key as keyof SurveyData];

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

                {/* Participant Management */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowQuickAdd(config.key as keyof SurveyData)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
                    >
                      <Zap size={16} />
                      Agregar Rápido
                    </button>
                    <button
                      onClick={() => setSelectedGroup(config.key as keyof SurveyData)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300"
                    >
                      <UserPlus size={16} />
                      Manual
                    </button>
                    <button
                      onClick={() => setSelectedGroup(config.key as keyof SurveyData)}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-500/30 text-white rounded-lg hover:bg-purple-500/40 transition-all duration-300"
                    >
                      <List size={16} />
                      Ver ({groupParticipants.length})
                    </button>
                  </div>
                  
                  {/* Quick participant preview */}
                  {groupParticipants.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-2 max-h-20 overflow-y-auto">
                      <div className="text-xs text-blue-200 mb-1">Últimos registrados:</div>
                      {groupParticipants.slice(-3).map((participant) => (
                        <div key={participant.id} className="text-xs text-white flex justify-between">
                          <span className="font-mono">{participant.code}</span>
                          <span className="truncate ml-2">{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary and Save */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Resumen General</h3>
          <button
            onClick={saveChanges}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg"
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {tempData['G9-11'] + tempData['G12-14'] + tempData['G15-18'] + tempData['G19+']}
            </div>
            <div className="text-blue-200 text-sm">Total L2 + SM</div>
            <div className="text-xs text-green-400">
              Meta: {goals['G9-11'] + goals['G12-14'] + goals['G15-18'] + goals['G19+']}
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

        {/* Participant Summary */}
        <div className="mt-6 grid grid-cols-5 gap-4">
          {groupConfigs.map((config) => {
            const groupParticipants = participantData[config.key as keyof SurveyData];
            return (
              <div key={config.key} className="text-center p-3 bg-white/5 rounded-xl">
                <div className="text-lg font-bold text-white">{groupParticipants.length}</div>
                <div className="text-blue-200 text-xs">{config.key} Registrados</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Participant Modal */}
      {selectedGroup && (
        <ParticipantModal
          isOpen={true}
          onClose={() => setSelectedGroup(null)}
          groupKey={selectedGroup}
          groupTitle={groupConfigs.find(g => g.key === selectedGroup)?.title || ''}
          participants={participantData[selectedGroup]}
          onAddParticipant={addParticipant}
          onRemoveParticipant={(id) => removeParticipant(id, selectedGroup)}
          maxParticipants={goals[selectedGroup]}
        />
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal
          isOpen={true}
          onClose={() => setShowQuickAdd(null)}
          groupKey={showQuickAdd}
          groupTitle={groupConfigs.find(g => g.key === showQuickAdd)?.title || ''}
          onAddParticipant={addParticipant}
          existingParticipants={participantData[showQuickAdd]}
        />
      )}

      {/* Footer */}
      <footer className="text-center mt-6 text-blue-200">
        <div className="glass rounded-full px-6 py-3 inline-block">
          2025 By AVG TECH - Sistema de Gestión Interno
        </div>
      </footer>
    </div>
  );
}

export default InternalView;