
import { useState, useEffect } from 'react';
import { Athlete, AssessmentType, WellnessEntry, Workout } from './types';
import { calculateReadiness, calculateWorkoutLoad, calculateAdvancedMetrics } from './utils';
import toast from 'react-hot-toast';
import { GoogleGenAI } from "@google/genai";

export const useAthletes = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  const api = {
    async loadAthletes(): Promise<Athlete[]> {
      try {
        const response = await fetch('/api/ler');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) return data;
        }
        return [];
      } catch (error) {
        console.error('API Error:', error);
        return [];
      }
    },
    async saveAthletes(athletes: Athlete[]): Promise<void> {
      await fetch('/api/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athletes),
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    api.loadAthletes().then(data => setAthletes(data)).finally(() => setLoading(false));
  }, []);

  const save = async (newAthletes: Athlete[]) => {
    setAthletes(newAthletes);
    try {
      await api.saveAthletes(newAthletes);
    } catch (e) {
      toast.error("Erro ao sincronizar com servidor.");
    }
  };

  const addWellness = async (athleteId: string, entry: Omit<WellnessEntry, 'id' | 'readinessScore'>) => {
    const score = calculateReadiness(entry);
    const updated = athletes.map(a => {
      if (a.id === athleteId) {
        return { ...a, wellness: [{ ...entry, id: `w-${Date.now()}`, readinessScore: score }, ...a.wellness] };
      }
      return a;
    });
    await save(updated);
    toast.success("Perfil de prontidão registrado!");
  };

  const addWorkout = async (athleteId: string, workout: Omit<Workout, 'id'>) => {
    const updated = athletes.map(a => {
      if (a.id === athleteId) {
        return { ...a, workouts: [{ ...workout, id: `wk-${Date.now()}` }, ...a.workouts] };
      }
      return a;
    });
    await save(updated);
    toast.success("Treino prescrito!");
  };

  const updateWorkout = async (athleteId: string, workout: Workout) => {
    if (workout.status === 'completed') {
      workout.totalLoad = calculateWorkoutLoad(workout);
      const athlete = athletes.find(a => a.id === athleteId);
      if (athlete) {
        const history = [workout, ...athlete.workouts.filter(w => w.id !== workout.id)];
        const { monotony, strain } = calculateAdvancedMetrics(history);
        workout.monotony = monotony;
        workout.strain = strain;
      }
    }
    
    const updated = athletes.map(a => {
      if (a.id === athleteId) {
        return { ...a, workouts: a.workouts.map(w => w.id === workout.id ? workout : w) };
      }
      return a;
    });
    await save(updated);
  };

  const copyWorkout = async (targetAthleteId: string, workout: Workout) => {
    const updated = athletes.map(a => {
      if (a.id === targetAthleteId) {
        const newWorkout = { 
          ...workout, 
          id: `wk-copy-${Date.now()}`, 
          date: new Date().toISOString(), 
          status: 'planned' as const,
          totalLoad: undefined,
          rpe: undefined,
          feedback: undefined,
          exercises: workout.exercises.map(ex => ({ ...ex, performedSets: undefined, trainerFeedback: undefined }))
        };
        return { ...a, workouts: [newWorkout, ...a.workouts] };
      }
      return a;
    });
    await save(updated);
    toast.success("Treino copiado com sucesso!");
  };

  const addAssessment = async (athleteId: string, type: AssessmentType, data: any) => {
    const updated = athletes.map(a => {
      if (a.id === athleteId) {
        const assessments = { ...a.assessments, [type]: [{ ...data, id: `asm-${Date.now()}` }, ...a.assessments[type]] };
        return { ...a, assessments };
      }
      return a;
    });
    await save(updated);
    toast.success(`Avaliação de ${type} salva!`);
  };

  const updateAssessment = async (athleteId: string, type: AssessmentType, assessmentId: string, data: any) => {
    const updated = athletes.map(a => {
      if (a.id === athleteId) {
        const updatedType = a.assessments[type].map(asm => asm.id === assessmentId ? { ...data, id: assessmentId } : asm);
        return { ...a, assessments: { ...a.assessments, [type]: updatedType } };
      }
      return a;
    });
    await save(updated);
    toast.success(`Avaliação atualizada!`);
  };

  const addAthlete = async (data: any) => {
    const newA: Athlete = { 
      ...data, 
      id: `ath-${Date.now()}`, 
      assessments: { bioimpedance: [], isometricStrength: [], generalStrength: [], cmj: [], vo2max: [] }, 
      wellness: [], 
      workouts: [] 
    };
    await save([...athletes, newA]);
    toast.success("Atleta cadastrado!");
  };

  const addTestAthlete = async () => {
    const testId = `ath-test-${Date.now()}`;
    const testAthlete: Athlete = {
      id: testId,
      name: "Atleta Teste",
      dob: "1995-05-15",
      injuryHistory: "Nenhuma relevante.",
      assessments: {
        bioimpedance: [{ id: 'b1', date: new Date().toISOString(), weight: 80, fatPercentage: 12, muscleMass: 40, visceralFat: 3, hydration: 65 }],
        isometricStrength: [{ id: 'i1', date: new Date().toISOString(), halfSquatKgf: 180, quadricepsR: 80, quadricepsL: 75, hamstringsR: 50, hamstringsL: 45 }],
        generalStrength: [],
        cmj: [{ id: 'c1', date: new Date().toISOString(), height: 40, power: 4500, depth: 30, rsi: 1.5 }],
        vo2max: [{ id: 'v1', date: new Date().toISOString(), vo2max: 55, maxHeartRate: 190, thresholdHeartRate: 165, maxVentilation: 140, thresholdVentilation: 110, maxLoad: 350, thresholdLoad: 280, vam: 17, rec10s: 15, rec30s: 30, rec60s: 50, score: 80 }]
      },
      wellness: [{ id: 'w1', date: new Date().toISOString(), fatigue: 2, sleep: 4, stress: 2, soreness: 2, mood: 4, cognitiveLoad: 2, readinessScore: 85 }],
      workouts: []
    };
    await save([...athletes, testAthlete]);
  };

  const analyzePerformance = async (athlete: Athlete): Promise<string> => {
    // API_KEY é injetada via ambiente pelo Render
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const prompt = `
      Você é um especialista em ciência do esporte de elite da LB Performance.
      Analise os seguintes dados do atleta ${athlete.name}:
      - Bem-estar recente (prontidão): ${JSON.stringify(athlete.wellness.slice(0, 3))}
      - Últimos treinos (RPE e Carga): ${JSON.stringify(athlete.workouts.slice(0, 5))}
      - Histórico de lesões: ${athlete.injuryHistory}
      
      Forneça um relatório curto em português, em formato Markdown, focando em:
      1. Risco de lesão atual baseado na carga (ACWR e Monotonia).
      2. Recomendações para os próximos 3 dias.
      3. Pontos de atenção na recuperação.
    `;
    try {
      const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Não foi possível gerar a análise.";
    } catch (e) {
      console.error(e);
      return "Análise indisponível no momento devido a um erro técnico.";
    }
  };

  return { athletes, loading, addAthlete, addWellness, addWorkout, updateWorkout, copyWorkout, addAssessment, updateAssessment, analyzePerformance, addTestAthlete };
};
