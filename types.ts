
export interface Athlete {
  id: string;
  name: string;
  dob: string;
  injuryHistory: string;
  assessments: {
    bioimpedance: Bioimpedance[];
    isometricStrength: IsometricStrength[];
    generalStrength: GeneralStrength[];
    cmj: Cmj[];
    vo2max: Vo2max[];
  };
  wellness: WellnessEntry[];
  workouts: Workout[];
}

export interface WellnessEntry {
  id: string;
  date: string;
  fatigue: number; // 1-5
  sleep: number;   // 1-5
  stress: number;  // 1-5
  soreness: number; // 1-5
  mood: number;    // 1-5
  cognitiveLoad: number; // 1-5
  readinessScore?: number; // 0-100
}

export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe: number; // RPE per set for real-time control
}

export interface PrescribedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string; 
  weight: string;
  rest?: string;
  notes?: string;
  performedSets?: ExerciseSet[];
  trainerFeedback?: string;
}

export interface Workout {
  id: string;
  date: string;
  name: string;
  phase: string;
  status: 'planned' | 'completed' | 'in_progress';
  exercises: PrescribedExercise[];
  totalLoad?: number; 
  rpe?: number; // Session RPE
  durationMinutes?: number; 
  monotony?: number; 
  strain?: number;   
  feedback?: string;
  trainerNotes?: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface Assessment {
  id: string;
  date: string;
  observations?: string;
}

export interface Bioimpedance extends Assessment {
  weight: number; 
  fatPercentage: number;
  muscleMass: number; 
  visceralFat: number;
  hydration: number; 
}

export interface IsometricStrength extends Assessment {
  halfSquatKgf: number;
  quadricepsR: number; 
  quadricepsL: number; 
  hamstringsR: number; 
  hamstringsL: number; 
  rfdPeak?: number; 
}

export enum GeneralStrengthExercise {
  HALF_SQUAT = "Meio Agachamento",
  ROW = "Remada",
  BENCH_PRESS = "Supino",
}

export interface GeneralStrength extends Assessment {
  exercise: GeneralStrengthExercise;
  load: number; 
}

export interface Cmj extends Assessment {
  height: number; 
  power: number; 
  depth: number; 
  timeToTakeoff?: number; // Required for RSI calculation
  rsi?: number; 
}

export interface Vo2max extends Assessment {
  vo2max: number; 
  maxHeartRate: number; 
  thresholdHeartRate: number; 
  maxVentilation: number; 
  thresholdVentilation: number; 
  maxLoad: number; 
  thresholdLoad: number; 
  vam: number; 
  rec10s: number; 
  rec30s: number; 
  rec60s: number; 
  score: number; 
}

export type AssessmentType = 'bioimpedance' | 'isometricStrength' | 'generalStrength' | 'cmj' | 'vo2max';

export interface IQRatio {
  ratio: number;
  status: 'good' | 'bad' | 'warning';
}
