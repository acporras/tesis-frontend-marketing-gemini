import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../config';
import { Lock, Mail, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error de autenticación');
      }

      login(data.usuario, data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Brand & Features */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -z-10"></div>

          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ADCAMI</h1>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Marketing Bancario
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300 block">
                    Impulsado por IA
                  </span>
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Automatiza, optimiza y escala tus campañas de marketing con inteligencia artificial de última generación.
                </p>
              </div>

              <div className="space-y-4 pt-8">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Análisis Inteligente</p>
                    <p className="text-slate-400 text-sm">Descubre patrones en tus audiencias</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Automatización Total</p>
                    <p className="text-slate-400 text-sm">Campañas sin intervención manual</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Resultados Medibles</p>
                    <p className="text-slate-400 text-sm">Métricas en tiempo real y precisas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-slate-400 text-sm">
            <p>Confía en la plataforma elegida por los principales bancos de América Latina</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile header */}
            <div className="lg:hidden mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">ADCAMI</h1>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
                <p className="text-slate-400">Accede a tu cuenta para continuar</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="ejemplo@banco.pe"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-500 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
