import { IQRatio, Vo2max } from './types';

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

export const calculateIQRatios = (quadR: number, quadL: number, hamR: number, hamL: number): { right: IQRatio; left: IQRatio } => {
  const calculateRatio = (hamstring: number, quadriceps: number): IQRatio => {
    if (quadriceps === 0) return { ratio: 0, status: 'bad' };
    const ratio = (hamstring / quadriceps) * 100;
    const status = ratio >= 50 && ratio <= 60 ? 'good' : 'bad';
    return { ratio: parseFloat(ratio.toFixed(1)), status };
  };

  return {
    right: calculateRatio(hamR, quadR),
    left: calculateRatio(hamL, quadL),
  };
};

export const formatPace = (paceInMinutes: number): string => {
  const minutes = Math.floor(paceInMinutes);
  const seconds = Math.round((paceInMinutes - minutes) * 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateVo2maxZones = (assessment: Vo2max) => {
    const { maxHeartRate, vam } = assessment;

    const zones = [
        { name: 'Zona 1', minHrPercent: 50, maxHrPercent: 72 },
        { name: 'Zona 2', minHrPercent: 72, maxHrPercent: 84 },
        { name: 'Zona 3', minHrPercent: 85, maxHrPercent: 99 },
        { name: 'Zona 4', minHrPercent: 100, maxHrPercent: 110 },
        { name: 'Zona 5', minHrPercent: 110, maxHrPercent: 120 },
    ];

    const trainingZones = zones.map(z => ({
        ...z,
        minBpm: Math.round(maxHeartRate * (z.minHrPercent / 100)),
        maxBpm: Math.round(maxHeartRate * (z.maxHrPercent / 100)),
    }));

    const intensityPercentages = [60, 65, 70, 75, 80, 85, 90, 95, 100];
    const trainingPaces = intensityPercentages.map(p => {
        const speed = vam * (p / 100);
        const pace = speed > 0 ? 60 / speed : 0;
        return {
            percentage: p,
            pace: formatPace(pace),
            speed: speed.toFixed(1),
        };
    });
    
    const distances = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    const intensities = [120, 110, 100, 90, 80, 70, 60];
    
    const partialVelocities = distances.map(distanceM => {
        return {
            distance: distanceM,
            results: intensities.map(intensity => {
                const speedKmh = vam * (intensity / 100);
                const timeHours = speedKmh > 0 ? (distanceM / 1000) / speedKmh : 0;
                const timeSeconds = timeHours * 3600;
                
                const minutes = Math.floor(timeSeconds / 60);
                const seconds = Math.floor(timeSeconds % 60);
                
                return {
                    intensity,
                    speed: speedKmh.toFixed(1),
                    time: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                }
            })
        }
    });

    return { trainingZones, trainingPaces, partialVelocities };
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};