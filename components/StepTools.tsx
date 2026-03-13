
import React from 'react';
import { FormData } from '../types';
import { Settings2, Calculator, HelpCircle, AlertTriangle } from 'lucide-react';

interface StepToolsProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  sectionColor: string;
}

export const StepTools: React.FC<StepToolsProps> = ({ data, onChange, sectionColor }) => {
  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#009EE3] focus:ring-1 focus:ring-[#009EE3] outline-none transition-all shadow-sm hover:border-gray-300";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2";

  // Calculate Warning for MMM
  const mmmTotal = (data.mmmOnPercent || 0) + (data.mmmOffPercent || 0);
  const showMMMFields = data.useMMM === 'Sí';
  const showMMMWarning = showMMMFields && mmmTotal !== 100 && mmmTotal !== 0;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold" style={{ color: sectionColor }}>Herramientas</h2>
        <p className="text-gray-400 text-sm mt-1">Habilitación de herramientas y modelos de optimización.</p>
      </div>

      {/* 1. OPTI Use */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Settings2 size={14} className="text-gray-400"/>
                Uso de OPTI <span className="text-red-500">*</span>
            </label>
            {/* Tooltip */}
            <div className="group relative flex justify-center">
                <HelpCircle size={14} className="text-gray-300 hover:text-[#009EE3] cursor-help transition-colors" />
                <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed text-center">
                    Permite al equipo de optimización redistribuir presupuesto digital entre plataformas dentro de la campaña para maximizar la eficiencia del costo por contacto efectivo.
                    <div className="absolute top-full left-1/2 -ml-2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </div>
        </div>

        <div className="flex gap-4">
             {['Sí', 'No'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onChange('useOpti', opt)}
                    className={`flex-1 py-4 rounded-lg border text-sm font-bold transition-all
                        ${data.useOpti === opt 
                            ? 'bg-blue-50' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={data.useOpti === opt ? { borderColor: sectionColor, color: sectionColor, outline: `1px solid ${sectionColor}` } : {}}
                  >
                      {opt}
                  </button>
              ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. MMM Recommendation */}
      <div className="space-y-6">
        <div>
            <label className={labelClass}>
                <Calculator size={14} className="text-gray-400"/>
                Aplicar recomendación MMM
            </label>
            <div className="flex gap-4">
                {['Sí', 'No'].map((opt) => (
                    <button
                        key={opt}
                        onClick={() => {
                            onChange('useMMM', opt);
                            if (opt === 'No') {
                                onChange('mmmOnPercent', 0);
                                onChange('mmmOffPercent', 0);
                            }
                        }}
                        className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all
                            ${data.useMMM === opt 
                                ? 'text-gray-800 ring-1 ring-opacity-50' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                         style={data.useMMM === opt ? { borderColor: sectionColor, backgroundColor: `${sectionColor}15`, color: '#2D3277', outline: `1px solid ${sectionColor}80` } : {}}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>

        {/* Conditional MMM Fields */}
        {showMMMFields && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">% Inversión ON</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={data.mmmOnPercent === 0 ? '' : data.mmmOnPercent}
                                onChange={(e) => onChange('mmmOnPercent', parseFloat(e.target.value) || 0)}
                                className={inputClass}
                            />
                            <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Recomendado por MMM</p>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">% Inversión OFF</label>
                         <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={data.mmmOffPercent === 0 ? '' : data.mmmOffPercent}
                                onChange={(e) => onChange('mmmOffPercent', parseFloat(e.target.value) || 0)}
                                className={inputClass}
                            />
                            <span className="absolute right-4 top-3.5 text-gray-400 font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Recomendado por MMM</p>
                    </div>
                </div>

                {/* Soft Validation Warning */}
                {showMMMWarning && (
                    <div className="mt-4 flex items-start gap-3 bg-yellow-50 text-yellow-700 p-3 rounded-lg border border-yellow-200 text-sm">
                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                        <span>
                            La suma de ON y OFF es del <strong>{mmmTotal}%</strong>. Se recomienda que sumen 100%, pero puede continuar.
                        </span>
                    </div>
                )}
            </div>
        )}
      </div>

    </div>
  );
};
