
import React from 'react';
import { FormData, AssetAvailability } from '../types';
import { ASSET_FORMAT_OPTIONS } from '../constants';
import { Link, Layers, LayoutTemplate, Clock, CalendarDays } from 'lucide-react';

interface StepCreativityProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  sectionColor: string;
}

export const StepCreativity: React.FC<StepCreativityProps> = ({ data, onChange, sectionColor }) => {
  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#009EE3] focus:ring-1 focus:ring-[#009EE3] outline-none transition-all shadow-sm hover:border-gray-300";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2";

  const handleFormatToggle = (format: string) => {
    const currentFormats = data.materialFormats;
    if (currentFormats.includes(format)) {
      onChange('materialFormats', currentFormats.filter(f => f !== format));
    } else {
      onChange('materialFormats', [...currentFormats, format]);
    }
  };

  const showDatePicker = data.assetsAvailability === AssetAvailability.NOT_AVAILABLE || 
                         data.assetsAvailability === AssetAvailability.IN_PRODUCTION;

  return (
    <div className="space-y-10 animate-fade-in">
       <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold" style={{ color: sectionColor }}>Bajada Creativa</h2>
        <p className="text-gray-400 text-sm mt-1">Define el concepto y el alcance de los activos.</p>
      </div>
      
      {/* 1. Creative Concept */}
      <div>
        <label className={labelClass}>
            Concepto Creativo <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          value={data.creativeConcept}
          onChange={(e) => onChange('creativeConcept', e.target.value)}
          placeholder="Describe la idea central, mensaje clave y tono de comunicación..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <hr className="border-gray-100" />

      {/* 2. Quantity & Formats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Quantity */}
          <div className="md:col-span-4">
              <label className={labelClass}>
                  <Layers size={14} className="text-gray-400"/>
                  Cantidad de Materiales <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={data.materialQuantity === 0 ? '' : data.materialQuantity}
                onChange={(e) => onChange('materialQuantity', parseInt(e.target.value) || 0)}
                placeholder="Ej: 5"
                className={inputClass}
              />
          </div>

          {/* Formats Multi-select */}
          <div className="md:col-span-8">
               <label className={labelClass}>
                  <LayoutTemplate size={14} className="text-gray-400"/>
                  Formatos <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                  {ASSET_FORMAT_OPTIONS.map(format => {
                      const isSelected = data.materialFormats.includes(format);
                      return (
                          <button
                            key={format}
                            onClick={() => handleFormatToggle(format)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                ${isSelected 
                                    ? 'border-transparent text-white shadow-md transform scale-105' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                             style={isSelected ? { backgroundColor: sectionColor } : {}}
                          >
                              {format}
                          </button>
                      );
                  })}
              </div>
          </div>
      </div>

      <hr className="border-gray-100" />

      {/* 3. Availability & Links */}
      <div className="space-y-6">
           <div>
               <label className={labelClass}>
                  <Clock size={14} className="text-gray-400"/>
                  ¿Las piezas ya están disponibles? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                  {[AssetAvailability.AVAILABLE, AssetAvailability.NOT_AVAILABLE, AssetAvailability.IN_PRODUCTION].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                            onChange('assetsAvailability', opt);
                            if (opt === AssetAvailability.AVAILABLE) {
                                onChange('assetsDeliveryDate', '');
                            }
                        }}
                        className={`py-3 rounded-lg border text-sm font-medium transition-all
                            ${data.assetsAvailability === opt 
                                ? 'bg-blue-50' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        style={data.assetsAvailability === opt ? { borderColor: sectionColor, color: sectionColor, outline: `1px solid ${sectionColor}` } : {}}
                      >
                          {opt}
                      </button>
                  ))}
              </div>
           </div>

           {/* Conditional Date Input */}
           {showDatePicker && (
               <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={labelClass}>
                        <CalendarDays size={14} className="text-gray-400"/>
                        Fecha Estimada de Entrega
                    </label>
                    <input 
                        type="date"
                        value={data.assetsDeliveryDate}
                        onChange={(e) => onChange('assetsDeliveryDate', e.target.value)}
                        className={inputClass}
                    />
               </div>
           )}

           <div>
                <label className={labelClass}>
                    Link a Carpeta de Materiales
                    <span className="text-gray-400 font-normal normal-case ml-auto">(Opcional)</span>
                </label>
                <div className="relative">
                    <input
                    type="url"
                    value={data.assetLink}
                    onChange={(e) => onChange('assetLink', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className={`${inputClass} pl-10 text-blue-600 underline-offset-4`}
                    />
                    <Link size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
            </div>
      </div>
    </div>
  );
};
