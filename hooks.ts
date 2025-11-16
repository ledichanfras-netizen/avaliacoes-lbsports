

import { useState, useEffect } from 'react';
// FIX: Import GeneralStrengthExercise to use enum members directly and ensure type safety.
import { Athlete, AssessmentData, AssessmentType, GeneralStrengthExercise } from './types';
import toast from 'react-hot-toast';

const MOCK_ATHLETES: Athlete[] = [
    {
      id: '1',
      name: 'Carlos Alexandre',
      dob: '1982-05-20',
      injuryHistory: 'Nenhuma lesão significativa reportada.',
      assessments: {
        bioimpedance: [
          { id: 'b1', date: '2023-10-15', weight: 84.0, fatPercentage: 18.5, muscleMass: 38.2, visceralFat: 8, hydration: 55 },
          { id: 'b2', date: '2024-01-20', weight: 83.5, fatPercentage: 17.2, muscleMass: 38.9, visceralFat: 7, hydration: 57 },
          { id: 'b3', date: '2024-04-25', weight: 83.3, fatPercentage: 16.8, muscleMass: 39.1, visceralFat: 7, hydration: 58, observations: 'Manter o foco na hidratação e continuar com o plano de treino para ganho de massa magra. Resultados excelentes.' },
        ],
        isometricStrength: [
           { id: 'is-2', date: '2024-01-20', quadricepsR: 35.5, quadricepsL: 36.0, hamstringsR: 19.0, hamstringsL: 21.0, observations: 'Força bem equilibrada, continuar o trabalho de manutenção.' },
           { id: 'is1', date: '2024-04-25', quadricepsR: 37.02, quadricepsL: 38.07, hamstringsR: 20.10, hamstringsL: 22.01, observations: 'Razão I/Q da perna direita um pouco elevada. Focar em exercícios de fortalecimento para isquiotibiais da perna direita para reequilibrar.' },
        ],
        generalStrength: [
          // FIX: Used the enum member for type safety, removing the 'as any' cast.
          { id: 'gs1', date: '2024-04-25', exercise: GeneralStrengthExercise.HALF_SQUAT, load: 120 },
          { id: 'gs2', date: '2024-01-20', exercise: GeneralStrengthExercise.HALF_SQUAT, load: 110 },
          { id: 'gs3', date: '2024-04-25', exercise: GeneralStrengthExercise.BENCH_PRESS, load: 80 },
          { id: 'gs4', date: '2024-01-20', exercise: GeneralStrengthExercise.BENCH_PRESS, load: 75 },
          { id: 'gs5', date: '2024-04-25', exercise: GeneralStrengthExercise.ROW, load: 70 },
        ],
        cmj: [
          { id: 'cmj1', date: '2024-04-25', height: 30.41, power: 3776, depth: 15.2, unilateralJumpR: 25.1, unilateralJumpL: 24.5, load: 0 },
        ],
        vo2max: [
          { id: 'v1', date: '2024-04-25', vo2max: 51.38, maxHeartRate: 162, thresholdHeartRate: 148, maxVentilation: 149.5, thresholdVentilation: 123.66, maxLoad: 16, thresholdLoad: 13, vam: 15.66, rec10s: -19, rec30s: -37, rec60s: -57, score: 81 },
        ]
      },
    },
    {
        id: '2',
        name: 'Manuela Silva',
        dob: '1995-11-10',
        injuryHistory: 'Entorse de tornozelo esquerdo em 2022.',
        assessments: {
            bioimpedance: [
                { id: 'm-b1', date: '2024-05-01', weight: 62.0, fatPercentage: 22.1, muscleMass: 28.5, visceralFat: 4, hydration: 54 },
            ],
            isometricStrength: [],
            generalStrength: [],
            cmj: [],
            vo2max: []
        }
    }
  ];

// Function to save athletes to localStorage
const saveAthletesToStorage = (athletesToSave: Athlete[]) => {
    try {
        localStorage.setItem('lb_sports_athletes', JSON.stringify(athletesToSave));
    } catch (error) {
        console.error("Failed to save athletes to localStorage", error);
        toast.error("Erro ao salvar os dados.");
    }
};

export const useAthletes = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  // Effect to load athletes from localStorage on initial render
  useEffect(() => {
    try {
      const storedAthletes = localStorage.getItem('lb_sports_athletes');
      if (storedAthletes) {
        setAthletes(JSON.parse(storedAthletes));
      } else {
        setAthletes(MOCK_ATHLETES);
      }
    } catch (error) {
      console.error("Failed to load athletes from localStorage", error);
      setAthletes(MOCK_ATHLETES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to automatically save athletes to localStorage whenever the data changes
  useEffect(() => {
    if (!loading) {
      saveAthletesToStorage(athletes);
    }
  }, [athletes, loading]);

  const addAthlete = (athlete: Omit<Athlete, 'id' | 'assessments'>) => {
    const newAthlete: Athlete = {
      ...athlete,
      id: new Date().toISOString(),
      assessments: {
        bioimpedance: [],
        isometricStrength: [],
        generalStrength: [],
        cmj: [],
        vo2max: [],
      },
    };
    setAthletes(prev => [...prev, newAthlete]);
    toast.success(`${athlete.name} adicionado(a) com sucesso!`);
  };

  const updateAthlete = (updatedAthlete: Athlete) => {
    setAthletes(prev => prev.map(a => a.id === updatedAthlete.id ? updatedAthlete : a));
    toast.success(`${updatedAthlete.name} atualizado(a) com sucesso!`);
  };
  
  const deleteAthlete = (athleteId: string) => {
    setAthletes(prev => prev.filter(a => a.id !== athleteId));
    toast.success("Atleta excluído com sucesso.");
  };

  const addAssessment = (athleteId: string, type: AssessmentType, data: Omit<AssessmentData, 'id'>) => {
    const newAssessment = {
      ...data,
      id: new Date().toISOString(),
      date: data.date, // Explicitly use the date from the form data
    } as AssessmentData;

    setAthletes(prev => prev.map(athlete => {
      if (athlete.id === athleteId) {
        const updatedAssessments = {
          ...athlete.assessments,
          [type]: [...athlete.assessments[type], newAssessment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
        return { ...athlete, assessments: updatedAssessments };
      }
      return athlete;
    }));
    toast.success(`Nova avaliação de ${type} adicionada.`);
  };

  const updateAssessment = (athleteId: string, type: AssessmentType, updatedData: AssessmentData) => {
    setAthletes(prev => prev.map(athlete => {
        if (athlete.id === athleteId) {
            const updatedAssessmentsList = athlete.assessments[type]
                .map(asm => asm.id === updatedData.id ? updatedData : asm)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return {
                ...athlete,
                assessments: {
                    ...athlete.assessments,
                    [type]: updatedAssessmentsList
                }
            };
        }
        return athlete;
    }));
    toast.success(`Avaliação de ${type} atualizada.`);
  };

  const deleteAssessment = (athleteId: string, type: AssessmentType, assessmentId: string) => {
    setAthletes(prev => prev.map(athlete => {
        if (athlete.id === athleteId) {
            const updatedAssessmentsList = athlete.assessments[type].filter(asm => asm.id !== assessmentId);
            const latestAssessments = updatedAssessmentsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return {
                ...athlete,
                assessments: {
                    ...athlete.assessments,
                    [type]: latestAssessments
                }
            };
        }
        return athlete;
    }));
    toast.success(`Avaliação de ${type} excluída com sucesso.`);
  };


  return { athletes, loading, addAthlete, updateAthlete, deleteAthlete, addAssessment, updateAssessment, deleteAssessment };
};