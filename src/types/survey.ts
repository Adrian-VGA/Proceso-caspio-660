export interface SurveyData {
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
  'G9-11': Participant[];
  'G12-14': Participant[];
  'G15-18': Participant[];
  'G19+': Participant[];
  'STAFF': Participant[];
}

export interface GroupConfig {
  key: keyof SurveyData;
  title: string;
  color: string;
  surveyType: string;
  description: string;
}