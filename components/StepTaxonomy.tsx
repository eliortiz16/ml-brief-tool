
import React, { useMemo } from 'react';
import { FormData, Country, Brand } from '../types';
import { COUNTRIES, TAXONOMY_DATA } from '../constants';
import { ShoppingBag, CreditCard, Hash, Calendar, Tag, MapPin, ChevronDown } from 'lucide-react';

interface StepTaxonomyProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  brandColor: string;
}

export const StepTaxonomy: React.FC<StepTaxonomyProps> = ({ data, onChange, brandColor }) => {
  
  const handleBrandSelect = (selectedBrand: Brand) => {
      onChange('brand', selectedBrand);
      // Reset dependent fields
      onChange('level1', ''); 
      onChange('level2', '');
  };

  const handleLevel1Change = (val: string) => {
      onChange('level1', val);
      onChange('level2', ''); // Reset Level 2 when Level 1 changes
  };

  // Compute available Level 1 options based on Brand
  const level1Options = useMemo(() => {
      if (!data.brand) return [];
      return Object.keys(TAXONOMY_DATA[data.brand] || {});
  }, [data.brand]);

  // Compute available Level 2 options based on Level 1
  const level2Options = useMemo(() => {
      if (!data.brand || !data.level1) return [];
      return TAXONOMY_DATA[data.brand][data.level1] || [];
  }, [data.brand, data.level1]);

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:border-[#009EE3] focus:ring-1 focus:ring-[#009EE3] outline-none transition-all shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex justify-between";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold" style={{ color: brandColor }}>Configuración de Campaña</h2>
        <p className="text-gray-400 text-sm mt-1">Define la estructura principal y taxonomía del brief.</p>
      </div>
      
      {/* SECTION 1: CORE DATA (BRAND & COUNTRY) */}
      <div>
        <label className={labelClass}>Marca & País <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Brand Selection */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div 
                    onClick={() => handleBrandSelect(Brand.MELI)}
                    className={`cursor-pointer rounded-xl border p-4 flex flex-col md:flex-row items-center gap-3 transition-all duration-300 h-full justify-center md:justify-start
                        ${data.brand === Brand.MELI 
                            ? 'border-[#3483fa] bg-blue-50/40 shadow-sm ring-1 ring-[#3483fa]' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                >
                    <div className={`p-2 rounded-full flex-shrink-0 ${data.brand === Brand.MELI ? 'bg-[#3483fa] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <ShoppingBag size={20} />
                    </div>
                    <span className={`font-bold text-sm ${data.brand === Brand.MELI ? 'text-[#3483fa]' : 'text-gray-600'}`}>Mercado Libre</span>
                </div>

                <div 
                    onClick={() => handleBrandSelect(Brand.MP)}
                    className={`cursor-pointer rounded-xl border p-4 flex flex-col md:flex-row items-center gap-3 transition-all duration-300 h-full justify-center md:justify-start
                        ${data.brand === Brand.MP 
                            ? 'border-[#009EE3] bg-sky-50/40 shadow-sm ring-1 ring-[#009EE3]' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                >
                    <div className={`p-2 rounded-full flex-shrink-0 ${data.brand === Brand.MP ? 'bg-[#009EE3] text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <CreditCard size={20} />
                    </div>
                    <span className={`font-bold text-sm ${data.brand === Brand.MP ? 'text-[#009EE3]' : 'text-gray-600'}`}>Mercado Pago</span>
                </div>
            </div>

            {/* Country Selection as a Card */}
            <div className="relative h-full">
                <div className={`rounded-xl border p-4 flex items-center gap-3 transition-all duration-300 h-full bg-white relative
                    ${data.country 
                        ? 'bg-indigo-50/20 ring-1' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`
                } style={data.country ? { borderColor: brandColor, outline: `1px solid ${brandColor}` } : {}}>
                    <div className={`p-2 rounded-full flex-shrink-0 ${data.country ? 'text-white' : 'bg-gray-100 text-gray-400'}`} style={data.country ? { backgroundColor: brandColor } : {}}>
                        <MapPin size={20} />
                    </div>
                    
                    <div className="flex-grow relative h-full flex items-center">
                        <select
                            value={data.country}
                            onChange={(e) => onChange('country', e.target.value as Country)}
                            className={`w-full h-full bg-transparent appearance-none outline-none cursor-pointer z-10
                                ${data.country ? 'font-bold' : 'text-gray-400 font-normal'} text-sm
                            `}
                            style={data.country ? { color: brandColor } : {}}
                        >
                            <option value="" disabled className="bg-white text-gray-400">Seleccionar País</option>
                            {COUNTRIES.map((c) => (
                                <option key={c} value={c} className="bg-white text-gray-700 py-2">
                                    {c}
                                </option>
                            ))}
                        </select>
                        
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown size={16} className={data.country ? '' : 'text-gray-400'} style={data.country ? { color: brandColor } : {}} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* SECTION 2: CAMPAIGN DETAILS */}
      <div className={`transition-all duration-500 ${data.brand ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                  <label className={labelClass}>
                      Nombre de Campaña (Calendario)
                      <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        value={data.campaignName}
                        onChange={(e) => onChange('campaignName', e.target.value)}
                        placeholder="Ej: Hot Sale 2024"
                        className={`${inputClass} pl-10`}
                    />
                    <Calendar size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  </div>
              </div>
              <div>
                  <label className={labelClass}>
                      Código de Campaña (Taxonomía)
                      <span className="text-gray-400 font-normal lowercase">(Opcional)</span>
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        value={data.namingConvention}
                        onChange={(e) => onChange('namingConvention', e.target.value)}
                        placeholder="Ej: MLA_ML_G-DV-VIDEO..."
                        className={`${inputClass} pl-10 font-mono text-sm bg-gray-50/50`}
                    />
                    <Tag size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  </div>
              </div>
          </div>
      </div>

      <hr className="border-gray-100" />

      {/* SECTION 3: TAXONOMY LEVELS */}
      <div className={`transition-all duration-500 ${data.brand ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                 <label className={labelClass}>
                     Level 1
                     <span className="text-red-500">*</span>
                 </label>
                 <select
                    value={data.level1}
                    onChange={(e) => handleLevel1Change(e.target.value)}
                    className={inputClass}
                 >
                    <option value="">Seleccionar...</option>
                    {level1Options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
            </div>

            <div>
              <label className={labelClass}>
                  Level 2
                  <span className="text-red-500">*</span>
              </label>
              <select
                value={data.level2}
                onChange={(e) => onChange('level2', e.target.value)}
                className={inputClass}
                disabled={!data.level1}
              >
                <option value="">
                    {data.level1 ? "Seleccionar..." : "Selecciona Level 1 primero"}
                </option>
                {level2Options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
      </div>

      {/* SECTION 4: TECHNICAL */}
      <div className={`transition-all duration-500 ${data.brand ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="w-full md:w-1/2 pr-0 md:pr-4">
            <label className={labelClass}>
                Tool ID / Código MATT
                <span className="text-gray-400 font-normal lowercase">(Opcional)</span>
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={data.toolId}
                    onChange={(e) => onChange('toolId', e.target.value)}
                    placeholder="123456"
                    className={`${inputClass} pl-10 font-mono`}
                />
                <Hash size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
            </div>
        </div>
      </div>
    </div>
  );
};
