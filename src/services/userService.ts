import { supabase } from '../lib/supabase';

// Lista de usuarios válidos con sus proyectos
const validUsers = [
  '676', '684', '680', '662', '660', '667', '664', '675', 
  '674', '668', '679', '678', '681', '682', '677', '663', 
  '683', '673'
];

const password = 'Caspio2025';

export interface UserSession {
  username: string;
  projectNumber: string;
  isAuthenticated: boolean;
}

export function authenticateUser(username: string, inputPassword: string): boolean {
  return validUsers.includes(username) && inputPassword === password;
}

export function getCurrentUser(): UserSession | null {
  const saved = localStorage.getItem('currentUser');
  return saved ? JSON.parse(saved) : null;
}

export function setCurrentUser(username: string): void {
  const userSession: UserSession = {
    username,
    projectNumber: username,
    isAuthenticated: true
  };
  localStorage.setItem('currentUser', JSON.stringify(userSession));
}

export function logout(): void {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('surveyData');
  localStorage.removeItem('participantData');
  localStorage.removeItem('userGoals');
}

export async function saveUserProgress(name: string, surveyData: any, participantData: any, goals: any): Promise<boolean> {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // Fallback to localStorage if Supabase is not configured
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      const newProgress = {
        id: Date.now().toString(),
        user_id: user.username,
        name: name,
        survey_data: surveyData,
        participant_data: participantData,
        goals: goals,
        created_at: new Date().toISOString()
      };
      localProgresses.push(newProgress);
      localStorage.setItem(`savedProgresses_${user.username}`, JSON.stringify(localProgresses));
      return true;
    }

    const { error } = await supabase
      .from('saved_progresses')
      .insert({
        user_id: user.username,
        name: name,
        survey_data: surveyData,
        participant_data: participantData,
        goals: goals
      });

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to localStorage on Supabase error
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      const newProgress = {
        id: Date.now().toString(),
        user_id: user.username,
        name: name,
        survey_data: surveyData,
        participant_data: participantData,
        goals: goals,
        created_at: new Date().toISOString()
      };
      localProgresses.push(newProgress);
      localStorage.setItem(`savedProgresses_${user.username}`, JSON.stringify(localProgresses));
      return true;
    }

    return !error;
  } catch (error) {
    console.error('Error saving progress:', error);
    // Fallback to localStorage on any error
    try {
      const user = getCurrentUser();
      if (!user) return false;
      
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      const newProgress = {
        id: Date.now().toString(),
        user_id: user.username,
        name: name,
        survey_data: surveyData,
        participant_data: participantData,
        goals: goals,
        created_at: new Date().toISOString()
      };
      localProgresses.push(newProgress);
      localStorage.setItem(`savedProgresses_${user.username}`, JSON.stringify(localProgresses));
      return true;
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return false;
    }
  }
}

export async function loadUserProgresses(): Promise<any[]> {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // Load from localStorage if Supabase is not configured
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      return localProgresses;
    }

    const { data, error } = await supabase
      .from('saved_progresses')
      .select('*')
      .eq('user_id', user.username)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to localStorage on error
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      return localProgresses;
    }

    return data || [];
  } catch (error) {
    console.error('Error loading progresses:', error);
    // Fallback to localStorage on any error
    try {
      const user = getCurrentUser();
      if (!user) return [];
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      return localProgresses;
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return [];
    }
  }
}

export async function loadProgress(progressId: string): Promise<any | null> {
  try {
    const user = getCurrentUser();
    if (!user) return null;

    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      // Load from localStorage if Supabase is not configured
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      return localProgresses.find((p: any) => p.id === progressId) || null;
    }

    const { data, error } = await supabase
      .from('saved_progresses')
      .select('*')
      .eq('id', progressId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to localStorage on error
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      return localProgresses.find((p: any) => p.id === progressId) || null;
    }

    return data;
  } catch (error) {
    console.error('Error loading progress:', error);
    // Fallback to localStorage on any error
    try {
      const user = getCurrentUser();
      if (!user) return null;
      const localProgresses = JSON.parse(localStorage.getItem(`savedProgresses_${user.username}`) || '[]');
      return localProgresses.find((p: any) => p.id === progressId) || null;
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return null;
    }
  }
}