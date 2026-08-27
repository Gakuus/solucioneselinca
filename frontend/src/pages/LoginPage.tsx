import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Wrench, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Wrench size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            SOLUCIONES
            <span className="block text-red-500">EL INCA</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Sistema de gestión de mantenimiento de maquinaria de construcción
          </p>
          <div className="mt-12 flex justify-center gap-8 text-gray-500 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div>Monitoreo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100%</div>
              <div>Control</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">IOT</div>
              <div>Integrado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Wrench size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              SOLUCIONES <span className="text-red-600">EL INCA</span>
            </h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="text-gray-500 mt-1">Ingresa tus credenciales para acceder</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="admin@solucioneselinca.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/25"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            © 2026 Soluciones EL INCA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
