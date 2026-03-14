
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { StepTaxonomy } from './components/StepTaxonomy';
import { StepCreativity } from './components/StepCreativity';
import { StepStrategy } from './components/StepStrategy';
import { StepSocial } from './components/StepSocial';
import { StepTools } from './components/StepTools';
import { SuccessView } from './components/SuccessView';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { BriefSettings } from './components/BriefSettings';
import { Settings } from './components/Settings';
import { AdminPanel } from './components/AdminPanel';
import { AppStep, FormData } from './types';
import { INITIAL_FORM_DATA } from './constants';
import { ArrowRight, ChevronLeft, Lock, Users, Clock, Settings as SettingsIcon, CheckCircle, Circle, Hourglass } from 'lucide-react';
import { getStepStatus, calculateProgress, generateActivityLogs } from './utils';
import { RightPanel } from './components/RightPanel';

type AppState = 'loading' | 'login' | 'dashboard' | 'brief' | 'settings' | 'admin';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<{ name: string; email: string; picture: string; role?: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CAMPAIGN);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string>('');
  const [activePanel, setActivePanel] = useState<'collaborators' | 'activity' | 'settings' | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAppState('dashboard');
      } else {
        setAppState('login');
      }
    } catch (err) {
      setAppState('login');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setAppState('login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleCreateNew = () => {
    const newBriefData = {
      ...INITIAL_FORM_DATA,
      owner: user?.email || '',
      activityLog: [{
        id: Date.now().toString(),
        userEmail: user?.email || '',
        action: 'creó el brief',
        timestamp: new Date().toISOString()
      }]
    };
    setFormData(newBriefData);
    setOriginalFormData(newBriefData);
    setCurrentStep(AppStep.CAMPAIGN);
    setAppState('brief');
  };

  const handleOpenBrief = (brief: any) => {
    // Merge existing data with INITIAL_FORM_DATA to ensure all fields exist
    const openedData = {
      ...INITIAL_FORM_DATA,
      ...brief.data,
      owner: brief.owner,
      status: brief.status,
      id: brief.id // Keep track of the ID for updates
    };
    setFormData(openedData);
    setOriginalFormData(openedData);
    if (brief.showSummary) {
      setCurrentStep(AppStep.SUCCESS);
    } else {
      setCurrentStep(AppStep.CAMPAIGN);
    }
    setAppState('brief');
  };

  // Design System Constants
  const BUTTON_COLOR = '#3483FA'; // Interaction Blue
  const TITLE_COLOR = '#2D3277';  // Navy Blue

  // Cross-branding logic
  const sectionColor = formData.brand === 'Mercado Pago' ? '#2D3277' : '#009EE3';

  const handleDataChange = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  }, []);

  const isAdmin = user?.role === 'Admin' || user?.email === 'eliane.m.ortiz@gmail.com' || user?.email === 'eliane.ortiz@zetabe.com';
  const isLocked = ((formData.status === 'Submitted' && user?.email !== formData.owner) || formData.status === 'Archived') && !isAdmin;

  const validateAllSteps = (): string[] => {
    const errors: string[] = [];

    // CAMPAIGN
    if (!formData.brand) errors.push('Campaña: Selecciona una Marca.');
    if (!formData.country) errors.push('Campaña: Selecciona el País.');
    if (!formData.campaignName.trim()) errors.push('Campaña: Ingresa el Nombre de la Campaña.');
    if (!formData.level1) errors.push('Campaña: Selecciona el Level 1 (Categoría/Unidad).');
    if (!formData.level2) errors.push('Campaña: Selecciona el Level 2 (Subcategoría).');

    // CREATIVITY
    if (!formData.creativeConcept.trim()) errors.push('Bajada Creativa: El concepto creativo es obligatorio.');
    if (formData.materialQuantity <= 0) errors.push('Bajada Creativa: La cantidad de materiales debe ser mayor a 0.');
    if (formData.materialFormats.length === 0) errors.push('Bajada Creativa: Selecciona al menos un formato.');
    if (!formData.assetsAvailability) errors.push('Bajada Creativa: Indica si los materiales están disponibles.');

    // STRATEGY
    if (!formData.targetAudience) errors.push('Audiencia: Selecciona el Target Principal.');
    if (!formData.useFirstPartyData) errors.push('Audiencia: Indica si usarás audiencias 1st Party.');

    // SOCIAL
    if (formData.totalBudget <= 0) errors.push('Estrategia: Ingresa un presupuesto total válido.');
    const funnelTotal = (formData.funnel.upper || 0) + (formData.funnel.middle || 0) + (formData.funnel.lower || 0);
    if (funnelTotal !== 100) errors.push('Estrategia: La distribución del Funnel debe sumar exactamente 100%.');
    if (!formData.socialActionType) errors.push('Estrategia: Selecciona el Tipo de Acción Social.');
    
    const level1 = formData.level1?.toUpperCase() || '';
    const investment = formData.socialInvestmentPercent;
    if (level1 === 'DO' && investment < 30) {
        errors.push('Estrategia: Para campañas DO, la inversión mínima en Social es del 30%.');
    } else if ((level1 === 'FEEL' || level1 === 'THINK') && investment < 15) {
        errors.push(`Estrategia: Para campañas ${level1}, la inversión mínima en Social es del 15%.`);
    }

    // TOOLS
    if (!formData.useOpti) errors.push('Herramientas: Debes indicar si se utilizará OPTI.');

    return errors;
  };

  const handleNext = () => {
    if (currentStep === AppStep.TOOLS) {
        handleSubmit();
    } else {
        setCurrentStep((prev) => prev + 1);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step: AppStep) => {
    setCurrentStep(step);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep > AppStep.CAMPAIGN) {
      setCurrentStep((prev) => prev - 1);
      setError('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
      const newLogs = originalFormData && user ? generateActivityLogs(originalFormData, formData, user.email) : [];
      const dataToSave = {
        ...formData,
        activityLog: [...(formData.activityLog || []), ...newLogs]
      };

      const payload = {
          id: dataToSave.id,
          briefing_id: dataToSave.id || `BRIEF_${dataToSave.country}_${Date.now()}`,
          brand: dataToSave.brand,
          country: dataToSave.country,
          campaignName: dataToSave.campaignName,
          timestamp: new Date().toISOString(),
          data: dataToSave
      };
      
      try {
        await fetch('/api/briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        setAppState('dashboard');
      } catch (err) {
        console.error('Failed to save brief', err);
      }
  };

  const handleSubmit = async () => {
      const errors = validateAllSteps();
      if (errors.length > 0) {
        setError('Por favor completa los siguientes campos:\n• ' + errors.join('\n• '));
        return;
      }

      const submitData = { ...formData, status: 'Submitted' as const };
      const newLogs = originalFormData && user ? generateActivityLogs(originalFormData, submitData, user.email) : [];
      const dataToSave = {
        ...submitData,
        activityLog: [...(submitData.activityLog || []), ...newLogs]
      };

      const payload = {
          id: dataToSave.id,
          briefing_id: dataToSave.id || `BRIEF_${dataToSave.country}_${Date.now()}`,
          brand: dataToSave.brand,
          country: dataToSave.country,
          campaignName: dataToSave.campaignName,
          timestamp: new Date().toISOString(),
          data: dataToSave
      };
      
      try {
        await fetch('/api/briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error('Failed to save brief', err);
      }

      console.log("Submitting Payload:", payload);
      setTimeout(() => {
          setCurrentStep(AppStep.SUCCESS);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
  };

  const renderStep = () => {
    switch (currentStep) {
      case AppStep.CAMPAIGN: return <StepTaxonomy data={formData} onChange={handleDataChange} brandColor={sectionColor} />;
      case AppStep.CREATIVITY: return <StepCreativity data={formData} onChange={handleDataChange} sectionColor={sectionColor} />;
      case AppStep.STRATEGY: return <StepStrategy data={formData} onChange={handleDataChange} sectionColor={sectionColor} />;
      case AppStep.SOCIAL: return <StepSocial data={formData} onChange={handleDataChange} error={error} sectionColor={sectionColor} />;
      case AppStep.TOOLS: return <StepTools data={formData} onChange={handleDataChange} sectionColor={sectionColor} />;
      case AppStep.SUCCESS: return (
        <div className="text-center">
          <SuccessView data={formData} initialShowSummary={formData.status === 'Submitted' && appState === 'brief' && currentStep === AppStep.SUCCESS} sectionColor={sectionColor} />
          <button 
            onClick={() => setAppState('dashboard')}
            className="mt-8 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all print:hidden"
            style={{ backgroundColor: sectionColor }}
          >
            Volver al Dashboard
          </button>
        </div>
      );
      default: return null;
    }
  };

  if (appState === 'loading') {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><div className="animate-pulse text-[#2D3277] font-medium">Cargando...</div></div>;
  }

  if (appState === 'login') {
    return <Login onLoginSuccess={() => setAppState('dashboard')} />
  }

  if (appState === 'dashboard' && user) {
    return <Dashboard user={user} onCreateNew={handleCreateNew} onOpenBrief={handleOpenBrief} onLogout={handleLogout} onOpenSettings={() => setAppState('settings')} onOpenAdminPanel={() => setAppState('admin')} />;
  }

  if (appState === 'settings' && user) {
    return <Settings user={user} onBack={() => setAppState('dashboard')} />;
  }

  if (appState === 'admin' && user && user.role === 'Admin') {
    return <AdminPanel user={user} onBack={() => setAppState('dashboard')} />;
  }

  if (appState === 'brief' && user) {
    const isLocked = formData.status === 'Submitted' || formData.status === 'Archived';
    const progress = calculateProgress(formData);
    
    const sections = [
      { id: AppStep.CAMPAIGN, label: 'Campaign' },
      { id: AppStep.CREATIVITY, label: 'Creative' },
      { id: AppStep.STRATEGY, label: 'Audience' },
      { id: AppStep.SOCIAL, label: 'Strategy' },
      { id: AppStep.TOOLS, label: 'Tools' },
    ];

    const getStatusIcon = (step: AppStep) => {
      const status = getStepStatus(step, formData);
      if (status === 'completed') return <CheckCircle size={14} className="text-green-500" />;
      if (status === 'in-progress') return <Hourglass size={14} className="text-yellow-500" />;
      return <Circle size={14} className="text-gray-300" />;
    };

    if (currentStep === AppStep.SUCCESS) {
      return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-800 pb-20">
          <Header />
          <main className="container max-w-4xl mx-auto px-4 lg:px-0 py-10">
            <div className="bg-white rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-8 print:p-0">
                {renderStep()}
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-[#F9FAFB] font-sans text-gray-800 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
          <div className="h-16 border-b border-gray-200 flex items-center px-6">
            <button 
              onClick={() => setAppState('dashboard')}
              className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <ChevronLeft size={16} /> Volver al Dashboard
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Secciones</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentStep(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    currentStep === section.id 
                      ? 'bg-blue-50' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={currentStep === section.id ? { color: sectionColor } : {}}
                >
                  {getStatusIcon(section.id)}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Top Header */}
          <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setAppState('dashboard')}
                className="md:hidden text-gray-500 hover:text-gray-800 p-1"
              >
                <ChevronLeft size={18} />
              </button>
              <h1 className="text-base font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                {formData.campaignName || 'Brief sin título'}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium hidden sm:inline-block uppercase tracking-wider
                ${formData.status === 'Submitted' ? 'bg-green-100 text-green-700' : 
                  formData.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                  formData.status === 'Archived' ? 'bg-gray-100 text-gray-700' : 
                  'bg-yellow-100 text-yellow-700'}`}>
                {formData.status}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setActivePanel('collaborators')}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Colaboradores"
              >
                <Users size={16} />
              </button>
              <button 
                onClick={() => setActivePanel('activity')}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Actividad"
              >
                <Clock size={16} />
              </button>
              <button 
                onClick={() => setActivePanel('settings')}
                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Configuración del Brief"
              >
                <SettingsIcon size={16} />
              </button>
            </div>
          </header>

          {/* Compact Progress Bar */}
          <div className="bg-white px-6 py-2 border-b border-gray-100 shrink-0 flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap uppercase tracking-wider">Progreso {progress}%</span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, backgroundColor: sectionColor }}
              />
            </div>
          </div>

          {/* Warning Banner */}
          {isLocked && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 shrink-0 flex items-center">
              <Lock className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 font-medium">
                {formData.status === 'Archived' 
                  ? 'Este brief ha sido archivado y no puede ser modificado.' 
                  : 'Este brief ya ha sido enviado. Solo el propietario puede realizar modificaciones.'}
              </p>
            </div>
          )}

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto bg-white flex flex-col">
            <div className="flex-1 max-w-4xl w-full mx-auto py-8 px-6 lg:px-12">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: sectionColor }}>BRIEF DE MEDIOS REGIONAL</h2>
                <p className="text-sm text-gray-600 mt-2">Estandarización de Campañas LatAm 2026</p>
              </div>
              <div className={`transition-opacity duration-200 ${isLocked ? 'pointer-events-none opacity-70' : ''}`}>
                <div className="pb-12">
                  {renderStep()}
                </div>
              </div>
            </div>
            
            {/* Footer Actions - Fixed at bottom */}
            <div className="bg-white px-6 lg:px-12 py-4 border-t border-gray-200 flex justify-between items-center shrink-0 z-10 sticky bottom-0">
              <button
                onClick={handleBack}
                disabled={currentStep === AppStep.CAMPAIGN}
                className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                  ${currentStep === AppStep.CAMPAIGN 
                    ? 'opacity-0 pointer-events-none' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ChevronLeft size={16} />
                Atrás
              </button>

              <div className="flex items-center gap-4">
                {error && (
                  <div className="text-red-500 text-sm font-medium hidden sm:block">
                    {error.split('\n')[0]}...
                  </div>
                )}
                
                {!isLocked && (
                  <button
                    onClick={handleSave}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Guardar Borrador
                  </button>
                )}
                
                {!(isLocked && currentStep === AppStep.TOOLS) && (
                  <button
                    onClick={handleNext}
                    disabled={currentStep === AppStep.TOOLS && user?.email !== formData.owner}
                    className={`text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 text-sm ${
                      currentStep === AppStep.TOOLS && user?.email !== formData.owner 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:opacity-90'
                    }`}
                    style={{ backgroundColor: sectionColor }}
                  >
                    {currentStep === AppStep.TOOLS ? 'Enviar Brief' : 'Siguiente'}
                    {currentStep !== AppStep.TOOLS && <ArrowRight size={16} />}
                  </button>
                )}
              </div>
            </div>
            {error && (
              <div className="bg-red-50 px-6 py-3 border-t border-red-100 sm:hidden shrink-0">
                <div className="text-red-600 text-sm font-medium whitespace-pre-line">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Slide Panels */}
        <RightPanel 
          title="Colaboradores" 
          isOpen={activePanel === 'collaborators'} 
          onClose={() => setActivePanel(null)}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Propietario</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {formData.owner.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 font-medium">{formData.owner}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Colaboradores</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {formData.collaborators?.length || 0}
                </span>
              </div>
              
              {formData.collaborators && formData.collaborators.length > 0 ? (
                <div className="space-y-2">
                  {formData.collaborators.map((collab, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {collab.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 truncate">{collab}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay colaboradores asignados.</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-3">
                Solo el propietario o un administrador pueden modificar los colaboradores desde la configuración.
              </p>
              <button 
                onClick={() => setActivePanel('settings')}
                className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Gestionar en Configuración
              </button>
            </div>
          </div>
        </RightPanel>

        <RightPanel 
          title="Actividad Reciente" 
          isOpen={activePanel === 'activity'} 
          onClose={() => setActivePanel(null)}
        >
          {formData.activityLog && formData.activityLog.length > 0 ? (
            <div className="space-y-4">
              {[...formData.activityLog].reverse().map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-600">{log.userEmail.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.userEmail.split('@')[0]}</span> {log.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Clock size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No hay actividad registrada aún.</p>
            </div>
          )}
        </RightPanel>

        <RightPanel 
          title="Configuración del Brief" 
          isOpen={activePanel === 'settings'} 
          onClose={() => setActivePanel(null)}
        >
          <div className="space-y-6">
            <BriefSettings 
              data={formData} 
              onChange={handleDataChange} 
              currentUserEmail={user.email} 
              onSave={handleSave}
              isLocked={isLocked}
            />
          </div>
        </RightPanel>
      </div>
    );
  }

  return null;
};

export default App;
