
import { sql } from '@vercel/postgres';

const groupById = (rows, key = 'athlete_id') => {
  const grouped = {};
  rows.forEach(r => {
    if (!grouped[r[key]]) grouped[r[key]] = [];
    grouped[r[key]].push(r);
  });
  return grouped;
};

export default async function handler(request, response) {
  try {
    const [
      athletesRes, wellnessRes, workoutsRes, exercisesRes, performedSetsRes,
      bioRes, strengthRes, cmjRes, vo2Res
    ] = await Promise.all([
      sql`SELECT * FROM athletes ORDER BY name ASC`,
      sql`SELECT * FROM wellness ORDER BY date DESC`,
      sql`SELECT * FROM workouts ORDER BY date DESC`,
      sql`SELECT * FROM prescribed_exercises`,
      sql`SELECT * FROM performed_sets`,
      sql`SELECT * FROM bioimpedance`,
      sql`SELECT * FROM isometric_strength`,
      sql`SELECT * FROM cmj`,
      sql`SELECT * FROM vo2max`,
    ]);

    const setsByEx = groupById(performedSetsRes.rows, 'exercise_id');
    const exByWorkout = groupById(exercisesRes.rows, 'workout_id');
    const wellnessByAth = groupById(wellnessRes.rows);
    const workoutsByAth = groupById(workoutsRes.rows);
    const bioByAth = groupById(bioRes.rows);
    const strengthByAth = groupById(strengthRes.rows);
    const cmjByAth = groupById(cmjRes.rows);
    const vo2ByAth = groupById(vo2Res.rows);

    const athletes = athletesRes.rows.map(a => ({
      id: a.id,
      name: a.name,
      dob: a.dob,
      injuryHistory: a.injury_history,
      wellness: (wellnessByAth[a.id] || []).map(w => ({ 
        id: w.id, date: w.date, fatigue: w.fatigue, sleep: w.sleep, stress: w.stress, soreness: w.soreness, mood: w.mood, 
        cognitiveLoad: w.cognitive_load, readiness_score: w.readiness_score 
      })),
      workouts: (workoutsByAth[a.id] || []).map(wk => ({
        id: wk.id, date: wk.date, name: wk.name, phase: wk.phase, status: wk.status, rpe: wk.rpe, totalLoad: wk.total_load, 
        durationMinutes: wk.duration_minutes, monotony: wk.monotony, strain: wk.strain, feedback: wk.feedback,
        exercises: (exByWorkout[wk.id] || []).map(ex => ({ 
          id: ex.id, 
          name: ex.name, 
          muscleGroup: ex.muscle_group, 
          sets: ex.sets, 
          reps: ex.reps, 
          weight: ex.weight, 
          rest: ex.rest, 
          notes: ex.notes,
          performedSets: (setsByEx[ex.id] || []).map(ps => ({ reps: ps.reps, weight: ps.weight, rpe: ps.rpe }))
        }))
      })),
      assessments: {
        bioimpedance: (bioByAth[a.id] || []),
        isometricStrength: (strengthByAth[a.id] || []).map(s => ({
          id: s.id, date: s.date, halfSquatKgf: s.half_squat_kgf, quadricepsR: s.quadriceps_r, quadricepsL: s.quadriceps_l,
          hamstringsR: s.hamstrings_r, hamstringsL: s.hamstrings_l, rfdPeak: s.rfd_peak, observations: s.observations
        })),
        generalStrength: [],
        cmj: (cmjByAth[a.id] || []).map(c => ({
          id: c.id, date: c.date, height: c.height, power: c.power, depth: c.depth, rsi: c.rsi, observations: c.observations
        })),
        vo2max: (vo2ByAth[a.id] || []),
      }
    }));

    return response.status(200).json(athletes);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
