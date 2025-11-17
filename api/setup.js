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
      CREATE TABLE IF NOT EXISTS bioimpedance (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        weight REAL,
        fat_percentage REAL,
        muscle_mass REAL,
        visceral_fat REAL,
        hydration REAL,
        observations TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS isometric_strength (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        quadriceps_r REAL,
        quadriceps_l REAL,
        hamstrings_r REAL,
        hamstrings_l REAL,
        observations TEXT
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS general_strength (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        exercise VARCHAR(255),
        "load" REAL,
        observations TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS cmj (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        height REAL,
        power REAL,
        depth REAL,
        unilateral_jump_r REAL,
        unilateral_jump_l REAL,
        "load" REAL,
        observations TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS vo2max (
        id TEXT PRIMARY KEY,
        athlete_id TEXT REFERENCES athletes(id) ON DELETE CASCADE,
        date VARCHAR(255) NOT NULL,
        vo2max REAL,
        max_heart_rate REAL,
        threshold_heart_rate REAL,
        max_ventilation REAL,
        threshold_ventilation REAL,
        max_load REAL,
        threshold_load REAL,
        vam REAL,
        rec10s REAL,
        rec30s REAL,
        rec60s REAL,
        score REAL,
        observations TEXT
      );
    `;
    
    return response.status(200).json({ message: "Tabelas criadas com sucesso!" });
  } catch (error) {
    return response.status(500).json({ error: `Erro ao criar tabelas: ${error.message}` });
  }
}
