import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, FolderOpen, Trash2, Calendar, Users, Download, Upload } from 'lucide-react';
import { SurveyData, ParticipantData, SavedProgress } from '../types/survey';
import { saveUserProgress, loadUserProgresses, loadProgress } from '../services/userService';

interface ProgressManagerProps {
  surveyData: SurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SurveyData>>;
  goals: SurveyData;
  setGoals: React.Dispatch<React.SetStateAction<SurveyData>>;
  currentUser: any;
  onBack: () => void;
}

function ProgressManager({ 
  surveyData, 
  setSurveyData, 
  goals, 
  setGoals, 
  currentUser, 
  onBack 
}: ProgressManagerProps) {
  const [progressName, setProgressName] = useState('');
  const [savedProgresses, setSavedProgresses] = useState<SavedProgress[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participantData, setParticipantData] = useState<ParticipantData>(() => {
    const saved = localStorage.getItem(`participantData_${currentUser?.username}`);
    return saved ? JSON.parse(saved) : {
      'G6-8': [],
      'G9-11': [],
      'G12-14': [],
      'G15-18': [],
      'G19+': [],
      'STAFF': []
    };
  });

  // Load saved progresses on mount
  useEffect(() => {
    loadSavedProgresses();
  }, []);

  const loadSavedProgresses = async () => {
    setIsLoading(true);
    const progresses = await loadUserProgresses();
    setSavedProgresses(progresses);
    setIsLoading(false);
  };

  const saveCurrentProgress = async () => {
    if (!progressName.trim()) {
      alert('Por favor ingresa un nombre para el progreso');
      return;
    }

    setIsLoading(true);
    const success = await saveUserProgress(
      progressName.trim(),
      surveyData,
      participantData,
      goals
    );

    if (success) {
      setShowSaveSuccess(true);
      setProgressName('');
      await loadSavedProgresses();
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } else {
      alert('Error al guardar el progreso. Si Supabase no está conectado, se guardará localmente.');
    }
    setIsLoading(false);
  };

  const loadSavedProgress = async (progressId: string) => {
    setIsLoading(true);
    const progress = await loadProgress(progressId);
    
    if (progress) {
      setSurveyData(progress.survey_data);
      setGoals(progress.goals);
      setParticipantData(progress.participant_data);
      
      // Save to localStorage for current session
      localStorage.setItem(`surveyData_${currentUser?.username}`, JSON.stringify(progress.survey_data));
      localStorage.setItem(`userGoals_${currentUser?.username}`, JSON.stringify(progress.goals));
      localStorage.setItem(`participantData_${currentUser?.username}`, JSON.stringify(progress.participant_data));
      
      alert(`Progreso "${progress.name}" cargado exitosamente`);
    } else {
      alert('Error al cargar el progreso');
    }
    setIsLoading(false);
  };

  const deleteProgress = async (progressId: string, progressName: string) => {
    if (confirm(`¿Estás seguro de eliminar el progreso "${progressName}"?`)) {
      // Note: We would implement delete functionality here
      // For now, just reload the list
      await loadSavedProgresses();
    }
  };

  const exportProgress = (progress: SavedProgress) => {
    const exportData = {
      name: progress.name,
      project: currentUser?.projectNumber,
      date: progress.created_at,
      surveyData: progress.survey_data,
      participantData: progress.participant_data,
      goals: progress.goals
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progreso_${progress.name}_${currentUser?.projectNumber}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalCompleted = (data: SurveyData) => {
    return Object.values(data).reduce((a, b) => a + b, 0);
  };

  const getTotalGoal = (goals: SurveyData) => {
    return Object.values(goals).reduce((a, b) => a + b, 0);
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
            <FolderOpen className="inline mr-3" size={28} />
            GESTIÓN DE PROGRESOS - PROYECTO {currentUser?.projectNumber}
          </h1>

          <button
            onClick={loadSavedProgresses}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300"
          >
            <Upload size={20} />
            Actualizar Lista
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="glass rounded-xl p-4 mb-6 bg-green-500/20 border border-green-500/30">
          <p className="text-green-200 text-center font-semibold">
            ✅ Progreso guardado exitosamente en Supabase
          </p>
        </div>
      )}

      {/* Save Current Progress */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Guardar Progreso Actual</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={progressName}
              onChange={(e) => setProgressName(e.target.value)}
              placeholder="Nombre del progreso (ej: Día 1 - Mañana, Sesión Completa, etc.)"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={saveCurrentProgress}
            disabled={isLoading || !progressName.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300 disabled:opacity-50"
          >
            <Save size={20} />
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        {/* Current Progress Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-lg font-bold text-white">{getTotalCompleted(surveyData)}</div>
            <div className="text-blue-200 text-sm">Encuestados Actuales</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-lg font-bold text-white">{getTotalGoal(goals)}</div>
            <div className="text-blue-200 text-sm">Meta Total</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-lg font-bold text-white">
              {((getTotalCompleted(surveyData) / getTotalGoal(goals)) * 100).toFixed(1)}%
            </div>
            <div className="text-blue-200 text-sm">Progreso</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-xl">
            <div className="text-lg font-bold text-white">
              {Object.keys(participantData).reduce((total, key) => 
                total + participantData[key as keyof ParticipantData].length, 0
              )}
            </div>
            <div className="text-blue-200 text-sm">Participantes Registrados</div>
          </div>
        </div>
      </div>

      {/* Saved Progresses List */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Progresos Guardados</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-blue-200">Cargando progresos...</p>
          </div>
        ) : savedProgresses.length === 0 ? (
          <div className="text-center py-12 text-blue-300">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay progresos guardados</p>
            <p className="text-sm">Guarda tu primer progreso usando el formulario arriba</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedProgresses.map((progress) => {
              const totalCompleted = getTotalCompleted(progress.survey_data);
              const totalGoal = getTotalGoal(progress.goals);
              const percentage = (totalCompleted / totalGoal) * 100;

              return (
                <div key={progress.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-bold text-lg">{progress.name}</h4>
                        <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs">
                          Proyecto {currentUser?.projectNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-blue-200">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(progress.created_at).toLocaleDateString('es-ES')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {totalCompleted}/{totalGoal} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportProgress(progress)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-500/40 transition-all duration-300"
                      >
                        <Download size={16} />
                        Exportar
                      </button>
                      <button
                        onClick={() => loadSavedProgress(progress.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-500/30 text-green-200 rounded-lg hover:bg-green-500/40 transition-all duration-300"
                      >
                        <FolderOpen size={16} />
                        Cargar
                      </button>
                      <button
                        onClick={() => deleteProgress(progress.id, progress.name)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition-all duration-300"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Progress Details */}
                  <div className="mt-3 grid grid-cols-6 gap-2">
                    {Object.entries(progress.survey_data).map(([key, value]) => (
                      <div key={key} className="text-center p-2 bg-white/5 rounded">
                        <div className="text-white font-bold text-sm">{value}</div>
                        <div className="text-blue-200 text-xs">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="glass rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">💡 Instrucciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">💾 Guardar Progreso</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Guarda el estado actual de encuestas y participantes</li>
              <li>• Incluye las metas configuradas</li>
              <li>• Se almacena en Supabase automáticamente</li>
              <li>• Cada usuario tiene sus propios progresos</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">📂 Cargar Progreso</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Restaura un estado previamente guardado</li>
              <li>• Incluye datos de encuestas y participantes</li>
              <li>• Actualiza las metas automáticamente</li>
              <li>• Útil para continuar trabajo de días anteriores</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-6 text-blue-200">
        <div className="glass rounded-full px-6 py-3 inline-block">
          2025 By AVG TECH - Gestión de Progresos
        </div>
      </footer>
    </div>
  );
}

export default ProgressManager;