
import React from 'react';
import { FormData } from '../types';
import { TARGET_AUDIENCE_OPTIONS, FIRST_PARTY_TYPES_OPTIONS, CULTURAL_TERRITORY_OPTIONS } from '../constants';
import { Users, Target, Database, Globe } from 'lucide-react';

interface StepStrategyProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  sectionColor: string;
}

export const StepStrategy: React.FC<StepStrategyProps> = ({ data, onChange, sectionColor }) => {
  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#009EE3] focus:ring-1 focus:ring-[#009EE3] outline-none transition-all shadow-sm hover:border-gray-300";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2";

  // Generic handler for multi-select fields (Pills)
  const handleMultiSelect = (field: keyof FormData, value: string, currentArray: string[]) => {
    if (currentArray.includes(value)) {
      onChange(field, currentArray.filter(item => item !== value));
    } else {
      onChange(field, [...currentArray, value]);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
       <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold" style={{ color: sectionColor }}>Audiencia</h2>
        <p className="text-gray-400 text-sm mt-1">Definición clara y estandarizada del target.</p>
      </div>

      {/* 1. Target Principal (Mandatory, Dropdown) */}
      <div>
        <label className={labelClass}>
            <Users size={14} className="text-gray-400"/>
            Target Principal <span className="text-red-500">*</span>
        </label>
        <div className="relative">
            <select
                value={data.targetAudience}
                onChange={(e) => onChange('targetAudience', e.target.value)}
                className={inputClass}
            >
                <option value="">Seleccionar Target...</option>
                {TARGET_AUDIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute top-0 right-0 h-full flex items-center pr-3 pointer-events-none text-gray-400 text-xs font-bold">
                ▼
            </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. 1st Party Data Logic */}
      <div>
           <label className={labelClass}>
              <Database size={14} className="text-gray-400"/>
              ¿Uso de audiencias 1st Party? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
              {['Sí', 'No'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                        onChange('useFirstPartyData', opt);
                        if (opt === 'No') {
                            onChange('firstPartyAudienceTypes', []); // Reset Types if No
                        }
                    }}
                    className={`flex-1 py-3 rounded-lg border text-sm font-bold transition-all
                        ${data.useFirstPartyData === opt 
                            ? 'bg-blue-50' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={data.useFirstPartyData === opt ? { borderColor: sectionColor, color: sectionColor, outline: `1px solid ${sectionColor}` } : {}}
                  >
                      {opt}
                  </button>
              ))}
          </div>
          
          {/* Conditional: Types of 1st Party Data */}
          {data.useFirstPartyData === 'Sí' && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className={labelClass}>
                      <Target size={14} className="text-gray-400"/>
                      Tipo de audiencia 1st Party
                  </label>
                  <div className="flex flex-wrap gap-2">
                      {FIRST_PARTY_TYPES_OPTIONS.map(type => {
                          const isSelected = data.firstPartyAudienceTypes.includes(type);
                          return (
                              <button
                                key={type}
                                onClick={() => handleMultiSelect('firstPartyAudienceTypes', type, data.firstPartyAudienceTypes)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                    ${isSelected 
                                        ? 'border-transparent text-white shadow-sm' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                 style={isSelected ? { backgroundColor: sectionColor } : {}}
                              >
                                  {type}
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}
      </div>

      <hr className="border-gray-100" />

      {/* 3. Cultural Territory (Multi-select) */}
      <div>
          <label className={labelClass}>
              <Globe size={14} className="text-gray-400"/>
              Territorio Cultural
          </label>
          <div className="flex flex-wrap gap-2">
              {CULTURAL_TERRITORY_OPTIONS.map(territory => {
                  const isSelected = data.culturalTerritory.includes(territory);
                  return (
                      <button
                        key={territory}
                        onClick={() => handleMultiSelect('culturalTerritory', territory, data.culturalTerritory)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                            ${isSelected 
                                ? 'border-transparent text-white shadow-sm' 
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                         style={isSelected ? { backgroundColor: sectionColor } : {}}
                      >
                          {territory}
                      </button>
                  );
              })}
          </div>
      </div>

    </div>
  );
};
