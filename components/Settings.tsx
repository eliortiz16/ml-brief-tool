import React from 'react';
import { User, Shield, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface SettingsProps {
  user: { name: string; email: string; picture: string; role?: string };
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onBack }) => {
  const role = user.role || 'Editor';

  const permissions = [
    {
      role: 'Admin',
      description: 'Acceso total al sistema',
      features: [
        { name: 'Full access to the platform', allowed: true },
        { name: 'Create briefs', allowed: true },
        { name: 'Edit any brief', allowed: true },
        { name: 'Add or remove collaborators', allowed: true },
        { name: 'Delete briefs (Draft/In Progress)', allowed: true },
        { name: 'Archive submitted briefs', allowed: true },
        { name: 'Access Settings', allowed: true },
        { name: 'Manage user roles', allowed: true },
      ]
    },
    {
      role: 'Editor',
      description: 'Acceso estándar para creadores',
      features: [
        { name: 'Create briefs', allowed: true },
        { name: 'Edit own briefs', allowed: true },
        { name: 'Delete briefs (Draft/In Progress)', allowed: false },
        { name: 'Archive submitted briefs', allowed: false },
        { name: 'Manage user roles', allowed: false },
      ]
    },
    {
      role: 'Viewer',
      description: 'Acceso restringido',
      features: [
        { name: 'View briefs', allowed: true },
        { name: 'Edit briefs', allowed: false },
        { name: 'Manage user roles', allowed: false },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h1>
          <p className="text-gray-500 text-sm mt-1.5">Gestiona tu perfil y revisa los permisos del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Profile Section */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-[#3483FA]" />
                User Profile
              </h2>
              
              <div className="flex flex-col items-center text-center mb-6">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full border-2 border-gray-100 mb-3" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border-2 border-blue-100 mb-3 text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Name:</span>
                  <span className="text-gray-900 font-semibold">{user.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Email:</span>
                  <span className="text-gray-900 font-semibold">{user.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">Role:</span>
                  <span className="text-gray-900 font-semibold">{role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Shield size={20} className="text-[#3483FA]" />
                Roles y Permisos
              </h2>

              <div className="space-y-6">
                {permissions.map((p) => (
                  <div 
                    key={p.role} 
                    className={`p-5 rounded-lg border ${
                      p.role === role 
                        ? 'border-[#3483FA] bg-blue-50/30 ring-1 ring-[#3483FA]/20' 
                        : 'border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          {p.role}
                          {p.role === role && (
                            <span className="text-xs font-medium bg-[#3483FA] text-white px-2 py-0.5 rounded-full">
                              Tu rol actual
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{p.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {p.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {feature.allowed ? (
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-gray-300 flex-shrink-0" />
                          )}
                          <span className={feature.allowed ? 'text-gray-700' : 'text-gray-400'}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
