import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Users, Plus } from 'lucide-react';
import { SurveyData, Participant } from '../types/survey';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupKey: keyof SurveyData;
  groupTitle: string;
  onAddParticipant: (participant: Omit<Participant, 'id' | 'timestamp'>) => void;
  existingParticipants: Participant[];
}

function QuickAddModal({ 
  isOpen, 
  onClose, 
  groupKey, 
  groupTitle, 
  onAddParticipant,
  existingParticipants 
}: QuickAddModalProps) {
  const [searchCode, setSearchCode] = useState('');
  const [foundParticipant, setFoundParticipant] = useState<any>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [showMassAdd, setShowMassAdd] = useState(false);
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
      });
    }
  }, []);

  const findParticipantByCode = (code: string) => {
    return participantDatabase.find(p => p.code.toLowerCase() === code.toLowerCase());
  };

  if (!isOpen) return null;

  const handleCodeSearch = (code: string) => {
    setSearchCode(code);
    if (code.trim()) {
      const participant = findParticipantByCode(code.trim());
      setFoundParticipant(participant);
    } else {
      setFoundParticipant(null);
    }
  };

  const addSingleParticipant = () => {
    if (foundParticipant) {
      const isAlreadyAdded = existingParticipants.some(p => p.code === foundParticipant.code);
      if (!isAlreadyAdded) {
        onAddParticipant({
          code: foundParticipant.code,
          name: foundParticipant.name,
          group: groupKey
        });
        setSearchCode('');
        setFoundParticipant(null);
      }
    }
  };

  const toggleCodeSelection = (code: string) => {
    setSelectedCodes(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const addSelectedParticipants = () => {
    selectedCodes.forEach(code => {
      const participant = findParticipantByCode(code);
      if (participant) {
        const isAlreadyAdded = existingParticipants.some(p => p.code === participant.code);
        if (!isAlreadyAdded) {
          onAddParticipant({
            code: participant.code,
            name: participant.name,
            group: groupKey
          });
        }
      }
    });
    setSelectedCodes([]);
    setShowMassAdd(false);
  };

  const availableParticipants = participantDatabase.filter(p => 
    p.defaultGroup === groupKey && 
    !existingParticipants.some(ep => ep.code === p.code)
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserPlus className="text-white" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">Agregar Participantes</h2>
              <p className="text-blue-200 text-sm">{groupTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
          >
            <X size={20} />
            Cerrar
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowMassAdd(false)}
            className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
              !showMassAdd 
                ? 'bg-blue-500/30 text-white' 
                : 'bg-white/10 text-blue-200 hover:bg-white/20'
            }`}
          >
            Agregar Individual
          </button>
          <button
            onClick={() => setShowMassAdd(true)}
            className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
              showMassAdd 
                ? 'bg-blue-500/30 text-white' 
                : 'bg-white/10 text-blue-200 hover:bg-white/20'
            }`}
          >
            Agregar Masivo ({availableParticipants.length})
          </button>
        </div>

        {!showMassAdd ? (
          /* Individual Add Mode */
          <div className="space-y-6">
            {/* Search by Code */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Buscar por Código</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => handleCodeSearch(e.target.value)}
                    placeholder="Ingresa el código (ej: 001, S01)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={addSingleParticipant}
                  disabled={!foundParticipant || existingParticipants.some(p => p.code === foundParticipant?.code)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                  Agregar
                </button>
              </div>

              {/* Search Result */}
              {foundParticipant && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{foundParticipant.name}</div>
                      <div className="text-blue-200 text-sm">Código: {foundParticipant.code}</div>
                      <div className="text-blue-300 text-xs">Grupo sugerido: {foundParticipant.defaultGroup}</div>
                    </div>
                    {existingParticipants.some(p => p.code === foundParticipant.code) && (
                      <div className="text-yellow-300 text-sm">Ya agregado</div>
                    )}
                  </div>
                </div>
              )}

              {searchCode && !foundParticipant && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="text-red-200">Código no encontrado en la base de datos</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Mass Add Mode */
          <div className="space-y-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Participantes Disponibles para {groupTitle}
                </h3>
                <button
                  onClick={addSelectedParticipants}
                  disabled={selectedCodes.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Agregar Seleccionados ({selectedCodes.length})
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableParticipants.length === 0 ? (
                  <div className="text-center py-8 text-blue-300">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Todos los participantes de este grupo ya han sido agregados</p>
                  </div>
                ) : (
                  availableParticipants.map((participant) => (
                    <div 
                      key={participant.code}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedCodes.includes(participant.code)
                          ? 'bg-blue-500/30 border border-blue-500/50'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => toggleCodeSelection(participant.code)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-white font-mono font-bold">{participant.code}</div>
                          <div className="text-white">{participant.name}</div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedCodes.includes(participant.code)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-white/30'
                        }`}>
                          {selectedCodes.includes(participant.code) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {availableParticipants.length > 0 && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedCodes(availableParticipants.map(p => p.code))}
                    className="flex-1 py-2 px-4 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300"
                  >
                    Seleccionar Todos
                  </button>
                  <button
                    onClick={() => setSelectedCodes([])}
                    className="flex-1 py-2 px-4 bg-gray-500/30 text-white rounded-lg hover:bg-gray-500/40 transition-all duration-300"
                  >
                    Deseleccionar Todos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickAddModal;