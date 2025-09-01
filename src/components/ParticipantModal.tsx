import React, { useState } from 'react';
import { X, User, Hash, Users, Plus, Trash2, Download } from 'lucide-react';
import { Participant, SurveyData } from '../types/survey';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupKey: keyof SurveyData;
  groupTitle: string;
  participants: Participant[];
  onAddParticipant: (participant: Omit<Participant, 'id' | 'timestamp'>) => void;
  onRemoveParticipant: (participantId: string) => void;
  maxParticipants: number;
}

function ParticipantModal({ 
  isOpen, 
  onClose, 
  groupKey, 
  groupTitle, 
  participants, 
  onAddParticipant, 
  onRemoveParticipant,
  maxParticipants 
}: ParticipantModalProps) {
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.trim() && newName.trim() && participants.length < maxParticipants) {
      onAddParticipant({
        code: newCode.trim(),
        name: newName.trim(),
        group: groupKey
      });
      setNewCode('');
      setNewName('');
    }
  };

  const exportParticipants = () => {
    const csvContent = participants.map(p => 
      `${p.code},${p.name},${p.group}`
    ).join('\n');
    
    const header = 'CODIGO,NOMBRE,GRUPO ETARIO\n';
    const fullContent = header + csvContent;
    
    const blob = new Blob([fullContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participantes_${groupKey}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="text-white" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">{groupTitle}</h2>
              <p className="text-blue-200 text-sm">
                {participants.length} de {maxParticipants} participantes registrados
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {participants.length > 0 && (
              <button
                onClick={exportParticipants}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
            >
              <X size={20} />
              Cerrar
            </button>
          </div>
        </div>

        {/* Add Participant Form */}
        <div className="glass rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Agregar Participante</h3>
          <form onSubmit={handleAddParticipant} className="flex gap-4">
            <div className="flex-1">
              <label className="block text-blue-200 text-sm mb-2">Código</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ej: 001"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-blue-200 text-sm mb-2">Nombre Completo</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Angie Alejandra Soto"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={participants.length >= maxParticipants}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>
          </form>
        </div>

        {/* Participants List */}
        <div className="glass rounded-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">
            Lista de Participantes ({participants.length}/{maxParticipants})
          </h3>
          
          {participants.length === 0 ? (
            <div className="text-center py-8 text-blue-300">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay participantes registrados</p>
              <p className="text-sm">Agrega el primer participante usando el formulario arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Hash size={16} className="text-blue-300" />
                      <span className="text-white font-mono font-bold">{participant.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-300" />
                      <span className="text-white">{participant.name}</span>
                    </div>
                    <div className="text-blue-200 text-sm">
                      {new Date(participant.timestamp).toLocaleString('es-ES')}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition-all duration-300"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-white/5 rounded-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{participants.length}</div>
              <div className="text-blue-200 text-sm">Registrados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-300">{maxParticipants - participants.length}</div>
              <div className="text-blue-200 text-sm">Faltan</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-300">
                {((participants.length / maxParticipants) * 100).toFixed(1)}%
              </div>
              <div className="text-blue-200 text-sm">Completado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantModal;