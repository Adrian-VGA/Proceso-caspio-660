// Base de datos de participantes CASPIO - Inicialmente vacía
export interface ParticipantRecord {
  code: string;
  name: string;
  tutor?: string;
  defaultGroup: string;
  phone?: string;
  phone2?: string;
}

// Base de datos vacía - cada usuario tendrá sus propios participantes
export const participantDatabase: ParticipantRecord[] = [];

export function findParticipantByCode(code: string): ParticipantRecord | undefined {
  return participantDatabase.find(p => p.code.toLowerCase() === code.toLowerCase());
}

export function getParticipantsByGroup(group: string): ParticipantRecord[] {
  return participantDatabase.filter(p => p.defaultGroup === group);
}