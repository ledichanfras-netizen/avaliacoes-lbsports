
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS athletes (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dob VARCHAR(255) NOT NULL,
        injury_history TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS wellness (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        fatigue INTEGER,
        sleep INTEGER,
        stress INTEGER,
        soreness INTEGER,
        mood INTEGER,
        cognitive_load INTEGER,
        readiness_score INTEGER
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phase VARCHAR(100),
        status VARCHAR(50),
        rpe INTEGER,
        total_load REAL,
        duration_minutes INTEGER,
        monotony REAL,
        strain REAL,
        feedback TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS prescribed_exercises (
        id TEXT PRIMARY KEY,
        workout_id TEXT REFERENCES workouts(id) ON DELETE CASCADE,
        name VARCHAR(255),
        muscle_group VARCHAR(100),
        sets INTEGER,
        reps VARCHAR(50),
        weight VARCHAR(50),
        rest VARCHAR(50),
        notes TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS performed_sets (
        id SERIAL PRIMARY KEY,
        exercise_id TEXT REFERENCES prescribed_exercises(id) ON DELETE CASCADE,
        reps INTEGER,
        weight REAL,
        rpe INTEGER
      );
    `;

    await sql`CREATE TABLE IF NOT EXISTS bioimpedance (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, weight REAL, fat_percentage REAL, muscle_mass REAL, visceral_fat REAL, hydration REAL, observations TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS isometric_strength (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, half_squat_kgf REAL, quadriceps_r REAL, quadriceps_l REAL, hamstrings_r REAL, hamstrings_l REAL, rfd_peak REAL, observations TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS general_strength (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, exercise VARCHAR(255), "load" REAL, observations TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS cmj (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, height REAL, power REAL, depth REAL, rsi REAL, observations TEXT);`;
    await sql`CREATE TABLE IF NOT EXISTS vo2max (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, vo2max REAL, max_heart_rate REAL, threshold_heart_rate REAL, max_ventilation REAL, threshold_ventilation REAL, max_load REAL, threshold_load REAL, vam REAL, rec10s REAL, rec30s REAL, rec60s REAL, score REAL, observations TEXT);`;
    
    return response.status(200).json({ message: "Esquema atualizado com sucesso!" });
  } catch (error) {
    return response.status(500).json({ error: `Erro ao criar tabelas: ${error.message}` });
  }
}
