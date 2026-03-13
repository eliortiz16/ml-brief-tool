import React, { useEffect, useState } from 'react';
import { LogIn, AlertCircle, Mail } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

const handleEmailLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email.trim()) {
    setError('Por favor ingresa tu correo electrónico.');
    return;
  }

  if (
    !email.endsWith('@mercadolibre.com') &&
    !email.endsWith('@zetabe.com')
  ) {
    setError('Debes usar un correo corporativo válido.');
    return;
  }

  setIsLoading(true);

  setTimeout(() => {
    setIsLoading(false);
    onLoginSuccess();
  }, 800);
};

  const handleGoogleLogin = async () => {
    // Google login is temporarily disabled
    setError('El inicio de sesión con Google estará disponible próximamente. Por favor usa tu correo.');
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        onLoginSuccess();
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setError(event.data.error || 'Autenticación fallida');
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-[#FFF059] rounded-2xl flex items-center justify-center shadow-sm">
            <span className="text-[#2D3277] font-bold text-2xl">ML</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-[#2D3277] mb-2">
          Brief de Medios Regional
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Ingresa con tu cuenta corporativa para continuar
        </p>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 text-left">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="mb-6 text-left">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@mercadolibre.com"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-[#3483FA] focus:border-[#3483FA] sm:text-sm transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-[#3483FA] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2968c8] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Conectando...' : 'Continuar'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={true}
          className="w-full bg-white border border-gray-200 text-gray-400 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm cursor-not-allowed"
        >
          <svg className="w-5 h-5 opacity-50" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar con Google (Próximamente)
        </button>
        
        <p className="mt-6 text-xs text-gray-400">
          Solo para usuarios @mercadolibre.com y @zetabe.com
        </p>
      </div>
    </div>
  );
};
