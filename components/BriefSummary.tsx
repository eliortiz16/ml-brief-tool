import React from 'react';
import { FormData } from '../types';
import { Download, FileText } from 'lucide-react';

interface BriefSummaryProps {
  data: FormData;
  onClose?: () => void;
  sectionColor?: string;
}

export const BriefSummary: React.FC<BriefSummaryProps> = ({ data, onClose, sectionColor = '#3483FA' }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto my-8 print:shadow-none print:border-none print:m-0">
      {/* Header Actions - Hidden in Print */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2 text-gray-800 font-semibold">
          <FileText size={20} style={{ color: sectionColor }} />
          <span>Brief Summary</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download size={16} />
            Descargar PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Printable Content */}
      <div className="p-8 md:p-12 space-y-10 print:p-0">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-6">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">
            {data.campaignName || 'Sin Nombre'}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sectionColor }}></span>
              {data.brand || 'Marca no definida'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              {data.country || 'País no definido'}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              {data.level1 || 'Nivel 1'} - {data.level2 || 'Nivel 2'}
            </span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Clasificación de Objetivo</h3>
              <p className="text-lg font-medium text-gray-900">{data.objective || 'No definido'}</p>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Audiencia</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="font-medium text-gray-900 mb-1">{data.targetAudience || 'No definido'}</p>
                <p className="text-sm text-gray-600">
                  1st Party Data: <span className="font-semibold">{data.useFirstPartyData ? 'Sí' : 'No'}</span>
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Formatos</h3>
              <div className="flex flex-wrap gap-2">
                {data.materialFormats && data.materialFormats.length > 0 ? (
                  data.materialFormats.map((format, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                      {format}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic text-sm">No definidos</span>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Estrategia de Inversión</h3>
              <div className="bg-gray-900 text-white p-6 rounded-xl shadow-md">
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black">${data.totalBudget?.toLocaleString() || '0'}</span>
                  <span className="text-gray-400 text-sm mb-1 uppercase tracking-wider">Presupuesto Total</span>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">FEEL (Upper)</span>
                    <span className="font-bold">{data.funnel?.upper || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${data.funnel?.upper || 0}%`, backgroundColor: '#CAF0F8' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">THINK (Middle)</span>
                    <span className="font-bold">{data.funnel?.middle || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${data.funnel?.middle || 0}%`, backgroundColor: '#48CAE4' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">DO (Lower)</span>
                    <span className="font-bold">{data.funnel?.lower || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${data.funnel?.lower || 0}%`, backgroundColor: sectionColor }}></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Full Width Section */}
        <section className="pt-6 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Concepto Creativo</h3>
          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
              {data.creativeConcept || 'No definido'}
            </p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="pt-8 text-center text-xs text-gray-400 uppercase tracking-widest">
          Generado automáticamente por Media Briefing System
        </div>
      </div>
    </div>
  );
};
