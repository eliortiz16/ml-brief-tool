import React, { useState } from 'react';
import { FormData } from '../types';
import { Users, UserPlus, X, Settings2 } from 'lucide-react';

interface BriefSettingsProps {
  data: FormData;
  onChange: (field: keyof FormData, value: any) => void;
  currentUserEmail: string;
  onSave: () => void;
  isLocked?: boolean;
}

export const BriefSettings: React.FC<BriefSettingsProps> = ({ data, onChange, currentUserEmail, onSave, isLocked }) => {
  const [newCollaborator, setNewCollaborator] = useState('');

  // Auto-fill owner if empty
  React.useEffect(() => {
    if (!data.owner && currentUserEmail) {
      onChange('owner', currentUserEmail);
    }
  }, [data.owner, currentUserEmail, onChange]);

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newCollaborator.trim().toLowerCase();
    
    if (!email) return;
    
    if (!email.endsWith('@mercadolibre.com') && !email.endsWith('@zetabe.com')) {
      alert('Solo se permiten correos de @mercadolibre.com o @zetabe.com');
      return;
    }

    if (email === data.owner) {
      alert('El propietario ya tiene acceso al brief.');
      return;
    }

    if (data.collaborators.includes(email)) {
      alert('Este usuario ya es colaborador.');
      return;
    }

    onChange('collaborators', [...data.collaborators, email]);
    setNewCollaborator('');
  };

  const removeCollaborator = (emailToRemove: string) => {
    onChange('collaborators', data.collaborators.filter(email => email !== emailToRemove));
  };

  return (
    <div className={`flex flex-col gap-6 ${isLocked ? 'pointer-events-none opacity-70' : ''}`}>
      {!isLocked && (
        <button
          onClick={onSave}
          className="w-full bg-[#3483FA] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2968c8] transition-colors shadow-sm"
        >
          Guardar Cambios
        </button>
      )}
      
      {/* Owner & Status */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Propietario (Owner)</label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium truncate">
            {data.owner || currentUserEmail}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
          <select
            value={data.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#3483FA] focus:border-[#3483FA] transition-colors"
          >
            <option value="Draft">Borrador (Draft)</option>
            <option value="In Progress">En Progreso (In Progress)</option>
            <option value="Ready to Submit">Listo para Enviar</option>
            <option value="Submitted" disabled>Enviado (Submitted)</option>
            <option value="Archived" disabled>Archivado</option>
          </select>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Collaborators */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Users size={16} /> Colaboradores
        </label>
        
        <form onSubmit={handleAddCollaborator} className="flex flex-col gap-2 mb-4">
          <input
            type="email"
            value={newCollaborator}
            onChange={(e) => setNewCollaborator(e.target.value)}
            placeholder="ejemplo@mercadolibre.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#3483FA] focus:border-[#3483FA] transition-colors"
          />
          <button
            type="submit"
            disabled={!newCollaborator.trim()}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus size={16} /> Agregar
          </button>
        </form>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 min-h-[100px]">
          {data.collaborators.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4">
              No hay colaboradores agregados aún.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.collaborators.map((email) => (
                <div key={email} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between shadow-sm">
                  <span className="text-gray-700 truncate mr-2">{email}</span>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(email)}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Los colaboradores pueden editar el brief, pero solo el propietario puede enviarlo.
        </p>
      </div>
    </div>
  );
};
