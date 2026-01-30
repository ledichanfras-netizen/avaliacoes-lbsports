
import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, AreaChart, Area, Legend
} from 'recharts';
import { useAthletes } from './hooks';
import { Athlete, WellnessEntry, Workout, AssessmentType, PrescribedExercise, ExerciseDefinition, Cmj } from './types';
import { calculateAge, formatDate, calculateAsymmetry, interpretAsymmetry, calculateIQRatios, calculateACWR, calculateAdvancedMetrics, calculateWorkoutInternalLoad, calculateRSI } from './utils';
import toast from 'react-hot-toast';

// --- CONSTANTS ---
const INITIAL_EXERCISE_LIBRARY: ExerciseDefinition[] = [
  // INFERIORES - PESO LIVRE
  { id: '1', name: 'Agachamento Barra (High Bar)', muscleGroup: 'Quadríceps' },
  { id: '2', name: 'Agachamento Halteres', muscleGroup: 'Quadríceps' },
  { id: '3', name: 'Levantamento Terra Convencional', muscleGroup: 'Cadeia Posterior' },
  { id: '4', name: 'Stiff Barra', muscleGroup: 'Isquiotibiais' },
  { id: '5', name: 'Afundo Halteres', muscleGroup: 'Quadríceps/Glúteo' },
  { id: '6', name: 'Búlgara Halteres', muscleGroup: 'Quadríceps/Glúteo' },
  
  // INFERIORES - MÁQUINAS
  { id: '7', name: 'Leg Press 45º', muscleGroup: 'Inferiores' },
  { id: '8', name: 'Leg Press Horizontal (Máquina)', muscleGroup: 'Inferiores' },
  { id: '9', name: 'Hack Machine', muscleGroup: 'Quadríceps' },
  { id: '10', name: 'Cadeira Extensora', muscleGroup: 'Quadríceps' },
  { id: '11', name: 'Mesa Flexora (Deitada)', muscleGroup: 'Isquiotibiais' },
  { id: '12', name: 'Cadeira Flexora (Sentada)', muscleGroup: 'Isquiotibiais' },
  { id: '13', name: 'Cadeira Abdutora', muscleGroup: 'Glúteo Médio' },
  { id: '14', name: 'Cadeira Adutora', muscleGroup: 'Adutores' },
  { id: '15', name: 'Panturrilha Sentado (Máquina)', muscleGroup: 'Gastrocnêmio' },
  { id: '16', name: 'Panturrilha em pé (Máquina)', muscleGroup: 'Gastrocnêmio' },

  // PEITORAL
  { id: '17', name: 'Supino Reto Barra', muscleGroup: 'Peitoral' },
  { id: '18', name: 'Supino Inclinado Halteres', muscleGroup: 'Peitoral Superior' },
  { id: '19', name: 'Supino Articulado (Máquina)', muscleGroup: 'Peitoral' },
  { id: '20', name: 'Crucifixo Máquina (Peck Deck)', muscleGroup: 'Peitoral' },
  { id: '21', name: 'Crossover Cabo (Polia Alta)', muscleGroup: 'Peitoral Inferior' },

  // COSTAS
  { id: '22', name: 'Puxada Aberta (Cabo)', muscleGroup: 'Latíssimo' },
  { id: '23', name: 'Puxada Triângulo (Cabo)', muscleGroup: 'Latíssimo' },
  { id: '24', name: 'Puxada Articulada (Máquina)', muscleGroup: 'Dorsais' },
  { id: '25', name: 'Remada Baixa (Cabo)', muscleGroup: 'Dorsais' },
  { id: '26', name: 'Remada Unilateral Halter (Serrote)', muscleGroup: 'Dorsais' },
  { id: '27', name: 'Remada Cavalinho', muscleGroup: 'Dorsais' },
  { id: '28', name: 'Remada Articulada (Máquina)', muscleGroup: 'Dorsais' },

  // OMBROS
  { id: '29', name: 'Desenvolvimento Halteres (Sentado)', muscleGroup: 'Deltóides' },
  { id: '30', name: 'Desenvolvimento Articulado (Máquina)', muscleGroup: 'Deltóides' },
  { id: '31', name: 'Elevação Lateral Halteres', muscleGroup: 'Deltóide Lateral' },
  { id: '32', name: 'Elevação Lateral Cabo', muscleGroup: 'Deltóide Lateral' },
  { id: '33', name: 'Facepull Cabo', muscleGroup: 'Deltóide Posterior' },

  // BRAÇOS
  { id: '34', name: 'Rosca Direta Barra W', muscleGroup: 'Bíceps' },
  { id: '35', name: 'Rosca Martelo Halteres', muscleGroup: 'Braquial/Bíceps' },
  { id: '36', name: 'Rosca Scott Máquina', muscleGroup: 'Bíceps' },
  { id: '37', name: 'Tríceps Pulley (Cabo)', muscleGroup: 'Tríceps' },
  { id: '38', name: 'Tríceps Corda (Cabo)', muscleGroup: 'Tríceps' },
  { id: '39', name: 'Tríceps Testa Halteres', muscleGroup: 'Tríceps' },
  { id: '40', name: 'Tríceps Mergulho (Máquina)', muscleGroup: 'Tríceps' },

  // CORE / OUTROS
  { id: '41', name: 'Abdominal Supra (Máquina)', muscleGroup: 'Core' },
  { id: '42', name: 'Plancha Isométrica', muscleGroup: 'Core' },
  { id: '43', name: 'Power Clean', muscleGroup: 'Olímpico' },
  { id: '44', name: 'Snatch Halter', muscleGroup: 'Olímpico' },
];

const WORKOUT_PHASES = [
  'Força Máxima',
  'Potência',
  'Acessórios',
  'Hipertrofia',
  'Resistência',
  'Recuperação/Deload',
  'Especificidade'
];

// --- UI COMPONENTS ---
const Card: FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => (
  <div className={`bg-gray-800 shadow-2xl rounded-3xl p-6 border border-gray-700/50 relative overflow-hidden ${className}`}>
    {title && <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">{title}</h4>}
    {children}
  </div>
);

const Button: FC<{ onClick?: () => void; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'accent' | 'danger'; className?: string; disabled?: boolean; type?: 'button' | 'submit' }> = ({ onClick, children, variant = 'primary', className, disabled, type = 'button' }) => {
  const styles = {
    primary: "bg-brand-primary hover:bg-brand-dark text-white shadow-lg shadow-brand-primary/20",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200",
    accent: "bg-brand-secondary hover:bg-brand-primary text-gray-900 font-black shadow-lg shadow-brand-secondary/20",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-5 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest ${styles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );
};

// --- FEATURE COMPONENTS ---

const PredictorIntelligence: FC<{ athlete: Athlete }> = ({ athlete }) => {
  const metrics = useMemo(() => calculateAdvancedMetrics(athlete.workouts), [athlete.workouts]);
  const acwr = useMemo(() => calculateACWR(athlete.workouts), [athlete.workouts]);
  const readiness = athlete.wellness[0]?.readinessScore || 0;

  const isAtRisk = metrics.monotony > 2.0 || acwr.ratio > 1.5 || (readiness < 60 && acwr.ratio > 1.2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={`border-b-4 ${metrics.monotony > 2.0 ? 'border-red-500' : 'border-brand-primary'}`} title="Monotonia (Foster)">
        <p className={`text-3xl font-black mt-1 ${metrics.monotony > 2.0 ? 'text-red-500' : 'text-white'}`}>{metrics.monotony}</p>
        <p className="text-[9px] text-gray-500 mt-2 font-bold italic">Ideal: {"< 2.0"}</p>
      </Card>
      
      <Card className={`border-b-4 ${acwr.status === 'danger' ? 'border-red-500' : 'border-brand-primary'}`} title="ACWR (Carga Interna)">
        <p className={`text-3xl font-black mt-1 ${acwr.status === 'danger' ? 'text-red-500' : 'text-white'}`}>{acwr.ratio}</p>
        <p className="text-[9px] text-gray-500 mt-2 font-bold italic">Sweet Spot: 0.8 - 1.3</p>
      </Card>

      <Card className={`border-b-4 ${isAtRisk ? 'border-red-500 bg-red-500/5' : 'border-brand-secondary'}`} title="Predição de Lesão">
        <p className={`text-lg font-black mt-1 uppercase ${isAtRisk ? 'text-red-500' : 'text-brand-secondary'}`}>
          {isAtRisk ? 'Risco Elevado' : 'Estável'}
        </p>
        <p className="text-[9px] text-gray-500 mt-2 font-bold italic">{isAtRisk ? 'Ajustar carga para evitar fadiga.' : 'Liberado para performance.'}</p>
      </Card>
    </div>
  );
};

const AssessmentComparison: FC<{ athlete: Athlete }> = ({ athlete }) => {
  const [selectedType, setSelectedType] = useState<AssessmentType>('isometricStrength');

  const chartData = useMemo(() => {
    const list = (athlete.assessments[selectedType] as any[]) || [];
    return list.slice().reverse().map(item => ({
      date: formatDate(item.date).split('/')[0] + '/' + formatDate(item.date).split('/')[1],
      ...item
    }));
  }, [athlete, selectedType]);

  const renderComparativeChart = () => {
    if (chartData.length === 0) return (
      <div className="h-[300px] flex items-center justify-center text-gray-600 text-[10px] font-black uppercase tracking-widest italic">
        Aguardando Dados
      </div>
    );

    switch(selectedType) {
      case 'bioimpedance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#4b5563', fontSize: 10}} />
              <YAxis tick={{fill: '#4b5563', fontSize: 10}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '12px'}} />
              <Legend verticalAlign="top" height={36}/>
              <Line name="Peso (kg)" type="monotone" dataKey="weight" stroke="#fff" strokeWidth={3} dot={{fill: '#fff'}} />
              <Line name="Gordura (%)" type="monotone" dataKey="fatPercentage" stroke="#E53E3E" strokeWidth={2} dot={{fill: '#E53E3E'}} />
              <Line name="Massa Magra (kg)" type="monotone" dataKey="muscleMass" stroke="#63BFAA" strokeWidth={2} dot={{fill: '#63BFAA'}} />
              <Line name="Hidratação (%)" type="monotone" dataKey="hydration" stroke="#3182ce" strokeWidth={2} dot={{fill: '#3182ce'}} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'isometricStrength':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#4b5563', fontSize: 10}} />
              <YAxis tick={{fill: '#4b5563', fontSize: 10}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '12px'}} />
              <Legend verticalAlign="top" height={36}/>
              <Bar name="Quad D" dataKey="quadricepsR" fill="#2D7A74" radius={[4, 4, 0, 0]} />
              <Bar name="Quad E" dataKey="quadricepsL" fill="#63BFAA" radius={[4, 4, 0, 0]} />
              <Bar name="Isquio D" dataKey="hamstringsR" fill="#E53E3E" radius={[4, 4, 0, 0]} />
              <Bar name="Isquio E" dataKey="hamstringsL" fill="#F56565" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'vo2max':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#4b5563', fontSize: 10}} />
              <YAxis tick={{fill: '#4b5563', fontSize: 10}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '12px'}} />
              <Legend verticalAlign="top" height={36}/>
              <Line name="VO2 Max" type="monotone" dataKey="vo2max" stroke="#63BFAA" strokeWidth={3} dot={{fill: '#63BFAA'}} />
              <Line name="FC Limiar" type="monotone" dataKey="thresholdHeartRate" stroke="#2D7A74" strokeWidth={2} dot={{fill: '#2D7A74'}} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'cmj':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="date" tick={{fill: '#4b5563', fontSize: 10}} />
              <YAxis tick={{fill: '#4b5563', fontSize: 10}} />
              <Tooltip contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '12px'}} />
              <Area name="Altura (cm)" type="monotone" dataKey="height" stroke="#63BFAA" fill="#63BFAA33" strokeWidth={3} />
              <Area name="RSI" type="monotone" dataKey="rsi" stroke="#E53E3E" fill="#E53E3E33" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="h-[300px] flex items-center justify-center text-gray-500 italic">Visualização não disponível.</div>
        );
    }
  };

  return (
    <Card className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h4 className="text-brand-secondary font-black text-[10px] uppercase tracking-widest italic">Análise Comparativa</h4>
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl border border-gray-700 overflow-x-auto w-full md:w-auto">
          {(['isometricStrength', 'vo2max', 'cmj', 'bioimpedance'] as AssessmentType[]).map(type => (
            <button 
              key={type} 
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all shrink-0 ${selectedType === type ? 'bg-brand-primary text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {type === 'isometricStrength' ? 'Força' : type === 'vo2max' ? 'VO2' : type === 'cmj' ? 'Salto' : 'Bio'}
            </button>
          ))}
        </div>
      </div>
      {renderComparativeChart()}
    </Card>
  );
};

// --- MAIN APP ---
const App: FC = () => {
  const { athletes, loading, addAthlete, addWellness, addWorkout, updateWorkout, addAssessment, addTestAthlete, analyzePerformance } = useAthletes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dash' | 'training' | 'assessment'>('dash');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [modalState, setModalState] = useState<{
    type: 'athlete' | 'wellness' | 'workout' | 'assessment' | 'ai' | null,
    editingData?: any,
    extraData?: any
  }>({ type: null });

  const selected = useMemo(() => athletes.find(a => a.id === selectedId), [athletes, selectedId]);
  const [liveWorkout, setLiveWorkout] = useState<Workout | null>(null);

  const handleAiAnalysis = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const res = await analyzePerformance(selected);
      setAiInsight(res);
      setModalState({ type: 'ai' });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-brand-secondary font-black uppercase tracking-[0.5em] animate-pulse">
       <div className="w-16 h-16 bg-brand-primary rounded-3xl mb-4 flex items-center justify-center text-white text-3xl">LB</div>
       LB PERFORMANCE LAB
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans pb-20 overflow-x-hidden">
      <nav className="bg-gray-900/60 backdrop-blur-2xl border-b border-gray-800/50 p-6 sticky top-0 z-[100]">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl shadow-brand-primary/20 shrink-0">LB</div>
            <div>
              <h1 className="font-black tracking-tighter text-2xl uppercase italic leading-none">Elite Performance Hub</h1>
              <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Professional Athlete Systems</p>
            </div>
          </div>
          <div className="flex gap-3 items-center w-full sm:w-auto">
            <Button onClick={() => setModalState({ type: 'athlete' })} variant="secondary" className="px-4 py-2 shrink-0">+ Atleta</Button>
            <select 
              className="flex-grow sm:flex-grow-0 bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3 text-sm font-bold min-w-[200px] outline-none transition-all focus:border-brand-primary"
              onChange={e => setSelectedId(e.target.value)}
              value={selectedId || ''}
            >
              <option value="">Buscar Atleta...</option>
              {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-8">
        {!selected ? (
          <div className="text-center py-32 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none max-w-2xl text-center">Gestão Esportiva de Elite</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest mt-6 max-w-xl text-center">Métricas avançadas para otimização de performance e prevenção de lesões.</p>
            <div className="flex flex-col sm:flex-row gap-5 mt-16 w-full max-w-md">
              <Button onClick={() => setModalState({ type: 'athlete' })} className="flex-grow py-5 text-base">Novo Cadastro</Button>
              <Button onClick={addTestAthlete} variant="secondary" className="flex-grow py-5 text-base">Atleta Demo</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8">
            <PredictorIntelligence athlete={selected} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-3 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase text-white leading-none">{selected.name}</h2>
                  <div className="flex gap-4 mt-4 items-center">
                    <span className="text-gray-500 font-black uppercase text-[9px] tracking-widest bg-gray-900 px-3 py-1 rounded-full">{calculateAge(selected.dob)} ANOS</span>
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                    <span className="text-brand-secondary font-black text-[9px] uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">SCORE: {selected.wellness[0]?.readinessScore || '--'}%</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAiAnalysis} disabled={aiLoading} variant="accent" className="px-6 py-5">
                    {aiLoading ? 'Analisando...' : 'Insights IA'}
                  </Button>
                  <Button onClick={() => setModalState({ type: 'wellness' })} variant="primary" className="px-10 py-5">Prontidão</Button>
                </div>
              </Card>

              <Card className="flex flex-col justify-center items-center text-center">
                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-2">Workload (7d)</p>
                 <p className="text-4xl font-black text-white">
                    {selected.workouts.slice(0, 7).reduce((acc, w) => acc + calculateWorkoutInternalLoad(w), 0).toLocaleString()}
                 </p>
                 <p className="text-[7px] text-gray-600 font-bold uppercase mt-1">AU</p>
              </Card>
            </div>

            <div className="flex gap-2 bg-gray-900/30 p-2 rounded-3xl w-full sm:w-fit border border-gray-800">
              {(['dash', 'training', 'assessment'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 md:px-14 py-4 rounded-2xl text-[10px] font-black transition-all tracking-widest shrink-0 uppercase ${activeTab === tab ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/40' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'dash' ? 'Performance' : tab === 'training' ? 'Treinos' : 'Avaliações'}
                </button>
              ))}
            </div>

            {activeTab === 'dash' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-8">
                <Card title="Perfil de Recuperação">
                  <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selected.wellness.slice().reverse().map((w, i) => ({ 
                        name: i + 1, 
                        score: w.readinessScore,
                        load: (selected.workouts[i]?.rpe || 0) * 10
                      }))}>
                        <defs>
                          <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#63BFAA" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#63BFAA" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="name" tick={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{fill: '#4b5563', fontSize: 10}} axisLine={false} />
                        <Tooltip contentStyle={{backgroundColor: '#111827', border: 'none', borderRadius: '16px'}} />
                        <Area name="Prontidão" type="monotone" dataKey="score" stroke="#63BFAA" fillOpacity={1} fill="url(#colorRead)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Fadiga Neuromuscular & Stress">
                  <div className="h-[350px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Fadiga', A: selected.wellness[0]?.fatigue || 3 },
                        { subject: 'Sono', A: selected.wellness[0]?.sleep || 3 },
                        { subject: 'Stress', A: selected.wellness[0]?.stress || 3 },
                        { subject: 'Dor', A: selected.wellness[0]?.soreness || 3 },
                        { subject: 'Humor', A: selected.wellness[0]?.mood || 3 },
                        { subject: 'Cognitivo', A: selected.wellness[0]?.cognitiveLoad || 3 },
                      ]}>
                        <PolarGrid stroke="#1f2937" />
                        <PolarAngleAxis dataKey="subject" tick={{fill: '#4b5563', fontSize: 10, fontWeight: 'bold'}} />
                        <Radar name="Status" dataKey="A" stroke="#63BFAA" fill="#63BFAA" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'training' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                 <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Prescrições de Microciclo</h3>
                    <Button variant="secondary" onClick={() => setModalState({ type: 'workout' })}>+ Novo Treino</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selected.workouts.map(w => (
                        <Card key={w.id} className={`flex flex-col border-l-8 ${w.status === 'completed' ? 'border-green-500 opacity-60' : 'border-brand-primary shadow-2xl shadow-brand-primary/10'}`}>
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <span className="text-[8px] font-black bg-gray-900 text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest">{w.phase}</span>
                                <h5 className="text-2xl font-black uppercase italic text-white leading-tight mt-2 truncate">{w.name}</h5>
                                <p className="text-[9px] font-bold text-gray-500 uppercase mt-2 tracking-widest">{formatDate(w.date)}</p>
                              </div>
                              <button onClick={() => setModalState({ type: 'workout', editingData: w })} className="p-2 text-gray-600 hover:text-white"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            </div>
                            {w.status === 'completed' ? (
                              <div className="mt-auto pt-6 border-t border-gray-700/50 flex justify-between items-center">
                                <div>
                                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Carga Interna</p>
                                  <p className="text-xl font-black text-brand-secondary">{calculateWorkoutInternalLoad(w)} AU</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">sRPE</p>
                                  <p className="text-lg font-black text-white">{w.rpe}/10</p>
                                </div>
                              </div>
                            ) : (
                              <Button onClick={() => setLiveWorkout(w)} variant="accent" className="w-full mt-auto py-5">Iniciar Treino</Button>
                            )}
                        </Card>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'assessment' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">Protocolos de Avaliação</h3>
                  <Button onClick={() => setModalState({ type: 'assessment' })} variant="secondary">+ Registrar Avaliação</Button>
                </div>

                <AssessmentComparison athlete={selected} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {selected.assessments.isometricStrength[0] && (
                    <Card title="Métricas de Força & Assimetria">
                      <div className="space-y-6 mt-4">
                        {(() => {
                          const s = selected.assessments.isometricStrength[0];
                          const ratios = calculateIQRatios(s.quadricepsR, s.quadricepsL, s.hamstringsR, s.hamstringsL);
                          return (
                            <>
                              <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800">
                                <div className="flex justify-between mb-4">
                                  <span className="text-[9px] font-black text-gray-500 uppercase">Pico Meio Agachamento</span>
                                  <span className="text-brand-secondary font-black">{s.halfSquatKgf} kgf</span>
                                </div>
                                <div className="flex justify-around items-center">
                                  <div className="text-center">
                                    <p className="text-[8px] text-gray-600 uppercase mb-2">Déficit Q</p>
                                    <p className={`text-2xl font-black ${interpretAsymmetry(calculateAsymmetry(s.quadricepsR, s.quadricepsL)).color}`}>{calculateAsymmetry(s.quadricepsR, s.quadricepsL)}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[8px] text-gray-600 uppercase mb-2">Déficit I</p>
                                    <p className={`text-2xl font-black ${interpretAsymmetry(calculateAsymmetry(s.hamstringsR, s.hamstringsL)).color}`}>{calculateAsymmetry(s.hamstringsR, s.hamstringsL)}%</p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800 text-center">
                                  <p className="text-[8px] text-gray-600 uppercase mb-2">Relação I/Q (D)</p>
                                  <p className={`text-xl font-black ${ratios.right.status === 'good' ? 'text-brand-secondary' : 'text-red-500'}`}>{ratios.right.ratio}%</p>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-3xl border border-gray-800 text-center">
                                  <p className="text-[8px] text-gray-600 uppercase mb-2">Relação I/Q (E)</p>
                                  <p className={`text-xl font-black ${ratios.left.status === 'good' ? 'text-brand-secondary' : 'text-red-500'}`}>{ratios.left.ratio}%</p>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </Card>
                  )}

                  <div className="space-y-8">
                     {selected.assessments.cmj[0] && (
                       <Card className="bg-brand-primary/5 border-brand-primary/20" title="Capacidade Reativa (CMJ)">
                          <div className="flex justify-between items-end">
                             <div>
                               <p className="text-5xl font-black text-white">{selected.assessments.cmj[0].power} <span className="text-xs text-gray-600">W</span></p>
                               <p className="text-[9px] font-black text-gray-500 uppercase mt-2">Potência de Pico</p>
                             </div>
                             <div className="text-right">
                               <p className="text-3xl font-black text-brand-secondary">{selected.assessments.cmj[0].height} cm</p>
                               <p className="text-[9px] font-black text-gray-600 uppercase">RSI: {selected.assessments.cmj[0].rsi || 'N/A'}</p>
                             </div>
                          </div>
                       </Card>
                     )}
                     
                     <div className="grid grid-cols-2 gap-4">
                       {selected.assessments.bioimpedance[0] && (
                         <Card title="Composição Corporal">
                            <div className="flex flex-col gap-2">
                              <div>
                                <p className="text-4xl font-black text-white">{selected.assessments.bioimpedance[0].fatPercentage}%</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Gordura</p>
                              </div>
                              <div className="pt-2 border-t border-gray-700">
                                <p className="text-xl font-black text-brand-secondary">{selected.assessments.bioimpedance[0].muscleMass} kg</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Massa Magra</p>
                              </div>
                            </div>
                         </Card>
                       )}
                       {selected.assessments.vo2max[0] && (
                         <Card title="Capacidade Aeróbica">
                            <p className="text-4xl font-black text-brand-secondary">{selected.assessments.vo2max[0].vo2max}</p>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">ml/kg/min</p>
                         </Card>
                       )}
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {modalState.type === 'athlete' && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
           <AthleteForm onCancel={() => setModalState({ type: null })} onSave={d => { addAthlete(d); setModalState({ type: null }); }} />
        </div>
      )}

      {modalState.type === 'wellness' && selected && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl">
          <WellnessForm onCancel={() => setModalState({ type: null })} onSave={d => { addWellness(selected.id, d); setModalState({ type: null }); }} />
        </div>
      )}

      {modalState.type === 'workout' && selected && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto">
          <WorkoutBuilder 
            initialWorkout={modalState.editingData}
            onCancel={() => setModalState({ type: null })} 
            onSave={d => { addWorkout(selected.id, d); setModalState({ type: null }); }} 
            onUpdate={w => { updateWorkout(selected.id, w); setModalState({ type: null }); }}
          />
        </div>
      )}

      {modalState.type === 'assessment' && selected && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto">
          <AssessmentEntry 
            onCancel={() => setModalState({ type: null })} 
            onSave={(type, data) => { addAssessment(selected.id, type, data); setModalState({ type: null }); }} 
          />
        </div>
      )}

      {modalState.type === 'ai' && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto">
          <Card title="Relatório de Inteligência Performance" className="max-w-2xl w-full mx-auto p-10">
            <div className="prose prose-invert prose-emerald text-sm text-gray-300 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
              {aiInsight?.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <Button onClick={() => setModalState({ type: null })} className="w-full mt-10 py-5">Fechar Relatório</Button>
          </Card>
        </div>
      )}

      {liveWorkout && selected && (
        <WorkoutLive 
          workout={liveWorkout} 
          onCancel={() => setLiveWorkout(null)} 
          onFinish={w => { updateWorkout(selected.id, w); setLiveWorkout(null); toast.success("Dados computados!"); }} 
        />
      )}
    </div>
  );
};

// --- SUB COMPONENTS ---

const AthleteForm: FC<{ onSave: (data: any) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return toast.error("Preencha todos os campos.");
    onSave({ name, dob, injuryHistory: '' });
  };
  return (
    <Card className="max-w-md w-full mx-auto space-y-6" title="Novo Registro">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase block mb-2 tracking-widest">Nome do Atleta</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-700/50 rounded-2xl p-4 text-sm outline-none" placeholder="Ex: Lucas Silva" />
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase block mb-2 tracking-widest">Data de Nascimento</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-gray-900 border border-gray-700/50 rounded-2xl p-4 text-sm outline-none" />
        </div>
        <div className="flex gap-4 pt-4">
          <Button onClick={onCancel} variant="secondary" className="flex-grow">Voltar</Button>
          <Button type="submit" className="flex-grow">Confirmar</Button>
        </div>
      </form>
    </Card>
  );
};

const WellnessForm: FC<{ onSave: (data: Omit<WellnessEntry, 'id' | 'readinessScore'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [data, setData] = useState({ fatigue: 3, sleep: 3, stress: 3, soreness: 3, mood: 3, cognitiveLoad: 3 });
  const metrics = [
    { key: 'fatigue', label: 'Fadiga Muscular', low: 'Novo', high: 'Exausto' },
    { key: 'sleep', label: 'Qualidade do Sono', low: 'Péssimo', high: 'Excelente' },
    { key: 'stress', label: 'Tensão/Stress', low: 'Zen', high: 'Tenso' },
    { key: 'soreness', label: 'Dor Muscular', low: 'Zero', high: 'Muita' },
    { key: 'mood', label: 'Humor/Vigor', low: 'Mal', high: 'Bem' },
    { key: 'cognitiveLoad', label: 'Fadiga Cognitiva', low: 'Focado', high: 'Exausto' },
  ];
  return (
    <Card className="max-w-md w-full mx-auto space-y-6" title="Check-in de Prontidão">
      <div className="space-y-5">
        {metrics.map(m => (
          <div key={m.key} className="space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
              <span>{m.label}</span>
              <span className="text-brand-secondary font-bold">{data[m.key as keyof typeof data]}</span>
            </div>
            <input 
              type="range" min="1" max="5" 
              value={data[m.key as keyof typeof data]} 
              onChange={e => setData({...data, [m.key]: parseInt(e.target.value)})}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
            />
          </div>
        ))}
      </div>
      <Button onClick={() => onSave({...data, date: new Date().toISOString()})} className="w-full mt-6 py-5">Submeter Dados</Button>
    </Card>
  );
};

const WorkoutBuilder: FC<{ initialWorkout?: Partial<Workout>, onSave: (w: Omit<Workout, 'id'>) => void, onUpdate?: (w: Workout) => void, onCancel: () => void }> = ({ initialWorkout, onSave, onUpdate, onCancel }) => {
  const [name, setName] = useState(initialWorkout?.name || '');
  const [phase, setPhase] = useState(initialWorkout?.phase || 'Potência');
  const [exercises, setExercises] = useState<PrescribedExercise[]>(initialWorkout?.exercises || []);
  const [showLibrary, setShowLibrary] = useState(false);
  const [search, setSearch] = useState('');
  const [localLibrary, setLocalLibrary] = useState<ExerciseDefinition[]>(INITIAL_EXERCISE_LIBRARY);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEx, setCustomEx] = useState({ name: '', muscleGroup: 'Geral' });
  
  const addFromLibrary = (libEx: ExerciseDefinition) => {
    setExercises([...exercises, { 
      id: `pre-${Date.now()}`, 
      name: libEx.name, 
      muscleGroup: libEx.muscleGroup, 
      sets: 3, 
      reps: '12', 
      weight: 'Auto' 
    }]);
    setShowLibrary(false);
  };

  const addCustomExercise = () => {
    if (!customEx.name) return toast.error("Nome obrigatório");
    const newEx = { ...customEx, id: `custom-${Date.now()}` };
    setLocalLibrary([newEx, ...localLibrary]);
    addFromLibrary(newEx);
    setShowCustomForm(false);
    setCustomEx({ name: '', muscleGroup: 'Geral' });
  };

  const filteredLibrary = useMemo(() => {
    return localLibrary.filter(ex => 
      ex.name.toLowerCase().includes(search.toLowerCase()) || 
      ex.muscleGroup.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, localLibrary]);

  return (
    <Card className="max-w-3xl w-full mx-auto space-y-6" title="Prescrição de Treinamento">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Nome da Sessão</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Força Máxima - Inferiores" className="w-full bg-gray-900 border border-gray-700/50 rounded-2xl p-4 text-sm outline-none focus:border-brand-primary" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Fase de Treinamento</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className="w-full bg-gray-900 border border-gray-700/50 rounded-2xl p-4 text-sm outline-none focus:border-brand-primary">
             {WORKOUT_PHASES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {exercises.map((ex, i) => (
          <div key={ex.id} className="bg-gray-950 p-4 rounded-3xl border border-gray-800 flex items-center gap-4 group">
            <span className="text-[10px] font-black text-gray-600">#{i+1}</span>
            <input 
              value={ex.name} 
              onChange={e => setExercises(exercises.map(item => item.id === ex.id ? {...item, name: e.target.value} : item))}
              className="flex-grow font-black text-xs uppercase tracking-tight text-white bg-transparent border-none outline-none focus:text-brand-secondary transition-colors"
              placeholder="Nome do exercício"
            />
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                 <span className="text-[8px] text-gray-600 font-bold">S</span>
                 <input value={ex.sets} type="number" onChange={e => setExercises(exercises.map(item => item.id === ex.id ? {...item, sets: parseInt(e.target.value)} : item))} className="w-10 bg-gray-900 rounded-xl p-2 text-center text-[10px] font-bold" />
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-[8px] text-gray-600 font-bold">R</span>
                 <input value={ex.reps} onChange={e => setExercises(exercises.map(item => item.id === ex.id ? {...item, reps: e.target.value} : item))} className="w-14 bg-gray-900 rounded-xl p-2 text-center text-[10px] font-bold" />
              </div>
            </div>
            <button onClick={() => setExercises(exercises.filter(item => item.id !== ex.id))} className="text-gray-700 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-700">
        <Button onClick={() => setShowLibrary(true)} variant="secondary" className="flex-grow">Abrir Biblioteca</Button>
        <Button onClick={() => {
          if (!name) return toast.error("Nome da sessão obrigatório.");
          if (initialWorkout?.id && onUpdate) onUpdate({...initialWorkout as Workout, name, phase, exercises});
          else onSave({ name, phase, date: new Date().toISOString(), status: 'planned', exercises });
        }} className="flex-grow">Salvar Planilha</Button>
      </div>

      {showLibrary && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-6 backdrop-blur-sm">
          <Card className="max-w-md w-full max-h-[85vh] flex flex-col" title="Biblioteca de Movimentos">
            {showCustomForm ? (
              <div className="space-y-4 mb-6 p-4 bg-gray-900 rounded-3xl border border-brand-primary/20 animate-in slide-in-from-top-4">
                <h5 className="text-[9px] font-black text-brand-secondary uppercase tracking-widest">Novo Exercício</h5>
                <input 
                  value={customEx.name} 
                  onChange={e => setCustomEx({...customEx, name: e.target.value})} 
                  placeholder="Nome do exercício..." 
                  className="w-full bg-gray-950 p-4 rounded-2xl text-sm border border-gray-800 outline-none focus:border-brand-primary"
                />
                <input 
                  value={customEx.muscleGroup} 
                  onChange={e => setCustomEx({...customEx, muscleGroup: e.target.value})} 
                  placeholder="Grupo muscular..." 
                  className="w-full bg-gray-950 p-4 rounded-2xl text-sm border border-gray-800 outline-none focus:border-brand-primary"
                />
                <div className="flex gap-2">
                   <Button onClick={() => setShowCustomForm(false)} variant="secondary" className="flex-grow">Cancelar</Button>
                   <Button onClick={addCustomExercise} className="flex-grow">Confirmar</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Pesquisar..." 
                  className="flex-grow bg-gray-900 border border-gray-700 p-4 rounded-2xl text-sm outline-none focus:border-brand-primary"
                />
                <Button onClick={() => setShowCustomForm(true)} variant="accent" className="px-4">+</Button>
              </div>
            )}
            
            <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
              {filteredLibrary.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => addFromLibrary(ex)}
                  className="w-full text-left p-4 bg-gray-900 hover:bg-brand-primary rounded-2xl transition-all border border-gray-800 hover:border-brand-secondary group"
                >
                  <p className="font-black text-sm text-gray-300 group-hover:text-white uppercase tracking-tight">{ex.name}</p>
                  <span className="text-[10px] text-gray-500 font-bold italic block mt-1 uppercase">{ex.muscleGroup}</span>
                </button>
              ))}
              {filteredLibrary.length === 0 && (
                <p className="text-center text-gray-600 italic py-8 text-[10px] uppercase font-bold tracking-widest">Nenhum exercício encontrado</p>
              )}
            </div>
            <Button onClick={() => setShowLibrary(false)} variant="secondary" className="w-full mt-6">Voltar</Button>
          </Card>
        </div>
      )}
    </Card>
  );
};

const AssessmentEntry: FC<{ onCancel: () => void; onSave: (type: AssessmentType, data: any) => void }> = ({ onCancel, onSave }) => {
  const [type, setType] = useState<AssessmentType>('isometricStrength');
  const [data, setData] = useState<any>({ date: new Date().toISOString() });

  const computedRSI = useMemo(() => {
    if (type === 'cmj' && data.height && data.timeToTakeoff) {
      return calculateRSI(data.height, data.timeToTakeoff);
    }
    return 0;
  }, [type, data.height, data.timeToTakeoff]);

  return (
    <Card className="max-w-xl w-full mx-auto space-y-6" title="Lançamento de Protocolos">
      <div className="space-y-1">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo de Avaliação</label>
        <select value={type} onChange={e => { setType(e.target.value as AssessmentType); setData({ date: new Date().toISOString() }); }} className="w-full bg-gray-900 border border-gray-700/50 rounded-2xl p-4 text-sm outline-none focus:border-brand-primary">
          <option value="isometricStrength">Força Isométrica (Pico)</option>
          <option value="vo2max">VO2 Máximo / Ergo</option>
          <option value="cmj">Capacidade Reativa (CMJ)</option>
          <option value="bioimpedance">Bioimpedância (Composição Corporal)</option>
        </select>
      </div>

      <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 space-y-4 shadow-inner">
        {type === 'isometricStrength' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Pico Meio Agachamento (kgf)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, halfSquatKgf: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Quad D (kgf)</label>
                <input type="number" onChange={e => setData({...data, quadricepsR: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Quad E (kgf)</label>
                <input type="number" onChange={e => setData({...data, quadricepsL: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Isquio D (kgf)</label>
                <input type="number" onChange={e => setData({...data, hamstringsR: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Isquio E (kgf)</label>
                <input type="number" onChange={e => setData({...data, hamstringsL: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
          </div>
        )}
        {type === 'cmj' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Altura Salto (cm)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, height: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Profundidade (cm)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, depth: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Potência Pico (W)</label>
                <input type="number" onChange={e => setData({...data, power: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Tempo Decolagem (ms)</label>
                <input type="number" placeholder="Ex: 450" onChange={e => setData({...data, timeToTakeoff: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 focus:border-brand-primary outline-none" />
            </div>
            <div className="col-span-2 p-5 bg-brand-primary/10 rounded-2xl border border-brand-primary/30 flex justify-between items-center mt-2">
               <div>
                  <p className="text-[9px] font-black text-brand-secondary uppercase tracking-widest">RSI Automático</p>
                  <p className="text-3xl font-black text-white mt-1">RSI: {computedRSI || '0.00'}</p>
               </div>
            </div>
          </div>
        )}
        {type === 'bioimpedance' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Peso Total (kg)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, weight: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">% Gordura</label>
                <input type="number" step="0.1" onChange={e => setData({...data, fatPercentage: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Massa Magra (kg)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, muscleMass: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">Gordura Visceral</label>
                <input type="number" onChange={e => setData({...data, visceralFat: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">% Água (Hidratação)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, hydration: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
          </div>
        )}
        {type === 'vo2max' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">VO2 Max (ml/kg/min)</label>
                <input type="number" step="0.1" onChange={e => setData({...data, vo2max: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">FC Limiar (bpm)</label>
                <input type="number" onChange={e => setData({...data, thresholdHeartRate: Number(e.target.value)})} className="w-full bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
            <div className="space-y-1">
                <label className="text-[8px] font-black text-gray-600 uppercase">FC Máxima (bpm)</label>
                <input type="number" onChange={e => setData({...data, maxHeartRate: Number(e.target.value)})} className="w-full bg-gray-950 p-3 rounded-xl border border-gray-800 outline-none focus:border-brand-primary" />
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-4 pt-2">
        <Button onClick={onCancel} variant="secondary" className="flex-grow">Cancelar</Button>
        <Button onClick={() => onSave(type, data)} className="flex-grow">Computar Protocolo</Button>
      </div>
    </Card>
  );
};

const WorkoutLive: FC<{ workout: Workout; onCancel: () => void; onFinish: (w: Workout) => void }> = ({ workout, onCancel, onFinish }) => {
  const [currentWorkout, setCurrentWorkout] = useState<Workout>({
    ...workout,
    status: 'in_progress',
    durationMinutes: 60,
    rpe: 5,
    exercises: workout.exercises.map(ex => ({ ...ex, performedSets: ex.performedSets || [] }))
  });

  const recordSet = (exId: string, w: number, r: number, rpe: number) => {
    const updated = currentWorkout.exercises.map(ex => {
      if (ex.id === exId) {
        return { ...ex, performedSets: [...(ex.performedSets || []), { reps: r, weight: w, rpe }] };
      }
      return ex;
    });
    setCurrentWorkout({ ...currentWorkout, exercises: updated });
    toast.success("Série registrada!");
  };

  return (
    <div className="fixed inset-0 bg-black/98 z-[300] flex flex-col p-6 md:p-12 overflow-y-auto backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-4xl font-black text-brand-secondary uppercase italic tracking-tighter leading-none">Coleta em Tempo Real</h2>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2">{workout.name} • <span className="text-brand-primary">{workout.phase}</span></p>
          </div>
          <Button onClick={onCancel} variant="secondary">Interromper</Button>
        </div>

        <div className="space-y-8 mb-16">
          {currentWorkout.exercises.map((ex, idx) => (
            <Card key={ex.id} title={`${idx+1}. ${ex.name}`} className="border-l-8 border-brand-primary bg-gray-900/40">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                 {(ex.performedSets || []).map((set, sidx) => (
                   <div key={sidx} className="bg-gray-950 p-3 rounded-2xl text-center text-[10px] font-black border border-gray-800 shadow-inner animate-in fade-in zoom-in">
                     <p className="text-gray-600 uppercase text-[8px] mb-1">Série {sidx+1}</p>
                     <p className="text-white">{set.reps} x {set.weight}kg</p>
                     <p className="text-brand-secondary mt-1">RPE {set.rpe}</p>
                   </div>
                 ))}
              </div>
              
              <div className="flex flex-wrap items-end gap-3 pt-6 border-t border-gray-800">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-600 uppercase ml-1">Carga (kg)</label>
                    <input id={`w-${ex.id}`} type="number" placeholder="0" className="bg-gray-950 p-4 rounded-2xl w-24 outline-none focus:border-brand-primary border border-gray-800 text-sm font-black text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-600 uppercase ml-1">Reps</label>
                    <input id={`r-${ex.id}`} type="number" placeholder="0" className="bg-gray-950 p-4 rounded-2xl w-20 outline-none focus:border-brand-primary border border-gray-800 text-sm font-black text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-gray-600 uppercase ml-1">RPE (1-10)</label>
                    <input id={`rp-${ex.id}`} type="number" min="1" max="10" placeholder="5" className="bg-gray-950 p-4 rounded-2xl w-20 outline-none focus:border-brand-primary border border-gray-800 text-sm font-black text-white" />
                 </div>
                 <Button onClick={() => {
                    const wInput = document.getElementById(`w-${ex.id}`) as HTMLInputElement;
                    const rInput = document.getElementById(`r-${ex.id}`) as HTMLInputElement;
                    const rpInput = document.getElementById(`rp-${ex.id}`) as HTMLInputElement;
                    const w = Number(wInput.value);
                    const r = Number(rInput.value);
                    const rp = Number(rpInput.value);
                    if (w > 0 && r > 0 && rp >= 1 && rp <= 10) {
                      recordSet(ex.id, w, r, rp);
                      wInput.value = ''; rInput.value = ''; rpInput.value = '';
                    } else {
                      toast.error("Insira métricas válidas.");
                    }
                 }} variant="primary" className="mb-[2px]">Salvar Série</Button>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Finalização de Sessão" className="space-y-8 mt-auto mb-10 shadow-2xl border border-brand-primary/20">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="font-black text-gray-400 uppercase text-[10px] tracking-widest">Esforço da Sessão (sRPE)</span>
                    <span className="text-4xl font-black text-brand-secondary italic">{currentWorkout.rpe}</span>
                 </div>
                 <input type="range" min="1" max="10" value={currentWorkout.rpe} onChange={e => setCurrentWorkout({...currentWorkout, rpe: Number(e.target.value)})} className="w-full h-3 bg-gray-900 rounded-full appearance-none cursor-pointer accent-brand-secondary" />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duração Total (Minutos)</label>
                <input type="number" value={currentWorkout.durationMinutes} onChange={e => setCurrentWorkout({...currentWorkout, durationMinutes: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-3xl p-5 text-lg font-black text-white focus:border-brand-primary outline-none transition-all shadow-inner" />
              </div>
           </div>
           <Button onClick={() => onFinish(currentWorkout)} variant="accent" className="w-full py-8 text-xl tracking-[0.3em] shadow-2xl shadow-brand-secondary/30 rounded-[2.5rem]">CONCLUIR PROTOCOLO DE CARGA</Button>
        </Card>
      </div>
    </div>
  );
};

export default App;
