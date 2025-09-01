// Base de datos de participantes CASPIO 660
export interface ParticipantRecord {
  code: string;
  name: string;
  tutor?: string;
  defaultGroup: string;
  phone?: string;
  phone2?: string;
}

export const participantDatabase: ParticipantRecord[] = [
  // Grupo G9-11 (Menores de 12 años)
  { code: "001", name: "Ana María González", defaultGroup: "G9-11" },
  { code: "002", name: "Carlos Eduardo Pérez", defaultGroup: "G9-11" },
  { code: "003", name: "Sofía Isabella Rodríguez", defaultGroup: "G9-11" },
  { code: "004", name: "Diego Alejandro Martínez", defaultGroup: "G9-11" },
  { code: "005", name: "Valentina Camila López", defaultGroup: "G9-11" },
  { code: "006", name: "Sebastián David García", defaultGroup: "G9-11" },
  { code: "007", name: "Isabella Nicole Hernández", defaultGroup: "G9-11" },
  { code: "008", name: "Mateo Santiago Jiménez", defaultGroup: "G9-11" },
  { code: "009", name: "Camila Andrea Vargas", defaultGroup: "G9-11" },
  { code: "010", name: "Samuel Nicolás Castro", defaultGroup: "G9-11" },

  // Grupo G12-14 (12 a 14 años)
  { code: "101", name: "Angie Alejandra Soto", defaultGroup: "G12-14" },
  { code: "102", name: "Kevin Andrés Morales", defaultGroup: "G12-14" },
  { code: "103", name: "Daniela Fernanda Ruiz", defaultGroup: "G12-14" },
  { code: "104", name: "Alejandro José Ramírez", defaultGroup: "G12-14" },
  { code: "105", name: "Natalia Esperanza Torres", defaultGroup: "G12-14" },
  { code: "106", name: "Andrés Felipe Gómez", defaultGroup: "G12-14" },
  { code: "107", name: "Gabriela Valentina Díaz", defaultGroup: "G12-14" },
  { code: "108", name: "Juan Pablo Medina", defaultGroup: "G12-14" },
  { code: "109", name: "María José Aguilar", defaultGroup: "G12-14" },
  { code: "110", name: "Cristian Camilo Vega", defaultGroup: "G12-14" },

  // Grupo G15-18 (15 a 18 años)
  { code: "201", name: "Laura Stephanie Moreno", defaultGroup: "G15-18" },
  { code: "202", name: "Javier Eduardo Silva", defaultGroup: "G15-18" },
  { code: "203", name: "Paola Andrea Castillo", defaultGroup: "G15-18" },
  { code: "204", name: "Miguel Ángel Rojas", defaultGroup: "G15-18" },
  { code: "205", name: "Carolina Isabel Mendoza", defaultGroup: "G15-18" },
  { code: "206", name: "Esteban Alejandro Cruz", defaultGroup: "G15-18" },
  { code: "207", name: "Melissa Tatiana Ortega", defaultGroup: "G15-18" },
  { code: "208", name: "Ricardo Sebastián Peña", defaultGroup: "G15-18" },
  { code: "209", name: "Andrea Catalina Restrepo", defaultGroup: "G15-18" },
  { code: "210", name: "Felipe Andrés Guerrero", defaultGroup: "G15-18" },

  // Grupo G19+ (19 a 22 años)
  { code: "301", name: "Alejandra María Quintero", defaultGroup: "G19+" },
  { code: "302", name: "Daniel Fernando Ospina", defaultGroup: "G19+" },
  { code: "303", name: "Stephanie Nicole Vargas", defaultGroup: "G19+" },
  { code: "304", name: "Camilo Andrés Betancur", defaultGroup: "G19+" },
  { code: "305", name: "Juliana Andrea Cardona", defaultGroup: "G19+" },
  { code: "306", name: "Sebastián David Mejía", defaultGroup: "G19+" },
  { code: "307", name: "Natasha Alejandra Parra", defaultGroup: "G19+" },
  { code: "308", name: "Jhon Alexander Muñoz", defaultGroup: "G19+" },
  { code: "309", name: "Vanessa Carolina Giraldo", defaultGroup: "G19+" },
  { code: "310", name: "Andrés Felipe Salazar", defaultGroup: "G19+" },

  // STAFF/LIDERAZGO
  { code: "S01", name: "Pastor Principal", defaultGroup: "STAFF" },
  { code: "S02", name: "Coordinador General", defaultGroup: "STAFF" },
  { code: "S03", name: "Líder de Jóvenes", defaultGroup: "STAFF" },
  { code: "S04", name: "Líder de Niños", defaultGroup: "STAFF" },
  { code: "S05", name: "Coordinador de Logística", defaultGroup: "STAFF" },
  { code: "S06", name: "Líder de Alabanza", defaultGroup: "STAFF" },
  { code: "S07", name: "Coordinador de Medios", defaultGroup: "STAFF" },
  { code: "S08", name: "Líder de Intercesión", defaultGroup: "STAFF" },
  { code: "S09", name: "Coordinador de Seguridad", defaultGroup: "STAFF" },
  { code: "S10", name: "Líder de Hospitalidad", defaultGroup: "STAFF" }
];

export function findParticipantByCode(code: string): ParticipantRecord | undefined {
  return participantDatabase.find(p => p.code.toLowerCase() === code.toLowerCase());
}

export function getParticipantsByGroup(group: string): ParticipantRecord[] {
  return participantDatabase.filter(p => p.defaultGroup === group);
}