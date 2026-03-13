import React, { useState } from 'react';
import { FormData } from '../types';
import { CheckCircle, ExternalLink, FileText } from 'lucide-react';
import { BriefSummary } from './BriefSummary';

interface SuccessViewProps {
  data: FormData;
  initialShowSummary?: boolean;
  sectionColor?: string;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ data, initialShowSummary = false, sectionColor = '#3483fa' }) => {
  const [showSummary, setShowSummary] = useState(initialShowSummary);

  if (showSummary) {
    return (
      <div className="animate-fade-in">
        <BriefSummary data={data} onClose={() => setShowSummary(false)} sectionColor={sectionColor} />
      </div>
    );
  }

  return (
    <div className="text-center space-y-8 animate-fade-in py-10">
      <div className="flex justify-center">
        <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={64} className="text-green-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">¡Brief Enviado con Éxito!</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          El brief de la campaña <span className="font-semibold text-gray-800">{data.campaignName}</span> ha sido registrado correctamente.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm max-w-lg mx-auto text-left space-y-3">
          <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 text-sm">País</span>
              <span className="font-medium">{data.country}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 text-sm">Brief ID</span>
              <span className="font-medium font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  BRF-{Math.floor(Math.random() * 1000000)}
              </span>
          </div>
          <div className="bg-blue-50 p-3 rounded-md text-sm flex gap-2 items-start mt-4" style={{ color: sectionColor }}>
            <InfoIcon />
            La tarea se está creando en el Workspace de Asana de {data.country}.
          </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
        <button 
            className="bg-white border-2 px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            style={{ color: sectionColor, borderColor: sectionColor }}
            onClick={() => setShowSummary(true)}
        >
            <FileText size={18} />
            <span>Ver Resumen (One Page)</span>
        </button>
        <button 
            className="text-white px-8 py-3 rounded-md font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg"
            style={{ backgroundColor: sectionColor }}
            onClick={() => window.open('https://asana.com', '_blank')}
        >
            <span>Ir a Asana</span>
            <ExternalLink size={18} />
        </button>
      </div>
    </div>
  );
};

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);
