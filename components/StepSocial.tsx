
import React from 'react';
import { FormData } from '../types';
import { SOCIAL_ACTION_TYPES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, BarChart3, TrendingUp, AlertCircle, RefreshCw, Zap, ChevronDown } from 'lucide-react';

interface StepSocialProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  error?: string;
  sectionColor: string;
}

export const StepSocial: React.FC<StepSocialProps> = ({ data, onChange, error, sectionColor }) => {
  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#009EE3] focus:ring-1 focus:ring-[#009EE3] outline-none transition-all shadow-sm hover:border-gray-300";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2";

  // --- Funnel Logic ---
  const handleFunnelChange = (key: 'upper' | 'middle' | 'lower', value: string) => {
    const numValue = parseInt(value) || 0;
    onChange('funnel', { ...data.funnel, [key]: numValue });
  };
  
  const funnelSum = (data.funnel.upper || 0) + (data.funnel.middle || 0) + (data.funnel.lower || 0);
  const isFunnelValid = funnelSum === 100;

  // Configuration for FEEL / THINK / DO mapping
  // Using a blue scale: Lightest for FEEL, Mid for THINK, Brand Color for DO
  const funnelConfig = [
      { key: 'upper', label: 'FEEL', color: '#CAF0F8' }, // Light Cyan
      { key: 'middle', label: 'THINK', color: '#48CAE4' }, // Mid Blue
      { key: 'lower', label: 'DO', color: sectionColor }   // Brand Primary
  ];
  
  const chartData = funnelConfig.map(item => ({
    name: item.label,
    value: data.funnel[item.key as keyof typeof data.funnel] || 0,
    color: item.color
  })).filter(d => d.value > 0);

  // --- Social Validation Logic ---
  const getMinSocialInvestment = (): number | null => {
      const level1 = data.level1.toUpperCase();
      if (level1 === 'DO') return 30;
      if (level1 === 'FEEL' || level1 === 'THINK') return 15;
      return null;
  };

  const minSocial = getMinSocialInvestment();
  const socialError = minSocial !== null && data.socialInvestmentPercent < minSocial;

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold" style={{ color: sectionColor }}>Estrategia</h2>
        <p className="text-gray-400 text-sm mt-1">Definición estratégica de medios y reglas de negocio.</p>
      </div>
      
      {/* ================= SECTION 1: ESTRATEGIA DE MEDIOS ================= */}
      <div className="space-y-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-l-4 pl-3" style={{ borderLeftColor: sectionColor }}>
            1. Estrategia de Medios
        </h3>

        {/* Budget - Input Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <label className={labelClass}>
                    <Wallet size={14} className="text-gray-400"/>
                    Presupuesto Total de Campaña
                    <span className="text-red-500">*</span>
                </label>
                
                <div className="flex w-full items-center border border-gray-200 rounded-lg bg-white overflow-hidden transition-all shadow-sm focus-within:border-[#009EE3] focus-within:ring-1 focus-within:ring-[#009EE3] hover:border-gray-300 h-[50px]">
                    {/* Currency Selector */}
                    <div className="relative w-28 h-full border-r border-gray-200 bg-gray-50 flex-shrink-0 group hover:bg-gray-100 transition-colors">
                        <select
                            value={data.currency}
                            onChange={(e) => onChange('currency', e.target.value)}
                            className="w-full h-full appearance-none bg-transparent pl-4 pr-8 text-sm font-bold text-gray-600 outline-none cursor-pointer"
                        >
                            <option value="Local">Local</option>
                            <option value="USD">USD</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                    
                    {/* Amount Input */}
                    <input
                        type="number"
                        min="0"
                        placeholder="1.000.000"
                        value={data.totalBudget === 0 ? '' : data.totalBudget}
                        onChange={(e) => onChange('totalBudget', parseFloat(e.target.value) || 0)}
                        className="w-full h-full px-4 outline-none text-gray-700 placeholder-gray-400 font-medium bg-transparent"
                    />
                </div>
            </div>
        </div>

        {/* Funnel Distribution */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>
                    <BarChart3 size={14} className="text-gray-400"/>
                    Distribución de Inversión (Funnel)
                    <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isFunnelValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    Total: {funnelSum}%
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 {/* Left: Inputs */}
                 <div className="grid grid-cols-3 gap-4">
                    {funnelConfig.map((stage) => (
                        <div key={stage.key}>
                            <span className="text-xs font-bold text-gray-500 mb-1 block flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: stage.color }}></span>
                                {stage.label} (%)
                            </span>
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                className={`${inputClass} text-center font-semibold`}
                                value={data.funnel[stage.key as keyof typeof data.funnel] === 0 ? '' : data.funnel[stage.key as keyof typeof data.funnel]}
                                onChange={(e) => handleFunnelChange(stage.key as 'upper'|'middle'|'lower', e.target.value)}
                            />
                        </div>
                    ))}
                 </div>
                 
                 {/* Right: Chart & Legend */}
                 <div className="flex items-center justify-center md:justify-start gap-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {/* Pie */}
                    <div className="h-20 w-20 flex-shrink-0 relative">
                        {funnelSum > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={18}
                                        outerRadius={35}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => [`${value}%`]}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                                <span className="text-[10px] text-gray-400">0%</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Legend */}
                    <div className="space-y-1.5 flex-1 min-w-[120px]">
                        {funnelConfig.map((stage) => {
                             const val = data.funnel[stage.key as keyof typeof data.funnel] || 0;
                             return (
                                <div key={stage.key} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stage.color }}></div>
                                        <span className="font-medium text-gray-600">{stage.label}</span>
                                    </div>
                                    <span className={`font-bold ${val > 0 ? 'text-gray-800' : 'text-gray-300'}`}>
                                        {val}%
                                    </span>
                                </div>
                             );
                        })}
                    </div>
                 </div>
            </div>
            {!isFunnelValid && funnelSum !== 0 && (
                <p className="text-xs text-red-500 mt-3 font-medium flex items-center gap-1">
                    <AlertCircle size={12} />
                    La suma de FEEL, THINK y DO debe ser exactamente 100%. Actual: {funnelSum}%
                </p>
            )}
        </div>

        {/* Optional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <label className={labelClass}>
                    <RefreshCw size={14} className="text-gray-400"/>
                    Frecuencia Efectiva
                    <span className="text-gray-400 font-normal normal-case ml-auto">(Opcional)</span>
                </label>
                <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ej: 3"
                    value={data.effectiveFrequency === 0 ? '' : data.effectiveFrequency}
                    onChange={(e) => onChange('effectiveFrequency', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                />
             </div>
             <div>
                <label className={labelClass}>
                    <Zap size={14} className="text-gray-400"/>
                    Wear Out Limit
                    <span className="text-gray-400 font-normal normal-case ml-auto">(Opcional)</span>
                </label>
                <input
                    type="number"
                    min="0"
                    placeholder="Ej: 4"
                    value={data.wearOutLimit === 0 ? '' : data.wearOutLimit}
                    onChange={(e) => onChange('wearOutLimit', parseFloat(e.target.value) || 0)}
                    className={inputClass}
                />
             </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ================= SECTION 2: ESTRATEGIA SOCIAL ================= */}
      <div className="space-y-8">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-l-4 pl-3" style={{ borderLeftColor: sectionColor }}>
            2. Estrategia Social
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Action Type */}
             <div>
                 <label className={labelClass}>
                    Tipo de Acción Social <span className="text-red-500">*</span>
                 </label>
                 <select
                    value={data.socialActionType}
                    onChange={(e) => onChange('socialActionType', e.target.value)}
                    className={inputClass}
                 >
                    <option value="">Seleccionar...</option>
                    {SOCIAL_ACTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                 </select>
             </div>

             {/* KPI */}
             <div>
                <label className={labelClass}>
                    KPI Social Principal
                    <span className="text-gray-400 font-normal normal-case ml-auto">(Opcional)</span>
                </label>
                <input
                    type="text"
                    placeholder="Ej: Engagement Rate"
                    value={data.socialKPI}
                    onChange={(e) => onChange('socialKPI', e.target.value)}
                    className={inputClass}
                />
             </div>
        </div>

        {/* Investment Validation Rule */}
        <div className={`p-5 rounded-xl border transition-all duration-300 ${socialError ? 'bg-red-50 border-red-200' : 'bg-blue-50/50 border-blue-100'}`}>
            <label className={labelClass}>
                <TrendingUp size={14} className={socialError ? "text-red-500" : "text-gray-400"}/>
                Inversión en Social Media (% del Presupuesto)
            </label>
            
            <div className="flex items-center gap-4">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={data.socialInvestmentPercent === 0 ? '' : data.socialInvestmentPercent}
                        onChange={(e) => onChange('socialInvestmentPercent', parseInt(e.target.value) || 0)}
                        className={`w-full py-3 pl-4 pr-10 border rounded-lg outline-none font-bold text-lg
                            ${socialError 
                                ? 'border-red-300 text-red-600 focus:ring-1 focus:ring-red-300' 
                                : 'border-gray-200 focus:border-[#009EE3] focus:ring-1 focus:ring-[#009EE3]'}`}
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
                </div>
                
                {/* Dynamic Rule Feedback */}
                <div className="text-sm flex-1">
                    {minSocial !== null ? (
                        socialError ? (
                            <div className="flex items-start gap-2 text-red-600 animate-pulse">
                                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                                <span>
                                    <strong>Atención:</strong> Para campañas <strong>{data.level1}</strong>, la inversión mínima requerida en Social es <strong>{minSocial}%</strong>.
                                </span>
                            </div>
                        ) : (
                             <div className="flex items-center gap-2 text-green-600">
                                <CheckCircleIcon />
                                <span>Cumple con la inversión mínima para {data.level1} ({minSocial}%).</span>
                            </div>
                        )
                    ) : (
                        <span className="text-gray-500">Sin reglas de mínimo específicas para esta categoría.</span>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
