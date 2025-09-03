import React, { useState } from 'react';
import { ArrowLeft, Target, Save, RotateCcw, Users } from 'lucide-react';
import { SurveyData } from '../types/survey';

interface GoalsConfigurationProps {
  goals: SurveyData;
  setGoals: React.Dispatch<React.SetStateAction<SurveyData>>;
  currentUser: any;
  onBack: () => void;
}

function GoalsConfiguration({ goals, setGoals, currentUser, onBack }: GoalsConfigurationProps) {
  const [tempGoals, setTempGoals] = useState<SurveyData>({ ...goals });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const groupConfigs = [
    { 
      key: 'G6-8', 
      title: 'Grupo Etario G6-8', 
      color: 'from-pink-400 to-pink-500',
      description: 'Menores de 9 años',
      surveyType: 'L1 (15 minutos)'
    },
    { 
      key: 'G9-11', 
      title: 'Grupo Etario G9-11', 
      color: 'from-red-400 to-red-500',
      description: '9 a 11 años',
      surveyType: 'L2 (30 minutos)'
    },
    { 
      key: 'G12-14', 
      title: 'Grupo Etario G12-14', 
      color: 'from-blue-400 to-blue-500',
      description: '12 a 14 años',
      surveyType: 'L2 + SM Jóvenes'
    },
    { 
      key: 'G15-18', 
      title: 'Grupo Etario G15-18', 
      color: 'from-purple-400 to-purple-500',
      description: '15 a 18 años',
      surveyType: 'L2 + SM Jóvenes'
    },
    { 
      key: 'G19+', 
      title: 'Grupo Etario G19+', 
      color: 'from-orange-400 to-orange-500',
      description: '19 a 22 años',
      surveyType: 'L2 + SM Jóvenes'
    },
    { 
      key: 'STAFF', 
      title: 'STAFF/LIDERAZGO', 
      color: 'from-green-400 to-green-500',
      description: 'Personal y Liderazgo',
      surveyType: 'SM Staff'
    }
  ];

  const updateGoal = (key: keyof SurveyData, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setTempGoals(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const saveGoals = () => {
    setGoals(tempGoals);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const resetGoals = () => {
    setTempGoals({ ...goals });
  };

  const setDefaultGoals = () => {
    const defaultGoals: SurveyData = {
      'G6-8': 30,
      'G9-11': 46,
      'G12-14': 41,
      'G15-18': 46,
      'G19+': 44,
      'STAFF': 14
    };
    setTempGoals(defaultGoals);
  };

  const totalGoal = Object.values(tempGoals).reduce((a, b) => a + b, 0);

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
            <Target className="inline mr-3" size={28} />
            CONFIGURACIÓN DE METAS - PROYECTO {currentUser?.projectNumber}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={setDefaultGoals}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300"
            >
              <RotateCcw size={20} />
              Valores Por Defecto
            </button>
            <button
              onClick={resetGoals}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/30 text-white rounded-lg hover:bg-yellow-500/40 transition-all duration-300"
            >
              <RotateCcw size={20} />
              Deshacer
            </button>
            <button
              onClick={saveGoals}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
            >
              <Save size={20} />
              Guardar Metas
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSaveSuccess && (
        <div className="glass rounded-xl p-4 mb-6 bg-green-500/20 border border-green-500/30">
          <p className="text-green-200 text-center font-semibold">
            ✅ Metas guardadas exitosamente
          </p>
        </div>
      )}

      {/* Goals Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {groupConfigs.map((config) => (
          <div key={config.key} className="glass rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className={`bg-gradient-to-br ${config.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
              <p className="text-blue-200 text-sm mb-1">{config.description}</p>
              <p className="text-blue-300 text-xs">{config.surveyType}</p>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <label className="block text-blue-200 text-sm mb-2">Meta de Encuestas</label>
                <input
                  type="number"
                  value={tempGoals[config.key as keyof SurveyData]}
                  onChange={(e) => updateGoal(config.key as keyof SurveyData, e.target.value)}
                  className="w-full text-center text-3xl font-bold bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 py-3"
                  min="0"
                  max="999"
                />
              </div>

              <div className="text-center p-3 bg-white/5 rounded-xl">
                <div className="text-blue-200 text-sm">Meta Actual</div>
                <div className="text-white font-bold text-lg">{goals[config.key as keyof SurveyData]} participantes</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">Resumen de Metas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {tempGoals['G6-8'] + tempGoals['G9-11'] + tempGoals['G12-14'] + tempGoals['G15-18'] + tempGoals['G19+']}
            </div>
            <div className="text-blue-200 text-sm">Total L1/L2 + SM</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">{tempGoals.STAFF}</div>
            <div className="text-blue-200 text-sm">Staff/Liderazgo</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">{totalGoal}</div>
            <div className="text-blue-200 text-sm">Meta Total</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">
              {totalGoal - (goals['G6-8'] + goals['G9-11'] + goals['G12-14'] + goals['G15-18'] + goals['G19+'] + goals.STAFF)}
            </div>
            <div className="text-blue-200 text-sm">Diferencia</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <h4 className="text-white font-semibold mb-2">💡 Información Importante</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Las metas se guardan automáticamente para tu proyecto ({currentUser?.projectNumber})</li>
            <li>• Los cambios se reflejan en todas las vistas (proyección, administración, etc.)</li>
            <li>• Cada usuario tiene sus propias metas independientes</li>
            <li>• G6-8 es el nuevo grupo para los más pequeños (menores de 9 años)</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-6 text-blue-200">
        <div className="glass rounded-full px-6 py-3 inline-block">
          2025 By AVG TECH - Configuración de Metas
        </div>
      </footer>
    </div>
  );
}

export default GoalsConfiguration;