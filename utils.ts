
import { IQRatio, WellnessEntry, Workout } from './types';

export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const calculateReadiness = (w: Omit<WellnessEntry, 'id' | 'readinessScore'>): number => {
  const sleepPts = w.sleep * 3.5;
  const moodPts = w.mood * 3.5;
  const cognitivePts = (6 - w.cognitiveLoad) * 3;
  const fatiguePts = (6 - w.fatigue) * 3;
  const stressPts = (6 - w.stress) * 3;
  const sorenessPts = (6 - w.soreness) * 4;
  return Math.min(100, Math.round(sleepPts + moodPts + cognitivePts + fatiguePts + stressPts + sorenessPts));
};

export const calculateWorkoutLoad = (workout: Workout): number => {
  let total = 0;
  workout.exercises.forEach(ex => {
    if (ex.performedSets) {
      ex.performedSets.forEach(set => {
        total += (set.reps || 0) * (set.weight || 0);
      });
    }
  });
  return total;
};

export const calculateWorkoutInternalLoad = (workout: Workout): number => {
  return (workout.rpe || 0) * (workout.durationMinutes || 60);
};

export const calculateAdvancedMetrics = (workouts: Workout[]) => {
  const completedWorkouts = workouts.filter(w => w.status === 'completed' && w.rpe);
  const last7Days = completedWorkouts.slice(0, 7);

  if (last7Days.length === 0) return { monotony: 0, strain: 0 };

  const internalLoads = last7Days.map(w => calculateWorkoutInternalLoad(w));
  const sumLoad = internalLoads.reduce((a, b) => a + b, 0);
  const meanLoad = sumLoad / last7Days.length;
  
  const variance = internalLoads.reduce((a, b) => a + Math.pow(b - meanLoad, 2), 0) / last7Days.length;
  const stdDev = Math.sqrt(variance);

  const monotony = stdDev > 0 ? parseFloat((meanLoad / stdDev).toFixed(2)) : 1.0;
  const strain = Math.round(sumLoad * monotony);

  return { monotony, strain };
};

export const calculateACWR = (workouts: Workout[]): { ratio: number; status: 'optimal' | 'danger' | 'detraining' | 'warning' } => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  const completed = workouts.filter(w => w.status === 'completed');

  const acuteLoad = completed
    .filter(w => new Date(w.date) >= sevenDaysAgo)
    .reduce((acc, w) => acc + calculateWorkoutInternalLoad(w), 0);

  const chronicLoadTotal = completed
    .filter(w => new Date(w.date) >= twentyEightDaysAgo)
    .reduce((acc, w) => acc + calculateWorkoutInternalLoad(w), 0);
  
  const chronicLoadAverage = (chronicLoadTotal / 4) || 1;

  const ratio = parseFloat((acuteLoad / chronicLoadAverage).toFixed(2));

  let status: 'optimal' | 'danger' | 'detraining' | 'warning' = 'optimal';
  if (ratio > 1.5) status = 'danger';
  else if (ratio > 1.3) status = 'warning';
  else if (ratio < 0.8) status = 'detraining';

  return { ratio, status };
};

export const calculateAsymmetry = (sideA: number, sideB: number): number => {
  if (!sideA || !sideB) return 0;
  const max = Math.max(sideA, sideB);
  const min = Math.min(sideA, sideB);
  return parseFloat(((max - min) / max * 100).toFixed(1));
};

export const interpretAsymmetry = (asymmetry: number) => {
  if (asymmetry <= 10) return { label: 'Elite', color: 'text-green-500', bg: 'bg-green-500/10' };
  if (asymmetry <= 15) return { label: 'Risco Latente', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  return { label: 'Risco Crítico', color: 'text-red-500', bg: 'bg-red-500/10' };
};

export const calculateIQRatios = (quadR: number, quadL: number, hamR: number, hamL: number): { right: IQRatio; left: IQRatio } => {
  const calculateRatio = (hamstring: number, quadriceps: number): IQRatio => {
    if (!quadriceps) return { ratio: 0, status: 'bad' };
    const ratio = (hamstring / quadriceps) * 100;
    let status: 'good' | 'bad' | 'warning' = 'warning';
    if (ratio >= 60 && ratio <= 75) status = 'good';
    else if (ratio < 50 || ratio > 80) status = 'bad';
    return { ratio: parseFloat(ratio.toFixed(1)), status };
  };
  return {
    right: calculateRatio(hamR, quadR),
    left: calculateRatio(hamL, quadL),
  };
};

export const calculateRSI = (heightCm: number, timeToTakeoffMs: number): number => {
    if (!heightCm || !timeToTakeoffMs) return 0;
    // RSI-modified = Jump Height (m) / Time to Take-off (s)
    const heightM = heightCm / 100;
    const timeS = timeToTakeoffMs / 1000;
    return parseFloat((heightM / timeS).toFixed(2));
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};
