import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Upload, Download, Plus, Trash2, Search, Users, Edit3, Save, X, FileText, AlertTriangle, FileJson } from 'lucide-react';
import { ParticipantRecord } from '../data/participantDatabase';

interface ParticipantDatabaseProps {
  currentUser: any;
  onBack: () => void;
}

function ParticipantDatabase({ currentUser, onBack }: ParticipantDatabaseProps) {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newParticipant, setNewParticipant] = useState({ code: '', name: '', defaultGroup: 'G6-8' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMassAddForm, setShowMassAddForm] = useState(false);
  const [massAddText, setMassAddText] = useState('');
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [importStats, setImportStats] = useState<{added: number, duplicates: number, errors: number} | null>(null);

  const loadNameJsonFile = async () => {
    try {
      const response = await fetch('/src/data/name.json');
      const jsonData = await response.json();
      
      console.log('Cargando name.json automáticamente...', jsonData);
      
      const newParticipants: ParticipantRecord[] = [];
      const processedCodes = new Set<string>();
      let duplicates = 0;
      let errors = 0;
      
      // Procesar participantDatabase primero
      if (jsonData.participantDatabase && typeof jsonData.participantDatabase === 'object') {
        console.log('Procesando participantDatabase...');
        Object.entries(jsonData.participantDatabase).forEach(([code, data]: [string, any]) => {
          try {
            if (data && typeof data === 'object' && data.name && data.group) {
              let normalizedGroup = data.group;
              
              // Mapear grupos especiales del staff
              if (data.group === 'Staff' || data.group === 'staff') {
                normalizedGroup = 'STAFF';
              } else if (data.group === 'Miembro del comite' || data.group === 'Miembro de la FCP') {
                normalizedGroup = 'STAFF';
              }
              
              if (!processedCodes.has(code)) {
                newParticipants.push({
                  code: code,
                  name: data.name,
                  tutor: data.tutor,
                  defaultGroup: normalizedGroup,
                  phone: data.phone,
                  phone2: data.phone2
                });
                processedCodes.add(code);
              } else {
                duplicates++;
              }
            }
          } catch (error) {
            console.error(`Error procesando participante ${code}:`, error);
            errors++;
          }
        });
      }
      
      // Procesar horarios (lunes, martes, miercoles)
      ['lunes', 'martes', 'miercoles'].forEach(day => {
        if (jsonData[day] && typeof jsonData[day] === 'object') {
          console.log(`Procesando horarios de ${day}...`);
          Object.entries(jsonData[day]).forEach(([time, participants]: [string, any]) => {
            if (Array.isArray(participants)) {
              participants.forEach(participant => {
                try {
                  if (participant && participant.code && participant.name && participant.group) {
                    let normalizedGroup = participant.group;
                    
                    // Mapear grupos especiales del staff
                    if (participant.group === 'Staff' || participant.group === 'staff') {
                      normalizedGroup = 'STAFF';
                    } else if (participant.group === 'Miembro del comite' || participant.group === 'Miembro de la FCP') {
                      normalizedGroup = 'STAFF';
                    }
                    
                    if (!processedCodes.has(participant.code)) {
                      newParticipants.push({
                        code: participant.code,
                        name: participant.name,
                        tutor: participant.tutor,
                        defaultGroup: normalizedGroup,
                        phone: participant.phone,
                        phone2: participant.phone2
                      });
                      processedCodes.add(participant.code);
                    } else {
                      duplicates++;
                    }
                  }
                } catch (error) {
                  console.error(`Error procesando participante en ${day} ${time}:`, error);
                  errors++;
                }
              });
            }
          });
        }
      });
      
      console.log(`Procesamiento completado: ${newParticipants.length} participantes únicos encontrados`);
      
      if (newParticipants.length > 0) {
        setParticipants(newParticipants);
        localStorage.setItem(`participantDatabase_${currentUser?.username}`, JSON.stringify(newParticipants));
        setImportStats({ added: newParticipants.length, duplicates, errors });
        
        console.log('Participantes cargados exitosamente:', {
          total: newParticipants.length,
          duplicados: duplicates,
          errores: errors
        });
      }
      
    } catch (error) {
      console.error('Error cargando name.json:', error);
      alert('Error cargando name.json. Verifica que el archivo exista y tenga el formato correcto.');
    }
  };

  const groups = [
    { value: 'all', label: 'Todos los Grupos' },
    { value: 'G6-8', label: 'G6-8 (Menores de 9 años)' },
    { value: 'G9-11', label: 'G9-11 (Menores de 12 años)' },
    { value: 'G12-14', label: 'G12-14 (12 a 14 años)' },
    { value: 'G15-18', label: 'G15-18 (15 a 18 años)' },
    { value: 'G19+', label: 'G19+ (19 a 22 años)' },
    { value: 'STAFF', label: 'STAFF/LIDERAZGO' }
  ];

  // Load participants from localStorage on mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem(`participantDatabase_${currentUser?.username}`);
    if (savedParticipants) {
      const parsed = JSON.parse(savedParticipants);
      setParticipants(parsed);
    }
  }, [currentUser]);

  // Filter participants based on search and group
  useEffect(() => {
    let filtered = participants;

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(p => p.defaultGroup === selectedGroup);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredParticipants(filtered);
  }, [participants, searchTerm, selectedGroup]);

  // Save participants to localStorage whenever they change
  useEffect(() => {
    if (participants.length > 0 && currentUser) {
      localStorage.setItem(`participantDatabase_${currentUser.username}`, JSON.stringify(participants));
    }
  }, [participants, currentUser]);

  const addParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipant.code && newParticipant.name) {
      const exists = participants.some(p => p.code === newParticipant.code);
      if (!exists) {
        setParticipants(prev => [...prev, { ...newParticipant }]);
        setNewParticipant({ code: '', name: '', defaultGroup: 'G6-8' });
        setShowAddForm(false);
      } else {
        alert('Ya existe un participante con ese código');
      }
    }
  };

  const removeParticipant = (code: string) => {
    if (confirm('¿Estás seguro de eliminar este participante?')) {
      setParticipants(prev => prev.filter(p => p.code !== code));
    }
  };

  const updateParticipant = (code: string, field: string, value: string) => {
    setParticipants(prev => prev.map(p => 
      p.code === code ? { ...p, [field]: value } : p
    ));
  };

  const exportDatabase = () => {
    const csvContent = participants.map(p => 
      `${p.code},${p.name},${p.tutor || ''},${p.defaultGroup},${p.phone || ''},${p.phone2 || ''}`
    ).join('\n');
    
    const header = 'CODIGO,NOMBRE,TUTOR,GRUPO ETARIO,TELEFONO,TELEFONO2\n';
    const fullContent = header + csvContent;
    
    const blob = new Blob([fullContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base_datos_participantes_proyecto${currentUser?.projectNumber}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importDatabase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.name.endsWith('.json')) {
            // Importar JSON
            let jsonData;
            try {
              jsonData = JSON.parse(content);
            } catch (parseError) {
              alert(`Error al parsear JSON: ${parseError}\n\nVerifica que el archivo tenga formato JSON válido.`);
              return;
            }
            
            const newParticipants: ParticipantRecord[] = [];
            let duplicates = 0;
            let errors = 0;
            
            // Procesar estructura compleja con horarios y base de datos
            let participantsArray: any[] = [];
            
            // Verificar si tiene la estructura compleja con horarios y participantDatabase
            if (jsonData.participantDatabase && typeof jsonData.participantDatabase === 'object') {
              // Extraer participantes de la base de datos
              Object.entries(jsonData.participantDatabase).forEach(([code, data]: [string, any]) => {
                if (data && typeof data === 'object' && data.name && data.group) {
                  participantsArray.push({
                    code: code,
                    name: data.name,
                    group: data.group,
                    tutor: data.tutor
                  });
                }
              });
              
              // También extraer participantes de los horarios si existen
              if (jsonData.lunes || jsonData.martes || jsonData.miercoles) {
                ['lunes', 'martes', 'miercoles'].forEach(day => {
                  if (jsonData[day] && typeof jsonData[day] === 'object') {
                    Object.entries(jsonData[day]).forEach(([time, participants]: [string, any]) => {
                      if (Array.isArray(participants)) {
                        participants.forEach(participant => {
                          if (participant && participant.code && participant.name && participant.group) {
                            // Solo agregar si no existe ya en participantsArray
                            const exists = participantsArray.some(p => p.code === participant.code);
                            if (!exists) {
                              participantsArray.push({
                                code: participant.code,
                                name: participant.name,
                                group: participant.group,
                                tutor: participant.tutor,
                                phone: participant.phone,
                                phone2: participant.phone2
                              });
                            }
                          }
                        });
                      }
                    });
                  }
                });
              }
            } else if (Array.isArray(jsonData)) {
              // Es un array directo
              participantsArray = jsonData;
            } else if (jsonData.participants && Array.isArray(jsonData.participants)) {
              // Tiene una propiedad 'participants' que es un array
              participantsArray = jsonData.participants;
            } else if (typeof jsonData === 'object' && jsonData.code) {
              // Es un solo objeto participante
              participantsArray = [jsonData];
            } else if (typeof jsonData === 'object') {
              // Verificar si es un objeto con horarios (lunes, martes, etc.)
              ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].forEach(day => {
                if (jsonData[day] && typeof jsonData[day] === 'object') {
                  Object.entries(jsonData[day]).forEach(([time, participants]: [string, any]) => {
                    if (Array.isArray(participants)) {
                      participantsArray.push(...participants);
                    }
                  });
                }
              });
            } else {
              alert('Formato JSON no reconocido. El archivo debe contener:\n- Un array de participantes\n- Un objeto con propiedad "participants"\n- Un objeto con horarios (lunes, martes, etc.)\n- Un objeto con "participantDatabase"\n- Un solo objeto participante');
              return;
            }
            
            participantsArray.forEach((item: any, index: number) => {
              try {
                // Verificar campos requeridos con más flexibilidad
                const code = item.code || item.codigo || item.id;
                const name = item.name || item.nombre || item.fullName;
                const group = item.group || item.grupo || item.defaultGroup;
                const tutor = item.tutor || item.guardian || item.responsable;
                const phone = item.phone || item.telefono;
                const phone2 = item.phone2 || item.telefono2;
                
                if (code && name && group) {
                  // Validar que el grupo sea válido (incluyendo variaciones)
                  let normalizedGroup = group;
                  
                  // Mapear grupos especiales del staff
                  if (group === 'Staff' || group === 'staff') {
                    normalizedGroup = 'STAFF';
                  } else if (group === 'Miembro del comite' || group === 'Miembro de la FCP') {
                    normalizedGroup = 'STAFF';
                  }
                  
                  const validGroups = ['G6-8', 'G9-11', 'G12-14', 'G15-18', 'G19+', 'STAFF'];
                  if (!validGroups.includes(group)) {
                    if (!validGroups.includes(normalizedGroup)) {
                      errors++;
                      console.warn(`Participante ${index + 1}: Grupo "${group}" no válido. Grupos válidos: ${validGroups.join(', ')}`);
                      return;
                    }
                  }
                  
                  // Verificar si ya existe (mantener el primero)
                  const existsInCurrent = participants.some(p => p.code === code);
                  const existsInNew = newParticipants.some(p => p.code === code);
                  
                  if (!existsInCurrent && !existsInNew) {
                    newParticipants.push({ 
                      code: code, 
                      name: name, 
                      tutor: tutor,
                      defaultGroup: normalizedGroup,
                      phone: phone,
                      phone2: phone2
                    });
                  } else {
                    duplicates++;
                  }
                } else {
                  console.warn(`Participante ${index + 1}: Faltan campos requeridos. Recibido:`, item);
                  errors++;
                }
              } catch (error) {
                console.error(`Error procesando participante ${index + 1}:`, error);
                errors++;
              }
            });
            
            if (newParticipants.length > 0) {
              setParticipants(prev => [...prev, ...newParticipants]);
            }
            
            // Mostrar resultado detallado
            const message = `Importación completada:
✅ Agregados: ${newParticipants.length}
⚠️ Duplicados ignorados: ${duplicates}
❌ Errores: ${errors}

Total procesados: ${participantsArray.length}`;
            
            alert(message);
            setImportStats({ added: newParticipants.length, duplicates, errors });
            
          } else {
            // Importar CSV (código existente)
            const lines = content.split('\n').filter(line => line.trim());
            const newParticipants: ParticipantRecord[] = [];
            let duplicates = 0;
            
            // Skip header if present
            const startIndex = lines[0].includes('CODIGO') ? 1 : 0;
            
            for (let i = startIndex; i < lines.length; i++) {
              const [code, name, group] = lines[i].split(',').map(s => s.trim());
              if (code && name && group) {
                const existsInCurrent = participants.some(p => p.code === code);
                const existsInNew = newParticipants.some(p => p.code === code);
                
                if (!existsInCurrent && !existsInNew) {
                  newParticipants.push({ code, name, defaultGroup: group });
                } else {
                  duplicates++;
                }
              }
            }
            
            if (newParticipants.length > 0) {
              setParticipants(prev => [...prev, ...newParticipants]);
            }
            
            setImportStats({ added: newParticipants.length, duplicates, errors: 0 });
          }
        } catch (error) {
          console.error('Error al procesar archivo:', error);
          alert(`Error al procesar el archivo: ${error.message}\n\nVerifica que:\n- El archivo sea un JSON válido\n- Contenga los campos: code, name, group\n- Los grupos sean válidos: G6-8, G9-11, G12-14, G15-18, G19+, STAFF`);
        }
      };
      reader.readAsText(file);
      
      // Reset input
      event.target.value = '';
    }
  };

  const addMassiveParticipants = () => {
    if (!massAddText.trim()) return;

    const newParticipants: ParticipantRecord[] = [];
    let errors: string[] = [];
    let duplicates = 0;

    try {
      // Intentar parsear como JSON primero
      const jsonData = JSON.parse(massAddText.trim());
      const participantsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      
      participantsArray.forEach((item: any, index: number) => {
        if (item.code && item.name && item.group) {
          const validGroups = ['G6-8', 'G9-11', 'G12-14', 'G15-18', 'G19+', 'STAFF'];
          if (!validGroups.includes(item.group)) {
            errors.push(`Elemento ${index + 1}: Grupo "${item.group}" no válido`);
            return;
          }
          
          const exists = participants.some(p => p.code === item.code) || newParticipants.some(p => p.code === item.code);
          if (!exists) {
            newParticipants.push({ 
              code: item.code, 
              name: item.name, 
              tutor: item.tutor,
              defaultGroup: item.group 
            });
          } else {
            duplicates++;
          }
        } else {
          errors.push(`Elemento ${index + 1}: Faltan campos requeridos (code, name, group)`);
        }
      });
    } catch (jsonError) {
      // Si no es JSON válido, procesar como CSV
      const lines = massAddText.split('\n').filter(line => line.trim());
      
      lines.forEach((line, index) => {
        const parts = line.split(',').map(part => part.trim());
        
        if (parts.length >= 3) {
          const [code, name, group] = parts;
          
          // Validar que el grupo sea válido
          const validGroups = ['G6-8', 'G9-11', 'G12-14', 'G15-18', 'G19+', 'STAFF'];
          if (!validGroups.includes(group)) {
            errors.push(`Línea ${index + 1}: Grupo "${group}" no válido`);
            return;
          }
          
          // Verificar si ya existe
          const exists = participants.some(p => p.code === code) || newParticipants.some(p => p.code === code);
          if (!exists) {
            newParticipants.push({ code, name, defaultGroup: group });
          } else {
            duplicates++;
          }
        } else {
          errors.push(`Línea ${index + 1}: Formato incorrecto (debe ser: CODIGO,NOMBRE,GRUPO)`);
        }
      });
    }
        

    if (errors.length > 0) {
      alert(`Errores encontrados:\n${errors.join('\n')}\n\nSe agregaron ${newParticipants.length} participantes válidos.\nDuplicados ignorados: ${duplicates}`);
    } else if (duplicates > 0) {
      alert(`Se agregaron ${newParticipants.length} participantes exitosamente.\nDuplicados ignorados: ${duplicates}`);
    }

    if (newParticipants.length > 0) {
      setParticipants(prev => [...prev, ...newParticipants]);
      setMassAddText('');
      setShowMassAddForm(false);
      setImportStats({ added: newParticipants.length, duplicates, errors: errors.length });
    }
  };

  const deleteAllParticipants = () => {
    setParticipants([]);
    setShowDeleteAllConfirm(false);
    alert('Todos los participantes han sido eliminados');
  };

  const getGroupStats = () => {
    const stats: Record<string, number> = {};
    groups.forEach(group => {
      if (group.value !== 'all') {
        stats[group.value] = participants.filter(p => p.defaultGroup === group.value).length;
      }
    });
    return stats;
  };

  const stats = getGroupStats();

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
            <Database className="inline mr-3" size={28} />
            BASE DE DATOS DE PARTICIPANTES - PROYECTO {currentUser?.projectNumber}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={loadNameJsonFile}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/30 text-white rounded-lg hover:bg-purple-500/40 transition-all duration-300"
            >
              <FileJson size={20} />
              Cargar name.json
            </button>
            <button
              onClick={exportDatabase}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
            >
              <Download size={20} />
              Exportar
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300 cursor-pointer">
              <Upload size={20} />
              Importar CSV/JSON
              <input
                type="file"
                accept=".csv,.json"
                onChange={importDatabase}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Estadísticas de la Base de Datos</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-white">{participants.length}</div>
            <div className="text-blue-200 text-sm">Total</div>
          </div>
          {groups.slice(1).map(group => (
            <div key={group.value} className="text-center p-4 bg-white/5 rounded-xl">
              <div className="text-2xl font-bold text-white">{stats[group.value] || 0}</div>
              <div className="text-blue-200 text-sm">{group.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {groups.map(group => (
                <option key={group.value} value={group.value} className="bg-gray-800">
                  {group.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowMassAddForm(!showMassAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/40 transition-all duration-300"
            >
              <FileText size={20} />
              Agregar Masivo (Texto)
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
            >
              <Plus size={20} />
              Agregar Individual
            </button>
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
            >
              <Trash2 size={20} />
              Eliminar Todos
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Agregar Nuevo Participante</h4>
            <form onSubmit={addParticipant} className="flex gap-4">
              <div className="flex-1">
                <label className="block text-blue-200 text-sm mb-2">Código</label>
                <input
                  type="text"
                  value={newParticipant.code}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ej: 001, S01"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-blue-200 text-sm mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Angie Alejandra Soto"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-blue-200 text-sm mb-2">Grupo</label>
                <select
                  value={newParticipant.defaultGroup}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, defaultGroup: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {groups.slice(1).map(group => (
                    <option key={group.value} value={group.value} className="bg-gray-800">
                      {group.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
                >
                  <Plus size={16} />
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Mass Add Form */}
        {showMassAddForm && (
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Agregar Participantes Masivamente</h4>
            <p className="text-blue-200 text-sm mb-4">
              Pega los datos en formato: CODIGO,NOMBRE,GRUPO ETARIO (uno por línea)
              <br />O en formato JSON: &lbrace;"code":"001","name":"Angie Daniela Soto García","tutor":"Gina Brigitte Quintero Orjuela","group":"G19+"&rbrace;
              <br />También soporta archivos JSON complejos con horarios y base de datos de participantes.
            </p>
            <div className="space-y-4">
              <textarea
                value={massAddText}
                onChange={(e) => setMassAddText(e.target.value)}
                placeholder={`Ejemplo:
001,Ana María González,G6-8
001,Ana María González,G9-11
102,Kevin Andrés Morales,G12-14
203,Paola Andrea Castillo,G15-18
304,Camilo Andrés Betancur,G19+
S05,Coordinador de Logística,STAFF`}
                className="w-full h-40 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
              <div className="flex gap-2">
                <button
                  onClick={addMassiveParticipants}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/40 transition-all duration-300"
                >
                  <Plus size={16} />
                  Procesar y Agregar
                </button>
                <button
                  onClick={() => {
                    setShowMassAddForm(false);
                    setMassAddText('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Participants Table */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            Lista de Participantes ({filteredParticipants.length})
          </h3>
          <div className="text-blue-200 text-sm">
            {selectedGroup === 'all' ? 'Mostrando todos los grupos' : `Grupo: ${selectedGroup}`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-12 text-blue-300">
                <Database size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No hay participantes registrados</p>
                <p className="text-sm">Agrega participantes usando el formulario o importa un archivo CSV</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-blue-200 font-semibold">Código</th>
                    <th className="text-left py-3 px-4 text-blue-200 font-semibold">Nombre</th>
                    <th className="text-left py-3 px-4 text-blue-200 font-semibold">Tutor</th>
                    <th className="text-left py-3 px-4 text-blue-200 font-semibold">Grupo</th>
                    <th className="text-left py-3 px-4 text-blue-200 font-semibold">Teléfono</th>
                    <th className="text-center py-3 px-4 text-blue-200 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.code} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        {editingId === participant.code ? (
                          <input
                            type="text"
                            value={participant.code}
                            onChange={(e) => updateParticipant(participant.code, 'code', e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-white font-mono font-bold">{participant.code}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === participant.code ? (
                          <input
                            type="text"
                            value={participant.name}
                            onChange={(e) => updateParticipant(participant.code, 'name', e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-white">{participant.name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === participant.code ? (
                          <input
                            type="text"
                            value={participant.tutor || ''}
                            onChange={(e) => updateParticipant(participant.code, 'tutor', e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-blue-200 text-sm">{participant.tutor || 'Sin tutor'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === participant.code ? (
                          <select
                            value={participant.defaultGroup}
                            onChange={(e) => updateParticipant(participant.code, 'defaultGroup', e.target.value)}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {groups.slice(1).map(group => (
                              <option key={group.value} value={group.value} className="bg-gray-800">
                                {group.value}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            participant.defaultGroup === 'G6-8' ? 'bg-pink-500/30 text-pink-200' :
                            participant.defaultGroup === 'G9-11' ? 'bg-red-500/30 text-red-200' :
                            participant.defaultGroup === 'G12-14' ? 'bg-blue-500/30 text-blue-200' :
                            participant.defaultGroup === 'G15-18' ? 'bg-purple-500/30 text-purple-200' :
                            participant.defaultGroup === 'G19+' ? 'bg-orange-500/30 text-orange-200' :
                            'bg-green-500/30 text-green-200'
                          }`}>
                            {participant.defaultGroup}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-blue-200 text-xs">
                          {participant.phone && (
                            <div>{participant.phone}</div>
                          )}
                          {participant.phone2 && (
                            <div className="text-blue-300">{participant.phone2}</div>
                          )}
                          {!participant.phone && !participant.phone2 && (
                            <span className="text-gray-400">Sin teléfono</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === participant.code ? (
                            <>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-2 py-1 bg-green-500/30 text-green-200 rounded hover:bg-green-500/40 transition-all duration-300"
                              >
                                <Save size={14} />
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-500/30 text-gray-200 rounded hover:bg-gray-500/40 transition-all duration-300"
                              >
                                <X size={14} />
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingId(participant.code)}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500/30 text-blue-200 rounded hover:bg-blue-500/40 transition-all duration-300"
                              >
                                <Edit3 size={14} />
                                Editar
                              </button>
                              <button
                                onClick={() => removeParticipant(participant.code)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-500/30 text-red-200 rounded hover:bg-red-500/40 transition-all duration-300"
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-4">¿Eliminar Todos los Participantes?</h3>
              <p className="text-blue-200 mb-6">
                Esta acción eliminará permanentemente todos los {participants.length} participantes de la base de datos.
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-500/30 text-white rounded-lg hover:bg-gray-500/40 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteAllParticipants}
                  className="flex-1 px-4 py-2 bg-red-500/30 text-white rounded-lg hover:bg-red-500/40 transition-all duration-300"
                >
                  Sí, Eliminar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Instrucciones de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">📥 Importar Datos</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Formato CSV: CODIGO,NOMBRE,TUTOR,GRUPO,TELEFONO</li>
              <li>• Formato JSON: Estructura simple o compleja con horarios</li>
              <li>• Mapea automáticamente grupos especiales a STAFF</li>
              <li>• Los datos se sincronizan automáticamente</li>
              <li>• Incluye el nuevo grupo G6-8 para menores de 9 años</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">📤 Exportar Datos</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Descarga CSV con código, nombre, tutor, grupo y teléfonos</li>
              <li>• Compatible con Excel y Google Sheets</li>
              <li>• Incluye fecha en el nombre del archivo</li>
              <li>• Datos específicos por proyecto</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">➕ Agregar Masivo</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Soporta CSV y JSON (simple o complejo)</li>
              <li>• Extrae datos de horarios automáticamente</li>
              <li>• Procesa base de datos de participantes</li>
              <li>• Una línea por participante</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">🔄 Sincronización</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Los cambios se guardan automáticamente</li>
              <li>• Disponible en administración interna y remota</li>
              <li>• Incluye información de tutores y teléfonos</li>
              <li>• Datos separados por usuario/proyecto</li>
              <li>• Mapea grupos especiales automáticamente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center mt-6 text-blue-200">
        <div className="glass rounded-full px-6 py-3 inline-block">
          2025 By AVG TECH - Gestión de Base de Datos
        </div>
      </footer>
    </div>
  );
}

export default ParticipantDatabase;