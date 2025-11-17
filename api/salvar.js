import { db } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Apenas método POST é permitido' });
  }

  const athletes = request.body;
  if (!Array.isArray(athletes)) {
    return response.status(400).json({ message: 'O corpo da requisição deve ser um array de atletas.' });
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');
    
    // Limpa a tabela de atletas. ON DELETE CASCADE cuidará das avaliações relacionadas.
    await client.query('DELETE FROM athletes');

    for (const athlete of athletes) {
      await client.query(
        'INSERT INTO athletes (id, name, dob, injury_history) VALUES ($1, $2, $3, $4)',
        [athlete.id, athlete.name, athlete.dob, athlete.injuryHistory]
      );
      
      for (const asm of athlete.assessments.bioimpedance) {
        await client.query(
            'INSERT INTO bioimpedance (id, athlete_id, date, weight, fat_percentage, muscle_mass, visceral_fat, hydration, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [asm.id, athlete.id, asm.date, asm.weight, asm.fatPercentage, asm.muscleMass, asm.visceralFat, asm.hydration, asm.observations]
        );
      }
      for (const asm of athlete.assessments.isometricStrength) {
        await client.query(
            'INSERT INTO isometric_strength (id, athlete_id, date, quadriceps_r, quadriceps_l, hamstrings_r, hamstrings_l, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [asm.id, athlete.id, asm.date, asm.quadricepsR, asm.quadricepsL, asm.hamstringsR, asm.hamstringsL, asm.observations]
        );
      }
       for (const asm of athlete.assessments.generalStrength) {
        await client.query(
            'INSERT INTO general_strength (id, athlete_id, date, exercise, "load", observations) VALUES ($1, $2, $3, $4, $5, $6)',
            [asm.id, athlete.id, asm.date, asm.exercise, asm.load, asm.observations]
        );
      }
      for (const asm of athlete.assessments.cmj) {
        await client.query(
            'INSERT INTO cmj (id, athlete_id, date, height, power, depth, unilateral_jump_r, unilateral_jump_l, "load", observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [asm.id, athlete.id, asm.date, asm.height, asm.power, asm.depth, asm.unilateralJumpR, asm.unilateralJumpL, asm.load, asm.observations]
        );
      }
      for (const asm of athlete.assessments.vo2max) {
        await client.query(
            'INSERT INTO vo2max (id, athlete_id, date, vo2max, max_heart_rate, threshold_heart_rate, max_ventilation, threshold_ventilation, max_load, threshold_load, vam, rec10s, rec30s, rec60s, score, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
            [asm.id, athlete.id, asm.date, asm.vo2max, asm.maxHeartRate, asm.thresholdHeartRate, asm.maxVentilation, asm.thresholdVentilation, asm.maxLoad, asm.thresholdLoad, asm.vam, asm.rec10s, asm.rec30s, asm.rec60s, asm.score, asm.observations]
        );
      }
    }

    await client.query('COMMIT');
    return response.status(200).json({ message: 'Dados salvos com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro na transação de salvar:', error);
    return response.status(500).json({ error: `Erro ao salvar dados: ${error.message}` });
  } finally {
    client.release();
  }
}
