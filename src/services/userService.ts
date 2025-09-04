import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserProfile {
  id?: string;
  project_number: string;
  survey_data: Record<string, number>;
  goals: Record<string, number>;
  participants: any[];
  created_at?: string;
  updated_at?: string;
}

export interface SavedProgress {
  id?: string;
  user_id: string;
  name: string;
  survey_data: Record<string, number>;
  participants: any[];
  goals: Record<string, number>;
  created_at?: string;
}

// Validar usuarios permitidos
export const VALID_USERS = [
  '676', '684', '680', '662', '660', '667', '664', '675', 
  '674', '668', '679', '678', '681', '682', '677', '663', 
  '683', '673'
];

export const validateUser = (projectId: string, password: string): boolean => {
  return VALID_USERS.includes(projectId) && password === 'Caspio2025';
};

// Obtener perfil de usuario
export const getUserProfile = async (projectNumber: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('project_number', projectNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return null;
  }
};

// Crear o actualizar perfil de usuario
export const upsertUserProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        project_number: profile.project_number,
        survey_data: profile.survey_data,
        goals: profile.goals,
        participants: profile.participants,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'project_number'
      });

    if (error) {
      console.error('Error upserting user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return false;
  }
};

// Guardar progreso
export const saveProgress = async (progress: SavedProgress): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_progresses')
      .insert({
        user_id: progress.user_id,
        name: progress.name,
        survey_data: progress.survey_data,
        participants: progress.participants,
        goals: progress.goals
      });

    if (error) {
      console.error('Error saving progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return false;
  }
};

// Obtener progresos guardados
export const getSavedProgresses = async (userId: string): Promise<SavedProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_progresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved progresses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return [];
  }
};

// Cargar progreso
export const loadProgress = async (progressId: string): Promise<SavedProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('saved_progresses')
      .select('*')
      .eq('id', progressId)
      .single();

    if (error) {
      console.error('Error loading progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return null;
  }
};

// Eliminar progreso
export const deleteProgress = async (progressId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('saved_progresses')
      .delete()
      .eq('id', progressId);

    if (error) {
      console.error('Error deleting progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return false;
  }
};
// Gestión de sesión de usuario
export const saveCurrentUser = (username: string, projectNumber: string) => {
  const userData = { username, projectNumber: username }; // El username ES el número de proyecto
  localStorage.setItem('currentUser', JSON.stringify(userData));
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};