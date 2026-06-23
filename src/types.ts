export interface CandidateProfile {
  name: string;
  module: string; // 'M1' | 'M2' | 'M3' | 'M5' or some subtopic
  customTopic?: string;
  experience: string; // e.g. 'Aucun', 'ASH', 'Vendeur', 'Étudiant'
  motivation: string;
}

export interface Question {
  index: number;
  text: string;
}

export interface AnswerItem {
  questionIndex: number;
  questionText: string;
  answerText: string;
  grade: number; // out of 20
  strengths: string[];
  weaknesses: string[];
  feedbackText: string;
  juryResponse: string; // The relance question or follow-up
}

export interface ReportFeedback {
  globalScore: number; // out of 20
  skills: {
    name: string;
    score: number; // out of 20
    comment: string;
  }[];
  generalComments: string;
  keyStrengths: string[];
  improvementSuggestions: string[];
  finalVerdict: string; // e.g., 'Admis', 'Excellent', 'À travailler'
}

export interface PastSession {
  id: string;
  date: string;
  candidateName: string;
  experience: string;
  globalScore: number;
  finalVerdict: string;
  feedback: ReportFeedback;
  history: AnswerItem[];
}

