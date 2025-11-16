// FIX: Corrected React import to include FC, useState, and useMemo, and removed the incorrect 'aistudio' import.
import React, { FC, useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ReferenceArea
} from 'recharts';
import { useAthletes } from './hooks';
import { Athlete, Bioimpedance, Cmj, GeneralStrengthExercise, IsometricStrength, Vo2max, AssessmentType, GeneralStrength, AssessmentData } from './types';
import { calculateAge, calculateIQRatios, calculateVo2maxZones, formatDate } from './utils';
import toast from 'react-hot-toast';

// --- ICONS ---
const UserIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const PlusIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);
const ArrowLeftIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);
const PDFIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const SearchIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const LogoutIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);
const BodyIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75l3 3m0 0l3-3m-3 3v6m0 0l-3 3m3-3l3 3m-6-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm12-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.75 6.75h.008v.008H6.75V6.75zm10.5 0h.008v.008h-.008V6.75z" />
    </svg>
);
const MuscleIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" opacity="0.5" />
    </svg>
);
const BarbellIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12H3m16-4H5m14-4H7m10 16H7m12-4H5" />
    </svg>
);
const JumpIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
    </svg>
);
const LungsIcon: FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6C9.25 6 7 8.25 7 11v6c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4v-6c0-2.75-2.25-5-5-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6V4c0-1.1.9-2 2-2s2 .9 2 2v2m-4 11v3m4-3v3" />
    </svg>
);
const EditIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);


// --- LOGO ---
const LbSportsLogo: FC<{ className?: string; isPrinting?: boolean }> = ({ className, isPrinting }) => (
    <div className={`flex items-center gap-4 ${className}`}>
        <svg width="60" height="40" viewBox="0 0 150 100" className={isPrinting ? 'text-black' : 'text-brand-secondary'}>
            <path d="M10 80 Q 20 20, 40 50 T 70 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6"/>
            <path d="M40 80 Q 50 20, 70 50 T 100 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8"/>
            <path d="M70 80 Q 80 20, 100 50 T 130 80" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M0 50 H 20 L 25 40 L 30 60 L 35 50 H 115 L 120 60 L 125 40 L 130 50 H 150" stroke={isPrinting ? '#888' : '#E53E3E'} strokeWidth="3" fill="none"/>
        </svg>
        <div>
            <h1 className={`text-xl font-bold tracking-wider ${isPrinting ? 'text-black' : 'text-white'}`}>LB SPORTS</h1>
            <p className={`text-xs ${isPrinting ? 'text-gray-600' : 'text-gray-300'}`}>Performance e Prevenção de Lesão</p>
        </div>
    </div>
);


// --- UI COMPONENTS ---
const Card: FC<{ children: React.ReactNode; className?: string; onClick?: () => void; }> = ({ children, className, onClick }) => (
    <div onClick={onClick} className={`bg-gray-800 shadow-lg rounded-xl p-4 md:p-6 ${className}`}>
        {children}
    </div>
);


const Button: FC<{ onClick?: () => void; children: React.ReactNode; className?: string, variant?: 'primary' | 'secondary', type?: 'button' | 'submit' }> = ({ onClick, children, className, variant = 'primary', type = 'button' }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 no-print";
    const variantClasses = variant === 'primary' 
        ? "bg-brand-primary hover:bg-brand-dark text-white shadow-md hover:shadow-lg" 
        : "bg-gray-600 hover:bg-gray-500 text-gray-100";
    return <button onClick={onClick} type={type} className={`${baseClasses} ${variantClasses} ${className}`}>{children}</button>;
};

// --- ANATOMY SVG ---
const Anatomy: FC<{ highlightedMuscles: ('quadricepsR' | 'quadricepsL' | 'hamstringsR' | 'hamstringsL')[] }> = ({ highlightedMuscles }) => {
    const isHighlighted = (muscle: string) => highlightedMuscles.includes(muscle as any);
    const highlightClass = "fill-accent-red opacity-80";
    const baseBodyClass = "fill-gray-700";
    const baseMuscleClass = "fill-gray-600";
    const glowFilter = (
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    );

    const AnteriorFigure = () => (
        <svg viewBox="0 0 200 400" className="w-full h-auto max-w-[150px]">
            <defs>{glowFilter}</defs>
            <g className={baseBodyClass}>
                {/* Head */}
                <path d="M100 5 C115 5 125 15 125 30 S115 55 100 55 S75 45 75 30 S85 5 100 5 Z"/>
                {/* Torso */}
                <path d="M100 60 C130 60 140 90 140 120 L135 180 C135 185 130 190 120 190 L80 190 C70 190 65 185 65 180 L60 120 C60 90 70 60 100 60 Z"/>
                {/* Arms */}
                <path d="M140 100 L150 120 L165 220 L155 225 L140 130 Z"/>
                <path d="M60 100 L50 120 L35 220 L45 225 L60 130 Z"/>
                {/* Legs */}
                <path d="M80 190 L70 250 L60 380 L75 390 L85 250 Z"/>
                <path d="M120 190 L130 250 L140 380 L125 390 L115 250 Z"/>
            </g>
            {/* Muscles - Quads */}
            <g style={{ filter: isHighlighted('quadricepsR') ? 'url(#glow)' : 'none' }}>
                <path className={isHighlighted('quadricepsR') ? highlightClass : baseMuscleClass} d="M80 192 C80 200 70 220 72 250 L85 248 C83 220 88 200 88 192 Z"/>
            </g>
            <g style={{ filter: isHighlighted('quadricepsL') ? 'url(#glow)' : 'none' }}>
                <path className={isHighlighted('quadricepsL') ? highlightClass : baseMuscleClass} d="M120 192 C120 200 130 220 128 250 L115 248 C117 220 112 200 112 192 Z"/>
            </g>
        </svg>
    );

    const PosteriorFigure = () => (
        <svg viewBox="0 0 200 400" className="w-full h-auto max-w-[150px]">
            <defs>{glowFilter}</defs>
             <g className={baseBodyClass}>
                {/* Head */}
                <path d="M100 5 C115 5 125 15 125 30 S115 55 100 55 S75 45 75 30 S85 5 100 5 Z"/>
                {/* Torso */}
                <path d="M100 60 C130 60 140 90 140 120 L135 180 C135 185 130 190 120 190 L80 190 C70 190 65 185 65 180 L60 120 C60 90 70 60 100 60 Z"/>
                {/* Arms */}
                <path d="M140 100 L150 120 L165 220 L155 225 L140 130 Z"/>
                <path d="M60 100 L50 120 L35 220 L45 225 L60 130 Z"/>
                {/* Legs */}
                <path d="M80 190 L70 250 L60 380 L75 390 L85 250 Z"/>
                <path d="M120 190 L130 250 L140 380 L125 390 L115 250 Z"/>
            </g>
            {/* Muscles - Hamstrings */}
            <g style={{ filter: isHighlighted('hamstringsL') ? 'url(#glow)' : 'none' }}>
                <path className={isHighlighted('hamstringsL') ? highlightClass : baseMuscleClass} d="M82 192 C85 210 85 230 82 250 L72 250 C75 230 75 210 72 192 Z"/>
            </g>
             <g style={{ filter: isHighlighted('hamstringsR') ? 'url(#glow)' : 'none' }}>
                <path className={isHighlighted('hamstringsR') ? highlightClass : baseMuscleClass} d="M118 192 C115 210 115 230 118 250 L128 250 C125 230 125 210 128 192 Z"/>
            </g>
        </svg>
    );

    return (
        <div className="flex justify-around items-start">
            <div className="text-center px-2">
                <div className="relative">
                    <AnteriorFigure />
                    <p className="absolute top-0 left-[35%] -translate-x-1/2 font-bold text-lg text-gray-400">D</p>
                    <p className="absolute top-0 right-[35%] translate-x-1/2 font-bold text-lg text-gray-400">E</p>
                </div>
                <p className="text-sm font-semibold text-gray-400 mt-2">Vista Anterior</p>
                <p className="text-xs text-gray-500">(Quadríceps)</p>
            </div>
            <div className="text-center px-2">
                 <div className="relative">
                    <PosteriorFigure />
                    <p className="absolute top-0 left-[35%] -translate-x-1/2 font-bold text-lg text-gray-400">E</p>
                    <p className="absolute top-0 right-[35%] translate-x-1/2 font-bold text-lg text-gray-400">D</p>
                </div>
                <p className="text-sm font-semibold text-gray-400 mt-2">Vista Posterior</p>
                <p className="text-xs text-gray-500">(Isquiotibiais)</p>
            </div>
        </div>
    );
};


// --- ASSESSMENT COMPONENTS ---

const AssessmentSection: FC<{ title: string; children: React.ReactNode; onAdd: () => void; onExportPDF: () => void; isReadOnly?: boolean }> = ({ title, children, onAdd, onExportPDF, isReadOnly }) => (
    <Card className="flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-brand-light">{title}</h3>
            <div className="flex items-center gap-2">
                 {!isReadOnly && (
                    <Button onClick={onAdd} variant="secondary" className="!px-3">
                        <PlusIcon className="w-5 h-5" />
                    </Button>
                )}
                <Button onClick={onExportPDF} variant="secondary" className="!px-3">
                    <PDFIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Exportar PDF</span>
                </Button>
            </div>
        </div>
        <div className="flex-grow">{children}</div>
    </Card>
);

const NoData: FC<{ message?: string }> = ({ message = "Nenhuma avaliação encontrada." }) => (
    <div className="flex items-center justify-center h-full text-gray-500 min-h-[200px]">
        <p>{message}</p>
    </div>
);

// --- Form Components ---
const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`bg-gray-800 p-2 rounded ${props.className}`} />
);
const Textarea: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className={`bg-gray-800 p-2 rounded w-full ${props.className}`} />
);
const Select: FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`bg-gray-800 p-2 rounded w-full ${props.className}`} />
);

const AddAssessmentModal: FC<{ title: string; children: React.ReactNode; onCancel: () => void; onSubmit: (e: React.FormEvent) => void, isEditing?: boolean }> = ({ title, children, onCancel, onSubmit, isEditing }) => (
    <form onSubmit={onSubmit} className="space-y-4 p-4 bg-gray-700 rounded-lg">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        {children}
        <div className="flex justify-end gap-2">
            <Button onClick={onCancel} variant="secondary" type="button">Cancelar</Button>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Salvar'}</Button>
        </div>
    </form>
);

const BioimpedanceForm: FC<{ onSave: (data: Omit<Bioimpedance, 'id'> | Bioimpedance) => void; onCancel: () => void; initialData?: Bioimpedance }> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        weight: initialData?.weight.toString() || '',
        fatPercentage: initialData?.fatPercentage.toString() || '',
        muscleMass: initialData?.muscleMass.toString() || '',
        visceralFat: initialData?.visceralFat.toString() || '',
        hydration: initialData?.hydration.toString() || '',
        observations: initialData?.observations || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericData = {
            weight: parseFloat(formData.weight),
            fatPercentage: parseFloat(formData.fatPercentage),
            muscleMass: parseFloat(formData.muscleMass),
            visceralFat: parseInt(formData.visceralFat),
            hydration: parseFloat(formData.hydration),
        };
        if (Object.values(numericData).some(isNaN) || !formData.date) {
            toast.error("Por favor, preencha todos os campos com valores válidos, incluindo a data.");
            return;
        }
        
        if (isEditing) {
            onSave({ ...initialData, date: formData.date, ...numericData, observations: formData.observations });
        } else {
            onSave({ date: formData.date, ...numericData, observations: formData.observations });
        }
    };

    return (
        <AddAssessmentModal title={isEditing ? "Editar Avaliação de Bioimpedância" : "Nova Avaliação de Bioimpedância"} onCancel={onCancel} onSubmit={handleSubmit} isEditing={isEditing}>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data da Avaliação</label>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input type="number" step="any" name="weight" placeholder="Peso (kg)" value={formData.weight} onChange={handleChange} />
                    <Input type="number" step="any" name="fatPercentage" placeholder="% Gordura" value={formData.fatPercentage} onChange={handleChange} />
                    <Input type="number" step="any" name="muscleMass" placeholder="Massa Muscular (kg)" value={formData.muscleMass} onChange={handleChange} />
                    <Input type="number" step="any" name="visceralFat" placeholder="Gordura Visceral" value={formData.visceralFat} onChange={handleChange} />
                    <Input type="number" step="any" name="hydration" placeholder="Hidratação (%)" value={formData.hydration} onChange={handleChange} />
                </div>
                <Textarea name="observations" placeholder="Observações e recomendações..." value={formData.observations} onChange={handleChange} rows={3} />
            </div>
        </AddAssessmentModal>
    );
};

const IsometricStrengthForm: FC<{ onSave: (data: Omit<IsometricStrength, 'id'> | IsometricStrength) => void; onCancel: () => void; initialData?: IsometricStrength }> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        quadricepsR: initialData?.quadricepsR.toString() || '',
        quadricepsL: initialData?.quadricepsL.toString() || '',
        hamstringsR: initialData?.hamstringsR.toString() || '',
        hamstringsL: initialData?.hamstringsL.toString() || '',
        observations: initialData?.observations || ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericData = {
            quadricepsR: parseFloat(formData.quadricepsR),
            quadricepsL: parseFloat(formData.quadricepsL),
            hamstringsR: parseFloat(formData.hamstringsR),
            hamstringsL: parseFloat(formData.hamstringsL),
        };
         if (Object.values(numericData).some(isNaN) || !formData.date) {
            toast.error("Por favor, preencha todos os campos com valores válidos, incluindo a data.");
            return;
        }
        if (isEditing) {
            onSave({ ...initialData, date: formData.date, ...numericData, observations: formData.observations });
        } else {
            onSave({ date: formData.date, ...numericData, observations: formData.observations });
        }
    };
    return (
        <AddAssessmentModal title={isEditing ? "Editar Avaliação de Força Isométrica" : "Nova Avaliação de Força Isométrica"} onCancel={onCancel} onSubmit={handleSubmit} isEditing={isEditing}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data da Avaliação</label>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <Input type="number" step="any" name="quadricepsR" placeholder="Quadríceps D (kgf)" value={formData.quadricepsR} onChange={handleChange} />
                     <Input type="number" step="any" name="quadricepsL" placeholder="Quadríceps E (kgf)" value={formData.quadricepsL} onChange={handleChange} />
                     <Input type="number" step="any" name="hamstringsR" placeholder="Isquiotibiais D (kgf)" value={formData.hamstringsR} onChange={handleChange} />
                     <Input type="number" step="any" name="hamstringsL" placeholder="Isquiotibiais E (kgf)" value={formData.hamstringsL} onChange={handleChange} />
                </div>
                <Textarea name="observations" placeholder="Observações e recomendações..." value={formData.observations} onChange={handleChange} rows={3} />
            </div>
        </AddAssessmentModal>
    );
};

const CMJForm: FC<{ onSave: (data: Omit<Cmj, 'id'> | Cmj) => void; onCancel: () => void; initialData?: Cmj }> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        height: initialData?.height.toString() || '',
        power: initialData?.power.toString() || '',
        depth: initialData?.depth.toString() || '',
        unilateralJumpR: initialData?.unilateralJumpR?.toString() || '',
        unilateralJumpL: initialData?.unilateralJumpL?.toString() || '',
        load: initialData?.load?.toString() || '',
        observations: initialData?.observations || ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { date, observations, ...rest} = formData;
        const numericData = {
            height: parseFloat(rest.height),
            power: parseFloat(rest.power),
            depth: parseFloat(rest.depth),
            unilateralJumpR: rest.unilateralJumpR ? parseFloat(rest.unilateralJumpR) : undefined,
            unilateralJumpL: rest.unilateralJumpL ? parseFloat(rest.unilateralJumpL) : undefined,
            load: rest.load ? parseFloat(rest.load) : undefined,
        };
        if (isNaN(numericData.height) || isNaN(numericData.power) || isNaN(numericData.depth) || !date) {
            toast.error("Por favor, preencha os campos obrigatórios (Data, Altura, Potência, Profundidade).");
            return;
        }

        if (isEditing) {
            onSave({ ...initialData, date, ...numericData, observations } as Cmj);
        } else {
            onSave({ date, ...numericData, observations } as Omit<Cmj, 'id'>);
        }
    };

    return (
        <AddAssessmentModal title={isEditing ? "Editar Avaliação de CMJ" : "Nova Avaliação de CMJ"} onCancel={onCancel} onSubmit={handleSubmit} isEditing={isEditing}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data da Avaliação</label>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input type="number" step="any" name="height" placeholder="Altura do Salto (cm)" value={formData.height} onChange={handleChange} required />
                    <Input type="number" step="any" name="depth" placeholder="Profundidade (cm)" value={formData.depth} onChange={handleChange} required />
                    <Input type="number" step="any" name="power" placeholder="Potência (W)" value={formData.power} onChange={handleChange} required />
                    <Input type="number" step="any" name="load" placeholder="Carga (kg)" value={formData.load} onChange={handleChange} />
                    <Input type="number" step="any" name="unilateralJumpR" placeholder="Salto Uni. Direito (cm)" value={formData.unilateralJumpR} onChange={handleChange} />
                    <Input type="number" step="any" name="unilateralJumpL" placeholder="Salto Uni. Esquerdo (cm)" value={formData.unilateralJumpL} onChange={handleChange} />
                </div>
                 <Textarea name="observations" placeholder="Observações e recomendações..." value={formData.observations} onChange={handleChange} rows={3} />
            </div>
        </AddAssessmentModal>
    );
};

const GeneralStrengthForm: FC<{ onSave: (data: Omit<GeneralStrength, 'id'> | GeneralStrength) => void; onCancel: () => void; initialData?: GeneralStrength }> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        exercise: initialData?.exercise || GeneralStrengthExercise.HALF_SQUAT,
        load: initialData?.load.toString() || '',
        observations: initialData?.observations || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            date: formData.date,
            exercise: formData.exercise,
            load: parseFloat(formData.load),
            observations: formData.observations,
        };
        if (isNaN(data.load) || !data.date) {
            toast.error("Por favor, insira uma data e carga válidas.");
            return;
        }
        if (isEditing) {
            onSave({ ...initialData, ...data });
        } else {
            onSave(data);
        }
    };

    return (
        <AddAssessmentModal title={isEditing ? "Editar Avaliação de Força Geral" : "Nova Avaliação de Força Geral"} onCancel={onCancel} onSubmit={handleSubmit} isEditing={isEditing}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data da Avaliação</label>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Select name="exercise" value={formData.exercise} onChange={handleChange}>
                        {Object.values(GeneralStrengthExercise).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </Select>
                    <Input type="number" step="any" name="load" placeholder="Carga (kg)" value={formData.load} onChange={handleChange} />
                </div>
                <Textarea name="observations" placeholder="Observações e recomendações..." value={formData.observations} onChange={handleChange} rows={3} />
            </div>
        </AddAssessmentModal>
    );
};

const VO2MaxForm: FC<{ onSave: (data: Omit<Vo2max, 'id'> | Vo2max) => void; onCancel: () => void; initialData?: Vo2max }> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        date: initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        vo2max: initialData?.vo2max.toString() || '', maxHeartRate: initialData?.maxHeartRate.toString() || '', thresholdHeartRate: initialData?.thresholdHeartRate.toString() || '', maxVentilation: initialData?.maxVentilation.toString() || '',
        thresholdVentilation: initialData?.thresholdVentilation.toString() || '', maxLoad: initialData?.maxLoad.toString() || '', thresholdLoad: initialData?.thresholdLoad.toString() || '', vam: initialData?.vam.toString() || '',
        rec10s: initialData?.rec10s.toString() || '', rec30s: initialData?.rec30s.toString() || '', rec60s: initialData?.rec60s.toString() || '', score: initialData?.score.toString() || '', observations: initialData?.observations || ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { observations, date, ...rest } = formData;
        const numericData = Object.fromEntries(
            Object.entries(rest).map(([key, value]) => [key, parseFloat(value as string)])
        );
        if (Object.values(numericData).some(isNaN) || !date) {
            toast.error("Por favor, preencha todos os campos com valores válidos, incluindo a data.");
            return;
        }
        if (isEditing) {
            onSave({ ...initialData, date, ...numericData, observations } as Vo2max);
        } else {
            onSave({ date, ...numericData, observations } as Omit<Vo2max, 'id'>);
        }
    };

    return (
        <AddAssessmentModal title={isEditing ? "Editar Avaliação de VO₂ máx" : "Nova Avaliação de VO₂ máx"} onCancel={onCancel} onSubmit={handleSubmit} isEditing={isEditing}>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Data da Avaliação</label>
                    <Input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input type="number" step="any" name="vo2max" placeholder="VO₂ máx (ml/kg*min)" value={formData.vo2max} onChange={handleChange} />
                    <Input type="number" step="any" name="vam" placeholder="VAM (km/h)" value={formData.vam} onChange={handleChange} />
                    <Input type="number" step="any" name="maxHeartRate" placeholder="FC Máx (bpm)" value={formData.maxHeartRate} onChange={handleChange} />
                    <Input type="number" step="any" name="thresholdHeartRate" placeholder="FC Limiar (bpm)" value={formData.thresholdHeartRate} onChange={handleChange} />
                    <Input type="number" step="any" name="maxLoad" placeholder="Carga Máx (km/h)" value={formData.maxLoad} onChange={handleChange} />
                    <Input type="number" step="any" name="thresholdLoad" placeholder="Carga Limiar (km/h)" value={formData.thresholdLoad} onChange={handleChange} />
                    <Input type="number" step="any" name="maxVentilation" placeholder="Vent. Máx (l/min)" value={formData.maxVentilation} onChange={handleChange} />
                    <Input type="number" step="any" name="thresholdVentilation" placeholder="Vent. Limiar (l/min)" value={formData.thresholdVentilation} onChange={handleChange} />
                    <Input type="number" step="any" name="rec10s" placeholder="Rec 10s (bpm)" value={formData.rec10s} onChange={handleChange} />
                    <Input type="number" step="any" name="rec30s" placeholder="Rec 30s (bpm)" value={formData.rec30s} onChange={handleChange} />
                    <Input type="number" step="any" name="rec60s" placeholder="Rec 60s (bpm)" value={formData.rec60s} onChange={handleChange} />
                    <Input type="number" step="any" name="score" placeholder="Score (0-100)" value={formData.score} onChange={handleChange} />
                </div>
                <Textarea name="observations" placeholder="Observações e recomendações..." value={formData.observations} onChange={handleChange} rows={3} />
            </div>
        </AddAssessmentModal>
    );
};

// --- VIEW Components ---
const BioimpedanceView: FC<{ assessments: Bioimpedance[], isPrinting?: boolean, onEdit: (assessment: Bioimpedance) => void, isReadOnly?: boolean }> = ({ assessments, isPrinting, onEdit, isReadOnly }) => {
    const latest = assessments[0];

    const evolutionData = useMemo(() => {
        if (!assessments || assessments.length === 0) return [];
        return [...assessments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                date: formatDate(a.date),
                weight: a.weight,
                muscleMass: a.muscleMass,
                fatMass: parseFloat((a.weight * (a.fatPercentage / 100)).toFixed(2)),
            }));
    }, [assessments]);

    if (!latest) return <NoData />;

    const latestFatMass = latest.weight * (latest.fatPercentage / 100);

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center gap-2 text-sm text-gray-400">
                Última avaliação: {formatDate(latest.date)}
                {!isReadOnly && !isPrinting && <button onClick={() => onEdit(latest)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-brand-light">Peso Total</p>
                    <p className="text-2xl font-bold text-white">{latest.weight.toFixed(1)} <span className="text-base font-normal">kg</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-brand-light">Massa Muscular</p>
                    <p className="text-2xl font-bold text-white">{latest.muscleMass.toFixed(1)} <span className="text-base font-normal">kg</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-brand-light">% Gordura</p>
                    <p className="text-2xl font-bold text-white">{latest.fatPercentage.toFixed(1)}<span className="text-base font-normal">%</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-brand-light">Massa Gorda</p>
                    <p className="text-2xl font-bold text-white">{latestFatMass.toFixed(1)} <span className="text-base font-normal">kg</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-brand-light">Gordura Visceral</p>
                    <p className="text-2xl font-bold text-white">{latest.visceralFat}</p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-sm text-brand-light">Hidratação</p>
                    <p className="text-2xl font-bold text-white">{latest.hydration.toFixed(1)}<span className="text-base font-normal">%</span></p>
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-center mb-4 text-brand-light">Evolução da Composição Corporal (kg)</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="date" stroke="#9CA3AF"/>
                        <YAxis stroke="#9CA3AF" label={{ value: 'Massa (kg)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }}/>
                        <Legend />
                        <Area type="monotone" dataKey="weight" name="Peso Total" stroke="#8884d8" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={2} />
                        <Area type="monotone" dataKey="muscleMass" name="Massa Muscular" stroke="#82ca9d" fillOpacity={1} fill="url(#colorMuscle)" strokeWidth={2} />
                        <Area type="monotone" dataKey="fatMass" name="Massa Gorda" stroke="#ffc658" fillOpacity={1} fill="url(#colorFat)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            {latest.observations && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Observações do Avaliador</h4>
                    <p className="text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg">{latest.observations}</p>
                </div>
            )}

            {!isPrinting && assessments.length > 1 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Histórico de Avaliações</h4>
                    <div className="space-y-2">
                        {assessments.slice(1).map(asm => (
                            <div key={asm.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                <span>{formatDate(asm.date)} - Peso: {asm.weight.toFixed(1)}kg, %G: {asm.fatPercentage.toFixed(1)}%</span>
                                {!isReadOnly && <button onClick={() => onEdit(asm)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const IsometricStrengthView: FC<{ assessments: IsometricStrength[], isPrinting?: boolean, onEdit: (assessment: IsometricStrength) => void, isReadOnly?: boolean }> = ({ assessments, isPrinting, onEdit, isReadOnly }) => {
    const latest = assessments[0];
    const [highlightedMuscles, setHighlightedMuscles] = useState<('quadricepsR' | 'quadricepsL' | 'hamstringsR' | 'hamstringsL')[]>([]);

    const evolutionData = useMemo(() => {
        if (assessments.length < 2) return [];
        return [...assessments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                date: formatDate(a.date),
                quadriceps: (a.quadricepsR + a.quadricepsL) / 2,
                hamstrings: (a.hamstringsR + a.hamstringsL) / 2,
            }));
    }, [assessments]);

    const iqEvolutionData = useMemo(() => {
        if (assessments.length < 2) return [];
        return [...assessments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => {
                const ratios = calculateIQRatios(a.quadricepsR, a.quadricepsL, a.hamstringsR, a.hamstringsL);
                return {
                    date: formatDate(a.date),
                    right: ratios.right.ratio,
                    left: ratios.left.ratio,
                };
            });
    }, [assessments]);

    if (!latest) return <NoData />;

    const { right, left } = calculateIQRatios(latest.quadricepsR, latest.quadricepsL, latest.hamstringsR, latest.hamstringsL);
    
    const calculateAsymmetry = (valR: number, valL: number): number => {
        if (valR === 0 && valL === 0) return 0;
        const maxVal = Math.max(valR, valL);
        if (maxVal === 0) return 0;
        return (Math.abs(valR - valL) / maxVal) * 100;
    };

    const quadricepsAsymmetry = calculateAsymmetry(latest.quadricepsR, latest.quadricepsL);
    const hamstringsAsymmetry = calculateAsymmetry(latest.hamstringsR, latest.hamstringsL);

    const getAsymmetryStatus = (asymmetry: number): { color: string; label: string } => {
        if (asymmetry <= 10) {
            return { color: 'text-accent-green', label: 'Aceitável' };
        } else if (asymmetry > 10 && asymmetry <= 15) {
            return { color: 'text-yellow-400', label: 'Atenção' };
        } else {
            return { color: 'text-accent-red', label: 'Risco Alto para Lesões' };
        }
    };

    const quadStatus = getAsymmetryStatus(quadricepsAsymmetry);
    const hamStatus = getAsymmetryStatus(hamstringsAsymmetry);


    return (
         <div className="space-y-8">
             <div className="flex justify-end items-center gap-2 text-sm text-gray-400">
                Última avaliação: {formatDate(latest.date)}
                {!isReadOnly && !isPrinting && <button onClick={() => onEdit(latest)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
            </div>
             <div className="grid md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                    <div 
                        onMouseEnter={() => setHighlightedMuscles(['quadricepsL', 'hamstringsL'])} 
                        onMouseLeave={() => setHighlightedMuscles([])} 
                        className="p-3 rounded-lg bg-gray-700/50"
                    >
                        <h4 className="font-bold text-lg text-brand-light text-center">Perna Esquerda</h4>
                        <p>Quadríceps: <span className="font-bold text-white">{latest.quadricepsL.toFixed(2)} kgf</span></p>
                        <p>Isquiotibiais: <span className="font-bold text-white">{latest.hamstringsL.toFixed(2)} kgf</span></p>
                        <p>Razão I/Q: <span className={`font-bold ${left.status === 'good' ? 'text-accent-green' : 'text-accent-red'}`}>{left.ratio}%</span></p>
                    </div>
                     <div 
                        onMouseEnter={() => setHighlightedMuscles(['quadricepsR', 'hamstringsR'])} 
                        onMouseLeave={() => setHighlightedMuscles([])} 
                        className="p-3 rounded-lg bg-gray-700/50"
                    >
                        <h4 className="font-bold text-lg text-brand-light text-center">Perna Direita</h4>
                        <p>Quadríceps: <span className="font-bold text-white">{latest.quadricepsR.toFixed(2)} kgf</span></p>
                        <p>Isquiotibiais: <span className="font-bold text-white">{latest.hamstringsR.toFixed(2)} kgf</span></p>
                        <p>Razão I/Q: <span className={`font-bold ${right.status === 'good' ? 'text-accent-green' : 'text-accent-red'}`}>{right.ratio}%</span></p>
                    </div>
                    <p className="text-xs text-center text-gray-400">Razão ideal entre 50% e 60%.</p>
                </div>
                <div>
                    <Anatomy highlightedMuscles={highlightedMuscles} />
                </div>
             </div>

            <div className="mt-6">
                <h4 className="font-bold text-lg text-brand-light text-center mb-4">Assimetria Contralateral</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-sm text-brand-light">Quadríceps</p>
                        <p className={`text-2xl font-bold ${quadStatus.color}`}>{quadricepsAsymmetry.toFixed(1)}<span className="text-base font-normal">%</span></p>
                        <p className={`text-xs font-semibold ${quadStatus.color}`}>{quadStatus.label}</p>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-sm text-brand-light">Isquiotibiais</p>
                        <p className={`text-2xl font-bold ${hamStatus.color}`}>{hamstringsAsymmetry.toFixed(1)}<span className="text-base font-normal">%</span></p>
                        <p className={`text-xs font-semibold ${hamStatus.color}`}>{hamStatus.label}</p>
                    </div>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">Valores de assimetria de até 10% são considerados aceitáveis.</p>
            </div>
            
            {assessments.length > 1 && (
                <>
                    <div>
                        <h4 className="font-semibold text-center mb-4 text-brand-light">Evolução da Força (Média D/E)</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                <XAxis dataKey="date" stroke="#9CA3AF"/>
                                <YAxis stroke="#9CA3AF" label={{ value: 'Força (kgf)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="quadriceps" name="Quadríceps" stroke="#8884d8" strokeWidth={2} />
                                <Line type="monotone" dataKey="hamstrings" name="Isquiotibiais" stroke="#82ca9d" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 className="font-semibold text-center mb-4 text-brand-light">Evolução da Razão I/Q (%)</h4>
                        <ResponsiveContainer width="100%" height={250}>
                             <LineChart data={iqEvolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                <XAxis dataKey="date" stroke="#9CA3AF"/>
                                <YAxis stroke="#9CA3AF" domain={[40, 70]} label={{ value: 'Razão (%)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }}/>
                                <Legend />
                                <ReferenceArea y1={50} y2={60} fill="#38A169" fillOpacity={0.2} label={{ value: 'Ideal', position: 'insideTopLeft', fill: '#A0AEC0' }}/>
                                <Line type="monotone" dataKey="right" name="Perna Direita" stroke="#ffc658" strokeWidth={2} />
                                <Line type="monotone" dataKey="left" name="Perna Esquerda" stroke="#E53E3E" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

             {latest.observations && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Observações do Avaliador</h4>
                    <p className="text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg">{latest.observations}</p>
                </div>
            )}
            {!isPrinting && assessments.length > 1 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Histórico de Avaliações</h4>
                    <div className="space-y-2">
                        {assessments.slice(1).map(asm => (
                            <div key={asm.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                <span>{formatDate(asm.date)} - Q: {asm.quadricepsR.toFixed(1)}/{asm.quadricepsL.toFixed(1)}, I: {asm.hamstringsR.toFixed(1)}/{asm.hamstringsL.toFixed(1)}</span>
                                {!isReadOnly && <button onClick={() => onEdit(asm)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
    );
};

const GeneralStrengthView: FC<{ assessments: GeneralStrength[], isPrinting?: boolean, onEdit: (assessment: GeneralStrength) => void, isReadOnly?: boolean }> = ({ assessments, isPrinting, onEdit, isReadOnly }) => {
    const latest = assessments[0];
    const { latestByExercise, evolutionData } = useMemo(() => {
        if (assessments.length === 0) return { latestByExercise: [], evolutionData: [] };

        // FIX: Corrected accumulator type for type safety.
        const grouped = assessments.reduce((acc: Record<GeneralStrengthExercise, GeneralStrength[]>, a) => {
            if (!acc[a.exercise]) {
                acc[a.exercise] = [];
            }
            acc[a.exercise].push(a);
            return acc;
        }, {} as Record<GeneralStrengthExercise, GeneralStrength[]>);

        // FIX: Safely iterate over enum values to ensure type safety.
        const latestByExercise = (Object.keys(GeneralStrengthExercise) as Array<keyof typeof GeneralStrengthExercise>).map(key => {
            const ex = GeneralStrengthExercise[key];
            return grouped[ex]?.[0];
        }).filter(Boolean) as GeneralStrength[];

        // FIX: Use spread syntax to ensure `dates` is correctly typed as `string[]`, which resolves downstream type errors.
        // FIX: Explicitly typed the sort callback parameters `a` and `b` as `string` to resolve type inference errors.
        const dates = [...new Set(assessments.map(a => a.date))].sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
        const evolutionData = dates.map(date => {
            const entry: { [key: string]: any } = { date: formatDate(date) };
            // FIX: Safely iterate over enum values to ensure type safety.
            for (const key of (Object.keys(GeneralStrengthExercise) as Array<keyof typeof GeneralStrengthExercise>)) {
                const ex = GeneralStrengthExercise[key];
                const assessmentForDate = assessments.find(a => a.date === date && a.exercise === ex);
                entry[ex] = assessmentForDate ? assessmentForDate.load : null;
            }
            return entry;
        });

        return { latestByExercise, evolutionData };
    }, [assessments]);

    if (assessments.length === 0) return <NoData />;

    const colors = {
        [GeneralStrengthExercise.HALF_SQUAT]: "#8884d8",
        [GeneralStrengthExercise.BENCH_PRESS]: "#82ca9d",
        [GeneralStrengthExercise.ROW]: "#ffc658",
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-center mb-4 text-brand-light">Cargas Atuais</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {latestByExercise.length > 0 ? latestByExercise.map(a => (
                        <div key={a.id} className="bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm text-brand-light">{a.exercise}</p>
                            <p className="text-2xl font-bold text-white">{a.load} <span className="text-base font-normal">kg</span></p>
                            <div className="flex justify-center items-center gap-2 text-xs text-gray-500">
                                {formatDate(a.date)}
                                {!isReadOnly && !isPrinting && <button onClick={() => onEdit(a)} className="text-gray-400 hover:text-white"><EditIcon className="w-3 h-3" /></button>}
                            </div>
                        </div>
                    )) : <p className="text-gray-500 col-span-3">Nenhum dado recente.</p>}
                </div>
            </div>
             <div>
                <h4 className="font-semibold text-center mb-4 text-brand-light">Evolução da Força (kg)</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="date" stroke="#9CA3AF"/>
                        <YAxis stroke="#9CA3AF" label={{ value: 'Carga (kg)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }}/>
                        <Legend />
                        {/* FIX: Safely iterate over enum values to ensure type safety. */}
                        {(Object.keys(GeneralStrengthExercise) as Array<keyof typeof GeneralStrengthExercise>).map(key => {
                            const ex = GeneralStrengthExercise[key];
                            return <Line key={ex} type="monotone" dataKey={ex} stroke={colors[ex]} connectNulls strokeWidth={2} />
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {latest?.observations && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Observações da Última Avaliação</h4>
                    <p className="text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg">{latest.observations}</p>
                </div>
            )}
        </div>
    );
};

const CMJView: FC<{ assessments: Cmj[], isPrinting?: boolean, onEdit: (assessment: Cmj) => void, isReadOnly?: boolean }> = ({ assessments, isPrinting, onEdit, isReadOnly }) => {
    const latest = assessments[0];
    if (!latest) return <NoData />;

    const flightTime = latest.height > 0 ? 2 * Math.sqrt(2 * (latest.height / 100) / 9.81) * 1000 : 0;
    const rsi = latest.depth > 0 ? latest.height / latest.depth : 0;
    
    const unilateralAsymmetry = (latest.unilateralJumpR && latest.unilateralJumpL && latest.unilateralJumpR > 0 && latest.unilateralJumpL > 0)
        ? (Math.abs(latest.unilateralJumpR - latest.unilateralJumpL) / Math.max(latest.unilateralJumpR, latest.unilateralJumpL)) * 100
        : null;

    const evolutionData = useMemo(() => {
        if (!assessments || assessments.length < 2) return [];
        return [...assessments]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(a => ({
                date: formatDate(a.date),
                height: a.height,
                power: a.power,
            }));
    }, [assessments]);

    return (
         <div className="space-y-4">
            <div className="flex justify-end items-center gap-2 text-sm text-gray-400">
                Última avaliação: {formatDate(latest.date)}
                {!isReadOnly && !isPrinting && <button onClick={() => onEdit(latest)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-700/50 p-3 rounded">
                    <p className="text-sm text-brand-light">Altura do Salto</p>
                    <p className="text-2xl font-bold text-white">{latest.height.toFixed(2)} <span className="text-base font-normal">cm</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                    <p className="text-sm text-brand-light">Profundidade</p>
                    <p className="text-2xl font-bold text-white">{latest.depth.toFixed(2)} <span className="text-base font-normal">cm</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                    <p className="text-sm text-brand-light">Potência</p>
                    <p className="text-2xl font-bold text-white">{latest.power} <span className="text-base font-normal">W</span></p>
                </div>
                <div className="bg-gray-700/50 p-3 rounded">
                    <p className="text-sm text-brand-light">Tempo de Voo</p>
                    <p className="text-2xl font-bold text-white">{flightTime.toFixed(0)} <span className="text-base font-normal">ms</span></p>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded">
                    <p className="text-sm text-brand-light">RSI (Modificado)</p>
                    <p className="text-2xl font-bold text-white">{rsi.toFixed(2)}</p>
                </div>
                {typeof latest.load === 'number' && (
                     <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-brand-light">Carga Externa</p>
                        <p className="text-2xl font-bold text-white">{latest.load} <span className="text-base font-normal">kg</span></p>
                    </div>
                )}
                {typeof latest.unilateralJumpR === 'number' && (
                    <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-brand-light">Salto Uni. Direito</p>
                        <p className="text-2xl font-bold text-white">{latest.unilateralJumpR.toFixed(2)} <span className="text-base font-normal">cm</span></p>
                    </div>
                )}
                {typeof latest.unilateralJumpL === 'number' && (
                    <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-brand-light">Salto Uni. Esquerdo</p>
                        <p className="text-2xl font-bold text-white">{latest.unilateralJumpL.toFixed(2)} <span className="text-base font-normal">cm</span></p>
                    </div>
                )}
                {unilateralAsymmetry !== null && (
                    <div className="bg-gray-700/50 p-3 rounded">
                        <p className="text-sm text-brand-light">Assimetria Unilateral</p>
                        <p className={`text-2xl font-bold ${unilateralAsymmetry > 15 ? 'text-accent-red' : 'text-accent-green'}`}>{unilateralAsymmetry.toFixed(1)}<span className="text-base font-normal">%</span></p>
                    </div>
                )}
            </div>
            {assessments.length > 1 && (
                <div className="mt-8">
                    <h4 className="font-semibold text-center mb-4 text-brand-light">Evolução do Salto</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#63BFAA" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#63BFAA" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="date" stroke="#9CA3AF"/>
                            <YAxis yAxisId="left" stroke="#63BFAA" label={{ value: 'Altura (cm)', angle: -90, position: 'insideLeft', fill: '#63BFAA' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#8884d8" label={{ value: 'Potência (W)', angle: -90, position: 'insideRight', fill: '#8884d8' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }}/>
                            <Legend />
                            <Area type="monotone" dataKey="height" name="Altura do Salto" stroke="#63BFAA" fillOpacity={1} fill="url(#colorHeight)" yAxisId="left" strokeWidth={2} />
                            <Area type="monotone" dataKey="power" name="Potência" stroke="#8884d8" fillOpacity={1} fill="url(#colorPower)" yAxisId="right" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
             {latest.observations && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Observações do Avaliador</h4>
                    <p className="text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg">{latest.observations}</p>
                </div>
            )}
             {!isPrinting && assessments.length > 1 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Histórico de Avaliações</h4>
                    <div className="space-y-2">
                        {assessments.slice(1).map(asm => (
                            <div key={asm.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                <span>{formatDate(asm.date)} - Altura: {asm.height.toFixed(1)}cm, Potência: {asm.power}W</span>
                                {!isReadOnly && <button onClick={() => onEdit(asm)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
    );
};

const VO2MaxView: FC<{ assessments: Vo2max[], isPrinting?: boolean, onEdit: (assessment: Vo2max) => void, isReadOnly?: boolean }> = ({ assessments, isPrinting, onEdit, isReadOnly }) => {
    const latest = assessments[0];
    if (!latest) return <NoData />;

    const { trainingZones, trainingPaces, partialVelocities } = calculateVo2maxZones(latest);
    const zoneColors = ["#3182CE", "#38A169", "#F6E05E", "#F56565", "#E53E3E"];

    const metrics = [
        { label: 'VO₂ Máx', value: latest.vo2max.toFixed(2), unit: 'ml/(kg*min)' },
        { label: 'FC Máx', value: latest.maxHeartRate, unit: 'bpm' },
        { label: 'FC Limiar', value: latest.thresholdHeartRate, unit: 'bpm' },
        { label: 'VE Máx', value: latest.maxVentilation.toFixed(1), unit: 'l/min' },
        { label: 'VE Limiar', value: latest.thresholdVentilation.toFixed(2), unit: 'l/min' },
        { label: 'Carga Máx', value: latest.maxLoad, unit: 'km/h' },
        { label: 'Carga Limiar', value: latest.thresholdLoad, unit: 'km/h' },
        { label: 'VAM', value: latest.vam.toFixed(2), unit: 'km/h' },
        { label: 'Rec 10s', value: latest.rec10s, unit: 'bpm' },
        { label: 'Rec 30s', value: latest.rec30s, unit: 'bpm' },
        { label: 'Rec 60s', value: latest.rec60s, unit: 'bpm' },
        { label: 'Score', value: latest.score, unit: '0-100' },
    ];

    return (
         <div className="space-y-8">
            <div className="flex justify-end items-center gap-2 text-sm text-gray-400">
                Última avaliação: {formatDate(latest.date)}
                {!isReadOnly && !isPrinting && <button onClick={() => onEdit(latest)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map(metric => (
                    <div key={metric.label} className="bg-gray-700/50 p-3 rounded-lg text-center">
                        <p className="text-sm text-brand-light">{metric.label}</p>
                        <p className="text-2xl font-bold text-white">{metric.value}</p>
                        <p className="text-xs text-gray-400">{metric.unit}</p>
                    </div>
                ))}
            </div>

            <div>
                <h4 className="font-semibold text-center mb-4 text-brand-light">Zonas de Treino (Frequência Cardíaca)</h4>
                 <div className="w-full bg-gray-700 rounded-lg p-2">
                    {trainingZones.map((zone, index) => (
                        <div key={zone.name} className="flex items-center gap-4 p-1">
                            <div className="w-20 font-semibold">{zone.name}</div>
                            <div className="flex-grow h-6 rounded" style={{backgroundColor: zoneColors[index]}}></div>
                            <div className="w-28 text-right text-sm">{zone.minBpm} - {zone.maxBpm} bpm</div>
                        </div>
                    ))}
                 </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-center mb-4 text-brand-light">Ritmos e Velocidades de Treino (por % de VAM)</h4>
                <div className="bg-gray-700/50 rounded-lg overflow-hidden shadow-md">
                    <table className="w-full text-center">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-brand-light tracking-wider">Intensidade</th>
                                <th className="p-3 text-sm font-semibold text-brand-light tracking-wider">Pace (min/km)</th>
                                <th className="p-3 text-sm font-semibold text-brand-light tracking-wider">Velocidade (km/h)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainingPaces.map((item, index) => (
                                <tr key={item.percentage} className={index % 2 === 0 ? 'bg-gray-700/25' : 'bg-gray-700/50'}>
                                    <td className="p-3 whitespace-nowrap text-gray-300">{item.percentage}%</td>
                                    <td className="p-3 whitespace-nowrap font-mono font-bold text-white">{item.pace}</td>
                                    <td className="p-3 whitespace-nowrap font-mono font-bold text-white">{item.speed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

             <div>
                <h4 className="font-semibold text-center mb-4 text-brand-light">Velocidades Parciais</h4>
                <div className="space-y-4">
                    {partialVelocities.map(dist => (
                        <Card key={dist.distance} className="!p-2">
                            <h5 className="font-bold text-center text-brand-secondary">{dist.distance}m</h5>
                            <div className={isPrinting ? '' : 'overflow-x-auto'}>
                                <table className={`w-full text-center mt-2 partial-velocities-table ${isPrinting ? 'text-[11px]' : 'text-sm'}`}>
                                    <thead className="text-gray-400">
                                        <tr>{dist.results.map(r => <th key={r.intensity} className="p-1 font-medium">{r.intensity}%</th>)}</tr>
                                    </thead>
                                    <tbody className="font-mono">
                                        <tr className={isPrinting ? 'text-black font-bold' : 'text-white font-bold'}>{dist.results.map(r => <td key={r.intensity} className="p-1">{r.time}</td>)}</tr>
                                        <tr className={`${isPrinting ? 'text-[9px] text-gray-600' : 'text-xs text-gray-500'}`}>{dist.results.map(r => <td key={r.intensity} className="p-1">{r.speed}km/h</td>)}</tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))}
                </div>
             </div>
             {latest.observations && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Observações do Avaliador</h4>
                    <p className="text-gray-300 whitespace-pre-wrap bg-gray-700/50 p-4 rounded-lg">{latest.observations}</p>
                </div>
            )}
             {!isPrinting && assessments.length > 1 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-brand-light mb-2">Histórico de Avaliações</h4>
                    <div className="space-y-2">
                        {assessments.slice(1).map(asm => (
                            <div key={asm.id} className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
                                <span>{formatDate(asm.date)} - VO₂max: {asm.vo2max.toFixed(1)}, VAM: {asm.vam.toFixed(1)} km/h</span>
                                {!isReadOnly && <button onClick={() => onEdit(asm)} className="text-gray-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
    );
};

// --- ATHLETE COMPONENTS ---

const AthleteForm: FC<{ onSave: (data: Omit<Athlete, 'id' | 'assessments'> | Athlete) => void; onCancel: () => void; athlete?: Athlete }> = ({ onSave, onCancel, athlete }) => {
    const [name, setName] = useState(athlete?.name || '');
    const [dob, setDob] = useState(athlete?.dob || '');
    const [injuryHistory, setInjuryHistory] = useState(athlete?.injuryHistory || '');
    const age = useMemo(() => calculateAge(dob), [dob]);

    const handleSubmit = () => {
        if (!name || !dob) {
            toast.error("Nome e Data de Nascimento são obrigatórios.");
            return;
        }
        if (athlete) {
            onSave({ ...athlete, name, dob, injuryHistory });
        } else {
            onSave({ name, dob, injuryHistory });
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-brand-light">{athlete ? 'Editar Atleta' : 'Novo Atleta'}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Nome Completo</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div className="flex gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-400">Data de Nascimento</label>
                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-400">Idade</label>
                         <div className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white">{age > 0 ? `${age} anos` : '-'}</div>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400">Histórico de Lesões</label>
                    <textarea value={injuryHistory} onChange={(e) => setInjuryHistory(e.target.value)} rows={3} className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-brand-primary focus:border-brand-primary"></textarea>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Button onClick={onCancel} variant="secondary">Cancelar</Button>
                <Button onClick={handleSubmit}>{athlete ? 'Salvar Alterações' : 'Adicionar Atleta'}</Button>
            </div>
        </Card>
    );
};

const AthleteProfile: FC<{ athlete: Athlete; onBack: () => void; addAssessment: (athleteId: string, type: AssessmentType, data: any) => void; updateAssessment: (athleteId: string, type: AssessmentType, data: any) => void; onExportPDF: (type: AssessmentType | 'all') => void; userRole: 'admin' | 'student'; onEdit: () => void; }> = ({ athlete, onBack, addAssessment, updateAssessment, onExportPDF, userRole, onEdit }) => {
    const [addingAssessment, setAddingAssessment] = useState<AssessmentType | null>(null);
    const [editingAssessment, setEditingAssessment] = useState<{type: AssessmentType, data: AssessmentData} | null>(null);
    const [activeTab, setActiveTab] = useState<AssessmentType>('bioimpedance');

    const handleAddAssessment = (type: AssessmentType, data: any) => {
        addAssessment(athlete.id, type, data);
        setAddingAssessment(null);
    };

    const handleUpdateAssessment = (type: AssessmentType, data: any) => {
        updateAssessment(athlete.id, type, data);
        setEditingAssessment(null);
    };

    const assessmentMap: { type: AssessmentType; title: string; shortTitle: string, ViewComponent: FC<any>, icon: React.ReactNode }[] = [
        { type: 'bioimpedance', title: 'Bioimpedância', shortTitle: 'Corpo', ViewComponent: BioimpedanceView, icon: <BodyIcon className="w-5 h-5"/> },
        { type: 'isometricStrength', title: 'Força Isométrica', shortTitle: 'Isometria', ViewComponent: IsometricStrengthView, icon: <MuscleIcon className="w-5 h-5" /> },
        { type: 'generalStrength', title: 'Força Geral', shortTitle: 'Força', ViewComponent: GeneralStrengthView, icon: <BarbellIcon className="w-5 h-5" /> },
        { type: 'cmj', title: 'Salto (CMJ)', shortTitle: 'Salto', ViewComponent: CMJView, icon: <JumpIcon className="w-5 h-5" /> },
        { type: 'vo2max', title: 'VO₂ max', shortTitle: 'VO₂ max', ViewComponent: VO2MaxView, icon: <LungsIcon className="w-5 h-5" /> },
    ];
    
    const getFormComponent = (type: AssessmentType | null) => {
        const isEditing = editingAssessment?.type === type;
        const initialData = isEditing ? editingAssessment.data : undefined;
        const onSave = isEditing ? (data: any) => handleUpdateAssessment(type!, data) : (data: any) => handleAddAssessment(type!, data);
        const onCancel = isEditing ? () => setEditingAssessment(null) : () => setAddingAssessment(null);

        switch(type) {
            case 'bioimpedance': return <BioimpedanceForm onSave={onSave} onCancel={onCancel} initialData={initialData as Bioimpedance} />;
            case 'isometricStrength': return <IsometricStrengthForm onSave={onSave} onCancel={onCancel} initialData={initialData as IsometricStrength} />;
            case 'cmj': return <CMJForm onSave={onSave} onCancel={onCancel} initialData={initialData as Cmj} />;
            case 'generalStrength': return <GeneralStrengthForm onSave={onSave} onCancel={onCancel} initialData={initialData as GeneralStrength} />;
            case 'vo2max': return <VO2MaxForm onSave={onSave} onCancel={onCancel} initialData={initialData as Vo2max} />;
            default: return null;
        }
    }

    const activeAssessmentDetails = assessmentMap.find(a => a.type === activeTab);

    const isFormOpen = addingAssessment === activeTab || editingAssessment?.type === activeTab;
    const formType = editingAssessment?.type === activeTab ? editingAssessment.type : addingAssessment;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <Button onClick={onBack} variant="secondary">
                     {userRole === 'admin' ? <><ArrowLeftIcon className="w-5 h-5" /> Voltar</> : <><LogoutIcon className="w-5 h-5" /> Sair</>}
                </Button>
                 <Button onClick={() => onExportPDF('all')}>
                    <PDFIcon className="w-5 h-5" /> Exportar PDF Geral
                </Button>
            </div>
            <Card>
                <div className="flex items-start md:items-center gap-4">
                    <UserIcon className="w-16 h-16 text-brand-secondary flex-shrink-0" />
                    <div className="flex-grow">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-white">{athlete.name}</h2>
                            {userRole === 'admin' && (
                                <button onClick={onEdit} className="text-gray-400 hover:text-white transition-colors">
                                    <EditIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-400">{calculateAge(athlete.dob)} anos ({formatDate(athlete.dob)})</p>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold text-brand-light">Histórico de Lesões:</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{athlete.injuryHistory || 'Nenhum histórico registrado.'}</p>
                </div>
            </Card>

            <div className="bg-gray-800 rounded-xl p-2">
                <div className="flex justify-center space-x-1 overflow-x-auto">
                    {assessmentMap.map(({ type, shortTitle, icon }) => (
                        <button
                            key={type}
                            onClick={() => setActiveTab(type)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-200 text-sm md:text-base whitespace-nowrap
                                ${activeTab === type ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            {icon}
                            <span className="hidden sm:inline">{shortTitle}</span>
                        </button>
                    ))}
                </div>
            </div>

            {activeAssessmentDetails && (
                <AssessmentSection
                    title={activeAssessmentDetails.title}
                    onAdd={() => setAddingAssessment(activeTab)}
                    onExportPDF={() => onExportPDF(activeTab)}
                    isReadOnly={userRole === 'student'}
                >
                    {isFormOpen ? (
                        getFormComponent(formType)
                    ) : (
                        <activeAssessmentDetails.ViewComponent 
                            assessments={athlete.assessments[activeTab]} 
                            onEdit={(data: AssessmentData) => setEditingAssessment({type: activeTab, data})}
                            isReadOnly={userRole === 'student'}
                        />
                    )}
                </AssessmentSection>
            )}

        </div>
    );
};

const AthleteList: FC<{ athletes: Athlete[]; onSelect: (athlete: Athlete) => void; onAdd: () => void; searchTerm: string; onSearchChange: (term: string) => void; }> = ({ athletes, onSelect, onAdd, searchTerm, onSearchChange }) => (
    <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-brand-light">Atletas</h2>
            <div className="relative w-full md:w-auto flex-grow max-w-sm">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                   <SearchIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="Buscar atleta..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-brand-primary focus:border-brand-primary"
                    aria-label="Buscar atleta"
                />
            </div>
            <Button onClick={onAdd} className="w-full md:w-auto"><PlusIcon className="w-5 h-5" /> Adicionar Atleta</Button>
        </div>
        <div className="space-y-3">
            {athletes.length > 0 ? (
                athletes.map(athlete => (
                    <Card key={athlete.id} onClick={() => onSelect(athlete)} className="!p-0">
                        <div className="flex items-center p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200">
                            <UserIcon className="w-8 h-8 mr-4 text-brand-secondary" />
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{athlete.name}</p>
                                <p className="text-sm text-gray-400">{calculateAge(athlete.dob)} anos</p>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <p className="text-center text-gray-500 py-8">
                    {searchTerm ? "Nenhum atleta encontrado." : "Nenhum atleta cadastrado."}
                </p>
            )}
        </div>
    </Card>
);

// --- PRINT VIEW ---
const PrintView: FC<{ athlete: Athlete; reportType: AssessmentType | 'all' }> = ({ athlete, reportType }) => {
     const professionalInfo = (
        <div className="text-right">
            <p className="font-bold">Prof. Leandro Barbosa</p>
            <p>LB Sports - Performance e Prevenção de Lesões</p>
            <p>CREF: 036202-G/PR</p>
        </div>
    );

    const assessmentMap: { type: AssessmentType; title: string; ViewComponent: FC<any> }[] = [
        { type: 'bioimpedance', title: 'Relatório de Bioimpedância', ViewComponent: BioimpedanceView },
        { type: 'isometricStrength', title: 'Relatório de Força Isométrica', ViewComponent: IsometricStrengthView },
        { type: 'generalStrength', title: 'Relatório de Força Geral', ViewComponent: GeneralStrengthView },
        { type: 'cmj', title: 'Relatório de Salto Contra Movimento (CMJ)', ViewComponent: CMJView },
        { type: 'vo2max', title: 'Relatório de VO₂ máx e Zonas de Treino', ViewComponent: VO2MaxView },
    ];
    
    const sectionsToPrint = reportType === 'all'
        ? assessmentMap.filter(sec => athlete.assessments[sec.type]?.length > 0)
        : assessmentMap.filter(sec => sec.type === reportType);

    return (
        <>
        <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .printable-page {
                    page-break-after: always;
                }
                .printable-page:last-child {
                    page-break-after: auto;
                }
                .no-print { display: none !important; }
            }
            /* --- General Print Typography & Colors --- */
            .print-container {
                font-size: 12px; /* Set a base font size for print */
            }
            .print-container .text-white { color: #111827 !important; }
            .print-container .text-gray-200 { color: #1f2937 !important; }
            .print-container .text-gray-300 { color: #374151 !important; }
            .print-container .text-gray-400 { color: #4b5563 !important; }
            .print-container .text-gray-500 { color: #6b7280 !important; }
            .print-container .text-gray-600 { color: #4b5563 !important; }
            .print-container .text-brand-light { color: #1A4340 !important; font-weight: 600; }
            .print-container .text-brand-secondary { color: #2D7A74 !important; }

            /* --- Status Colors --- */
            .print-container .text-accent-green { color: #38A169 !important; }
            .print-container .text-accent-red { color: #E53E3E !important; }
            .print-container .text-yellow-400 { color: #D97706 !important; } /* Darker yellow for print */
            
            /* --- Layout & Cards --- */
            .print-container .bg-gray-700, 
            .print-container .bg-gray-700\\/50, 
            .print-container .bg-gray-800 { 
                background-color: #ffffff !important;
                border: 1px solid #e5e7eb !important;
                box-shadow: none !important;
            }
            .print-container .p-3 { padding: 0.5rem; }
            .print-container .p-4 { padding: 0.75rem; }

            /* --- Tables --- */
            .print-container table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
            }
            .print-container th, .print-container td {
                border: 1px solid #e5e7eb;
                padding: 6px;
                text-align: center;
            }
            .print-container thead th {
                background-color: #f3f4f6 !important;
                color: #111827 !important;
                font-weight: 600;
                padding: 8px 6px;
            }
            .print-container tbody tr:nth-child(even) {
                background-color: #f9fafb !important;
            }

            /* --- Specific Component Adjustments --- */
            /* VO2 Max Partial Velocities Table */
            .print-container .partial-velocities-table td, .print-container .partial-velocities-table th {
                padding: 4px 2px;
                font-size: 10px;
            }
            .print-container .partial-velocities-table .font-bold {
                font-weight: 600;
            }
            
            /* Headers & Titles */
            .print-container h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .print-container h4 { margin-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem; }
            .print-container .text-center { text-align: center; }
        `}</style>
        <div className="print-container bg-white text-gray-900 font-sans">
            {sectionsToPrint.map(({ type, title, ViewComponent }, index) => (
                <div key={type} className="p-8 mx-auto max-w-4xl printable-page">
                     <header className="flex justify-between items-center border-b-2 border-gray-300 pb-4">
                        <LbSportsLogo isPrinting={true} />
                        <div className="text-xs text-gray-700">{professionalInfo}</div>
                    </header>
                     <section className="my-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        <div className="flex justify-center gap-6 mt-2 text-gray-600">
                            <span>Atleta: <span className="font-semibold">{athlete.name}</span></span>
                            <span>Idade: <span className="font-semibold">{calculateAge(athlete.dob)} anos</span></span>
                            <span>Data: <span className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</span></span>
                        </div>
                    </section>
                    
                    <main>
                       <ViewComponent assessments={athlete.assessments[type]} isPrinting={true} />
                    </main>

                     {index === sectionsToPrint.length - 1 && (
                         <footer className="text-center text-xs text-gray-500 pt-8 mt-8 border-t border-gray-200">
                             {professionalInfo}
                         </footer>
                     )}
                </div>
            ))}
        </div>
        </>
    )
}

// --- LOGIN PAGE ---
type User = { role: 'admin' } | { role: 'student'; athleteId: string };
const LoginPage: FC<{ onLogin: (user: User) => void; athletes: Athlete[] }> = ({ onLogin, athletes }) => {
    const [mode, setMode] = useState<'student' | 'admin'>('student');
    const [password, setPassword] = useState('');
    const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athletes[0]?.id || '');
    const [dob, setDob] = useState('');

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            onLogin({ role: 'admin' });
        } else {
            toast.error('Senha incorreta.');
        }
    };

    const handleStudentLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const athlete = athletes.find(a => a.id === selectedAthleteId);
        if (athlete && athlete.dob === dob) {
            onLogin({ role: 'student', athleteId: athlete.id });
        } else {
            toast.error('Aluno ou data de nascimento incorretos.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="mb-8">
                <LbSportsLogo />
            </div>
            <Card className="w-full max-w-md">
                <div className="flex border-b border-gray-700 mb-6">
                    <button onClick={() => setMode('student')} className={`flex-1 py-2 text-lg font-semibold transition-colors ${mode === 'student' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400'}`}>Sou Aluno</button>
                    <button onClick={() => setMode('admin')} className={`flex-1 py-2 text-lg font-semibold transition-colors ${mode === 'admin' ? 'text-brand-light border-b-2 border-brand-light' : 'text-gray-400'}`}>Sou Professor</button>
                </div>

                {mode === 'student' ? (
                    <form onSubmit={handleStudentLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Seu Nome</label>
                            <select value={selectedAthleteId} onChange={(e) => setSelectedAthleteId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white">
                                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Data de Nascimento</label>
                            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                        <Button type="submit" className="w-full !mt-6">Entrar</Button>
                    </form>
                ) : (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
                        </div>
                         <Button type="submit" className="w-full !mt-6">Entrar</Button>
                    </form>
                )}
            </Card>
        </div>
    );
};


// --- MAIN APP ---
const App: FC = () => {
  const { athletes, loading, addAthlete, updateAthlete, addAssessment, updateAssessment } = useAthletes();
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'profile' | 'form'>('list');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [reportToExportPDF, setReportToExportPDF] = useState<AssessmentType | 'all' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Check for saved user session on initial load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('lb_sports_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('lb_sports_user');
    }
  }, []);

  const filteredAthletes = useMemo(() => 
    athletes.filter(athlete =>
      athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [athletes, searchTerm]);

  useEffect(() => {
      const handleAfterPrint = () => {
          setReportToExportPDF(null);
      };

      if (reportToExportPDF) {
          window.addEventListener('afterprint', handleAfterPrint, { once: true });
          setTimeout(() => window.print(), 100);
      }

      return () => {
          window.removeEventListener('afterprint', handleAfterPrint);
      };
  }, [reportToExportPDF]);

  const handleLogin = (loggedInUser: User) => {
      setUser(loggedInUser);
      localStorage.setItem('lb_sports_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
      setUser(null);
      setSelectedAthleteId(null);
      setCurrentView('list');
      localStorage.removeItem('lb_sports_user');
  };

  const handleSelectAthlete = (athlete: Athlete) => {
    setSelectedAthleteId(athlete.id);
    setCurrentView('profile');
  };
  
  const handleBackToList = () => {
      setSelectedAthleteId(null);
      setCurrentView('list');
  };
  
  const handleShowAddForm = () => {
      setSelectedAthleteId(null);
      setCurrentView('form');
  };

  const handleStartEditAthlete = () => {
      setCurrentView('form');
  };

  const handleSaveAthleteForm = (data: Omit<Athlete, 'id' | 'assessments'> | Athlete) => {
    if ('id' in data) { // It's an update
        updateAthlete(data as Athlete);
        setCurrentView('profile');
    } else { // It's a new athlete
        addAthlete(data);
        setCurrentView('list');
    }
  };

  const handleCancelAthleteForm = () => {
      if (selectedAthleteId) { // Was editing
          setCurrentView('profile');
      } else { // Was adding
          setCurrentView('list');
      }
  };

  const renderContent = () => {
    if (loading) return <div className="flex justify-center items-center h-screen"><p>Carregando dados...</p></div>;
    
    const athleteIdForView = user?.role === 'student' ? user.athleteId : selectedAthleteId;
    const selectedAthlete = athletes.find(a => a.id === athleteIdForView) || null;

    if (!user) {
        return <LoginPage onLogin={handleLogin} athletes={athletes} />;
    }
    
    if (reportToExportPDF && selectedAthlete) {
        return <PrintView athlete={selectedAthlete} reportType={reportToExportPDF} />;
    }
    
    if (user.role === 'student') {
        if (selectedAthlete) {
            return <AthleteProfile athlete={selectedAthlete} onBack={handleLogout} addAssessment={addAssessment} updateAssessment={updateAssessment} onExportPDF={setReportToExportPDF} userRole="student" onEdit={() => {}} />;
        }
        return <div className="text-center"><p>Erro: Atleta não encontrado.</p><Button onClick={handleLogout}>Sair</Button></div>
    }

    // Admin View
    switch (currentView) {
      case 'profile':
        return selectedAthlete && <AthleteProfile athlete={selectedAthlete} onBack={handleBackToList} addAssessment={addAssessment} updateAssessment={updateAssessment} onExportPDF={setReportToExportPDF} userRole="admin" onEdit={handleStartEditAthlete} />;
      case 'form':
        return <AthleteForm onSave={handleSaveAthleteForm} onCancel={handleCancelAthleteForm} athlete={selectedAthlete ?? undefined}/>
      case 'list':
      default:
        return <AthleteList athletes={filteredAthletes} onSelect={handleSelectAthlete} onAdd={handleShowAddForm} searchTerm={searchTerm} onSearchChange={setSearchTerm} />;
    }
  };

  const showHeaderFooter = user && !reportToExportPDF;

  return (
    <div className={`min-h-screen font-sans ${reportToExportPDF ? 'bg-white' : 'bg-gray-900 text-gray-200'}`}>
        {showHeaderFooter && (
            <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg no-print">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <LbSportsLogo />
                    {user && user.role === 'admin' && (
                        <Button onClick={handleLogout} variant="secondary">
                            <LogoutIcon className="w-5 h-5" />
                            Sair
                        </Button>
                    )}
                </div>
            </header>
        )}

        <main className={`container mx-auto p-4 md:p-6 ${!user ? 'flex items-center justify-center' : ''}`}>
            {renderContent()}
        </main>
        
        {showHeaderFooter && (
             <footer className="bg-gray-800 mt-12 py-6 text-center text-gray-400 text-sm no-print">
                 <div className="container mx-auto px-4">
                     <p className="font-bold">Prof. Leandro Barbosa</p>
                     <p>LB Sports - Performance e Prevenção de Lesões</p>
                     <p>CREF: 036202-G/PR</p>
                 </div>
            </footer>
        )}
    </div>
  );
}

export default App;
