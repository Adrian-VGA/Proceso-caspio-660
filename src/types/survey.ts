export interface SurveyData {
  'G6-8': number;
  'G9-11': number;
  'G12-14': number;
  'G15-18': number;
  'G19+': number;
  'STAFF': number;
}

export interface Participant {
  id: string;
  code: string;
  name: string;
  group: keyof SurveyData;
  timestamp: string;
}

export interface ParticipantData {
  'G6-8': Participant[];
  'G9-11': Participant[];
  'G12-14': Participant[];
  'G15-18': Participant[];
  'G19+': Participant[];
  'STAFF': Participant[];
}

export interface SavedProgress {
  id: string;
  name: string;
  created_at: string;
  survey_data: SurveyData;
  participant_data: ParticipantData;
  goals: SurveyData;
  user_id: string;
}

export interface UserProfile {
  id: string;
  username: string;
  projectNumber: string;
  surveyData: SurveyData;
  goals: SurveyData;
  participantData: ParticipantData;
  savedProgresses: SavedProgress[];
}

export interface UserGoals {
  'G6-8': number;
  'G9-11': number;
  'G12-14': number;
  'G15-18': number;
  'G19+': number;
  'STAFF': number;
}