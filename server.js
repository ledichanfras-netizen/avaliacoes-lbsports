
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuração do Banco de Dados (Render usa DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- API ROUTES ---

// Rota de Setup (Inicialização do Banco)
app.get('/api/setup', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS athletes (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dob VARCHAR(255) NOT NULL,
        injury_history TEXT
      );
    `);
    await client.query(`
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
    `);
    await client.query(`
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
    `);
    await client.query(`
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
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS performed_sets (
        id SERIAL PRIMARY KEY,
        exercise_id TEXT REFERENCES prescribed_exercises(id) ON DELETE CASCADE,
        reps INTEGER,
        weight REAL,
        rpe INTEGER
      );
    `);
    await client.query(`CREATE TABLE IF NOT EXISTS bioimpedance (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, weight REAL, fat_percentage REAL, muscle_mass REAL, visceral_fat REAL, hydration REAL, observations TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS isometric_strength (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, half_squat_kgf REAL, quadriceps_r REAL, quadriceps_l REAL, hamstrings_r REAL, hamstrings_l REAL, rfd_peak REAL, observations TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS cmj (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, height REAL, power REAL, depth REAL, rsi REAL, observations TEXT);`);
    await client.query(`CREATE TABLE IF NOT EXISTS vo2max (id TEXT PRIMARY KEY, athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE, date VARCHAR(255) NOT NULL, vo2max REAL, max_heart_rate REAL, threshold_heart_rate REAL, max_ventilation REAL, threshold_ventilation REAL, max_load REAL, threshold_load REAL, vam REAL, rec10s REAL, rec30s REAL, rec60s REAL, score REAL, observations TEXT);`);
    
    await client.query('COMMIT');
    res.json({ message: "Banco de dados configurado com sucesso!" });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Rota para Ler Dados
app.get('/api/ler', async (req, res) => {
  try {
    const athletesRes = await pool.query('SELECT * FROM athletes ORDER BY name ASC');
    const wellnessRes = await pool.query('SELECT * FROM wellness ORDER BY date DESC');
    const workoutsRes = await pool.query('SELECT * FROM workouts ORDER BY date DESC');
    const exercisesRes = await pool.query('SELECT * FROM prescribed_exercises');
    const performedSetsRes = await pool.query('SELECT * FROM performed_sets');
    const bioRes = await pool.query('SELECT * FROM bioimpedance');
    const strengthRes = await pool.query('SELECT * FROM isometric_strength');
    const cmjRes = await pool.query('SELECT * FROM cmj');
    const vo2Res = await pool.query('SELECT * FROM vo2max');

    const groupById = (rows, key = 'athlete_id') => {
      const grouped = {};
      rows.forEach(r => {
        if (!grouped[r[key]]) grouped[r[key]] = [];
        grouped[r[key]].push(r);
      });
      return grouped;
    };

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
        cognitiveLoad: w.cognitive_load, readinessScore: w.readiness_score 
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
          performedSets: (setsByEx[ex.id] || []).map(ps => ({ reps: ps.reps, weight: ps.weight, rpe: ps.rpe }))
        }))
      })),
      assessments: {
        bioimpedance: bioByAth[a.id] || [],
        isometricStrength: (strengthByAth[a.id] || []).map(s => ({
            id: s.id, date: s.date, halfSquatKgf: s.half_squat_kgf, quadricepsR: s.quadriceps_r, quadricepsL: s.quadriceps_l,
            hamstringsR: s.hamstrings_r, hamstringsL: s.hamstrings_l, rfdPeak: s.rfd_peak, observations: s.observations
        })),
        generalStrength: [],
        cmj: (cmjByAth[a.id] || []).map(c => ({
            id: c.id, date: c.date, height: c.height, power: c.power, depth: c.depth, rsi: c.rsi, observations: c.observations
        })),
        vo2max: vo2ByAth[a.id] || []
      }
    }));

    res.json(athletes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para Salvar Dados (Sync)
app.post('/api/salvar', async (req, res) => {
  const athletes = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Limpeza controlada (modelo Sync)
    await client.query('DELETE FROM wellness');
    await client.query('DELETE FROM bioimpedance');
    await client.query('DELETE FROM isometric_strength');
    await client.query('DELETE FROM cmj');
    await client.query('DELETE FROM vo2max');
    await client.query('DELETE FROM workouts');

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
            'INSERT INTO prescribed_exercises (id, workout_id, name, muscle_group, sets, reps, weight) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [ex.id, wk.id, ex.name, ex.muscleGroup, ex.sets, ex.reps, ex.weight]
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
        await client.query('INSERT INTO bioimpedance (id, athlete_id, date, weight, fat_percentage, muscle_mass, visceral_fat, hydration) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [asm.id, athlete.id, asm.date, asm.weight, asm.fatPercentage, asm.muscleMass, asm.visceralFat, asm.hydration]);
      }
      for (const asm of (athlete.assessments.isometricStrength || [])) {
        await client.query('INSERT INTO isometric_strength (id, athlete_id, date, half_squat_kgf, quadriceps_r, quadriceps_l, hamstrings_r, hamstrings_l) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [asm.id, athlete.id, asm.date, asm.halfSquatKgf, asm.quadricepsR, asm.quadricepsL, asm.hamstringsR, asm.hamstringsL]);
      }
      for (const asm of (athlete.assessments.cmj || [])) {
        await client.query('INSERT INTO cmj (id, athlete_id, date, height, power, depth, rsi) VALUES ($1, $2, $3, $4, $5, $6, $7)', [asm.id, athlete.id, asm.date, asm.height, asm.power, asm.depth, asm.rsi]);
      }
      for (const asm of (athlete.assessments.vo2max || [])) {
        await client.query('INSERT INTO vo2max (id, athlete_id, date, vo2max, max_heart_rate, threshold_heart_rate) VALUES ($1, $2, $3, $4, $5, $6)', [asm.id, athlete.id, asm.date, asm.vo2max, asm.maxHeartRate, asm.thresholdHeartRate]);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Sincronizado com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Serve frontend estático em produção
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  // Se existir a pasta dist, serve o index.html de lá, senão serve do root (para dev/fallback)
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
