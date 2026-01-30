
import { db } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ message: 'Apenas POST' });

  const athletes = request.body;
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    
    // Para manter a simplicidade do modelo de "sync total", limpamos as tabelas dependentes
    // Mas agora fazemos de forma mais controlada.
    await client.query('DELETE FROM wellness');
    await client.query('DELETE FROM bioimpedance');
    await client.query('DELETE FROM isometric_strength');
    await client.query('DELETE FROM cmj');
    await client.query('DELETE FROM vo2max');
    await client.query('DELETE FROM workouts'); 
    // Cascade cuidará de prescribed_exercises e performed_sets

    for (const athlete of athletes) {
      await client.query(
        'INSERT INTO athletes (id, name, dob, injury_history) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, dob = $3, injury_history = $4',
        [athlete.id, athlete.name, athlete.dob, athlete.injuryHistory]
      );
      
      for (const w of (athlete.wellness || [])) {
        await client.query(
          'INSERT INTO wellness (id, athlete_id, date, fatigue, sleep, stress, soreness, mood, cognitive_load, readiness_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [w.id, athlete.id, w.date, w.fatigue, w.sleep, w.stress, w.soreness, w.mood, w.cognitiveLoad, w.readinessScore]
        );
      }

      for (const wk of (athlete.workouts || [])) {
        await client.query(
          'INSERT INTO workouts (id, athlete_id, date, name, phase, status, rpe, total_load, duration_minutes, monotony, strain, feedback) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
          [wk.id, athlete.id, wk.date, wk.name, wk.phase, wk.status, wk.rpe, wk.totalLoad, wk.durationMinutes, wk.monotony, wk.strain, wk.feedback]
        );
        for (const ex of (wk.exercises || [])) {
          await client.query(
            'INSERT INTO prescribed_exercises (id, workout_id, name, muscle_group, sets, reps, weight, rest, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [ex.id, wk.id, ex.name, ex.muscleGroup, ex.sets, ex.reps, ex.weight, ex.rest, ex.notes]
          );
          
          if (ex.performedSets && ex.performedSets.length > 0) {
            for (const set of ex.performedSets) {
              await client.query(
                'INSERT INTO performed_sets (exercise_id, reps, weight, rpe) VALUES ($1, $2, $3, $4)',
                [ex.id, set.reps, set.weight, set.rpe]
              );
            }
          }
        }
      }

      for (const asm of (athlete.assessments.bioimpedance || [])) {
        await client.query('INSERT INTO bioimpedance (id, athlete_id, date, weight, fat_percentage, muscle_mass, visceral_fat, hydration, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [asm.id, athlete.id, asm.date, asm.weight, asm.fatPercentage, asm.muscleMass, asm.visceralFat, asm.hydration, asm.observations]);
      }
      for (const asm of (athlete.assessments.isometricStrength || [])) {
        await client.query('INSERT INTO isometric_strength (id, athlete_id, date, half_squat_kgf, quadriceps_r, quadriceps_l, hamstrings_r, hamstrings_l, rfd_peak, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [asm.id, athlete.id, asm.date, asm.halfSquatKgf, asm.quadricepsR, asm.quadricepsL, asm.hamstringsR, asm.hamstringsL, asm.rfdPeak, asm.observations]);
      }
      for (const asm of (athlete.assessments.cmj || [])) {
        await client.query('INSERT INTO cmj (id, athlete_id, date, height, power, depth, rsi, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [asm.id, athlete.id, asm.date, asm.height, asm.power, asm.depth, asm.rsi, asm.observations]);
      }
      for (const asm of (athlete.assessments.vo2max || [])) {
        await client.query('INSERT INTO vo2max (id, athlete_id, date, vo2max, max_heart_rate, threshold_heart_rate, max_ventilation, threshold_ventilation, max_load, threshold_load, vam, rec10s, rec30s, rec60s, score, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)', [asm.id, athlete.id, asm.date, asm.vo2max, asm.maxHeartRate, asm.thresholdHeartRate, asm.maxVentilation, asm.thresholdVentilation, asm.maxLoad, asm.thresholdLoad, asm.vam, asm.rec10s, asm.rec30s, asm.rec60s, asm.score, asm.observations]);
      }
    }

    await client.query('COMMIT');
    return response.status(200).json({ message: 'Sincronizado!' });
  } catch (error) {
    await client.query('ROLLBACK');
    return response.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
