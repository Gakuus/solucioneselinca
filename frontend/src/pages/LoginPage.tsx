import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Wrench, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePos({ x, y });
    };
    const panel = panelRef.current;
    panel?.addEventListener('mousemove', handleMouseMove);
    return () => panel?.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Shake on error
  useEffect(() => {
    if (error) {
      setShakeError(true);
      const timer = setTimeout(() => setShakeError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
      {/* Left Panel - Branding with parallax */}
      <div ref={panelRef} className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Parallax background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 ease-out"
          style={{
            backgroundImage: "url('/elinca.jpg')",
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px) scale(1.1)`,
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer" />

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          {/* Floating icon */}
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-icon-float stagger-hidden animate-fade-in">
            <Wrench size={40} className="text-white animate-icon-spin" />
          </div>

          {/* Staggered text */}
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight stagger-hidden animate-fade-in-left delay-200">
            SOLUCIONES
            <span className="block text-red-500">EL INCA</span>
          </h1>

          <p className="text-gray-200 text-lg max-w-md stagger-hidden animate-fade-in-left delay-400">
            Sistema de gestión de mantenimiento de maquinaria de construcción
          </p>

          {/* Stats with stagger */}
          <div className="mt-12 flex justify-center gap-8 text-gray-300 text-sm stagger-hidden animate-fade-in-up delay-600">
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
          <div className="lg:hidden text-center mb-8 stagger-hidden animate-fade-in-up">
            <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-icon-float">
              <Wrench size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              SOLUCIONES <span className="text-red-600">EL INCA</span>
            </h1>
          </div>

          {/* Login Card */}
          <div className={`bg-white rounded-2xl shadow-xl p-8 stagger-hidden animate-fade-in-up delay-300 ${shakeError ? 'animate-shake' : ''}`}>
            <div className="mb-8 stagger-hidden animate-fade-in-up delay-400">
              <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
              <p className="text-gray-500 mt-1">Ingresa tus credenciales para acceder</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2 stagger-hidden animate-scale-in">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="stagger-hidden animate-fade-in-up delay-400">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:scale-[1.02] transition-all duration-200"
                  placeholder="admin@solucioneselinca.com"
                  required
                />
              </div>

              {/* Password field */}
              <div className="stagger-hidden animate-fade-in-up delay-500">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:scale-[1.02] transition-all duration-200 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="stagger-hidden animate-fade-in-up delay-600 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] animate-glow-pulse"
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
              </div>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6 stagger-hidden animate-fade-in delay-700">
            © 2026 SOLUCIONES EL INCA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
