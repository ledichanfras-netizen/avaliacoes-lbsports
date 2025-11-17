import { sql } from '@vercel/postgres';

const groupAssessments = (assessments, mappingFunc) => {
    const grouped = {};
    for (const row of assessments) {
        const asm = mappingFunc(row);
        if (!grouped[asm.athleteId]) {
            grouped[asm.athleteId] = [];
        }
        grouped[asm.athleteId].push(asm);
    }
    return grouped;
};

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  try {
    const [
        athletesResult, bioimpedanceResult, isometricStrengthResult,
        generalStrengthResult, cmjResult, vo2maxResult
    ] = await Promise.all([
        sql`SELECT * FROM athletes ORDER BY name ASC`,
        sql`SELECT * FROM bioimpedance`, sql`SELECT * FROM isometric_strength`,
        sql`SELECT * FROM general_strength`, sql`SELECT * FROM cmj`,
        sql`SELECT * FROM vo2max`,
    ]);

    // Mapeia snake_case do DB para camelCase do frontend
    const athletes = athletesResult.rows.map(r => ({ id: r.id, name: r.name, dob: r.dob, injuryHistory: r.injury_history }));
    const bioimpedanceByAthlete = groupAssessments(bioimpedanceResult.rows, r => ({ id: r.id, athleteId: r.athlete_id, date: r.date, weight: r.weight, fatPercentage: r.fat_percentage, muscleMass: r.muscle_mass, visceralFat: r.visceral_fat, hydration: r.hydration, observations: r.observations }));
    const isometricStrengthByAthlete = groupAssessments(isometricStrengthResult.rows, r => ({ id: r.id, athleteId: r.athlete_id, date: r.date, quadricepsR: r.quadriceps_r, quadricepsL: r.quadriceps_l, hamstringsR: r.hamstrings_r, hamstringsL: r.hamstrings_l, observations: r.observations }));
    const generalStrengthByAthlete = groupAssessments(generalStrengthResult.rows, r => ({ id: r.id, athleteId: r.athlete_id, date: r.date, exercise: r.exercise, load: r.load, observations: r.observations }));
    const cmjByAthlete = groupAssessments(cmjResult.rows, r => ({ id: r.id, athleteId: r.athlete_id, date: r.date, height: r.height, power: r.power, depth: r.depth, unilateralJumpR: r.unilateral_jump_r, unilateralJumpL: r.unilateral_jump_l, load: r.load, observations: r.observations }));
    const vo2maxByAthlete = groupAssessments(vo2maxResult.rows, r => ({ id: r.id, athleteId: r.athlete_id, date: r.date, vo2max: r.vo2max, maxHeartRate: r.max_heart_rate, thresholdHeartRate: r.threshold_heart_rate, maxVentilation: r.max_ventilation, thresholdVentilation: r.threshold_ventilation, maxLoad: r.max_load, thresholdLoad: r.threshold_load, vam: r.vam, rec10s: r.rec10s, rec30s: r.rec30s, rec60s: r.rec60s, score: r.score, observations: r.observations }));

    // Monta a estrutura aninhada final
    const formattedAthletes = athletes.map(athlete => {
      const sortAssessments = (arr) => arr ? arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
      return {
        ...athlete,
        assessments: {
          bioimpedance: sortAssessments(bioimpedanceByAthlete[athlete.id] || []),
          isometricStrength: sortAssessments(isometricStrengthByAthlete[athlete.id] || []),
          generalStrength: sortAssessments(generalStrengthByAthlete[athlete.id] || []),
          cmj: sortAssessments(cmjByAthlete[athlete.id] || []),
          vo2max: sortAssessments(vo2maxByAthlete[athlete.id] || []),
        }
      };
    });

    return response.status(200).json(formattedAthletes);
  } catch (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.warn('Tabelas não existem. Retornando array vazio. Execute /api/setup para criá-las.');
        return response.status(200).json([]);
    }
    console.error('Erro ao ler dados:', error);
    return response.status(500).json({ error: `Erro ao ler dados: ${error.message}` });
  }
}
