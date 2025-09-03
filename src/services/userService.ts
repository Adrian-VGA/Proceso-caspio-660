import { supabase } from '../lib/supabase';

// Lista de usuarios válidos con sus proyectos
const validUsers = [
  '676', '684', '680', '662', '660', '667', '664', 
  '675', '674', '668', '679', '678', '681', '682', 
  '677', '663', '683', '673'
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

    const { error } = await supabase
      .from('saved_progresses')
      .insert({
        user_id: user.username,
        name: name,
        survey_data: surveyData,
        participant_data: participantData,
        goals: goals
      });

    return !error;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
}

export async function loadUserProgresses(): Promise<any[]> {
  try {
    const user = getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('saved_progresses')
      .select('*')
      .eq('user_id', user.username)
      .order('created_at', { ascending: false });

    return error ? [] : data;
  } catch (error) {
    console.error('Error loading progresses:', error);
    return [];
  }
}

export async function loadProgress(progressId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('saved_progresses')
      .select('*')
      .eq('id', progressId)
      .single();

    return error ? null : data;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}