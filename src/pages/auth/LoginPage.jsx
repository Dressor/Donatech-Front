import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { HeartIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { getErrorMessage } from '../../utils/errorHandler';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data);
      toast.success(`¡Bienvenido/a de vuelta!`);
      // Role-based redirect
      if (user.roles?.includes('ROLE_ADMIN')) navigate('/admin/dashboard', { replace: true });
      else if (user.roles?.includes('ROLE_VOLUNTARIO')) navigate('/validator/pending', { replace: true });
      else if (user.roles?.includes('ROLE_BENEFICIARIO')) navigate('/beneficiary/campaign', { replace: true });
      else navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-danger-600/20 blur-3xl" />
        </div>
        <div className="relative text-white text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-xl">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4">Bienvenido a Donatech</h2>
          <p className="text-blue-100 leading-relaxed">
            La plataforma solidaria que conecta donantes con familias vulnerables,
            garantizando transparencia y trazabilidad en cada donación.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['1,240+', 'Familias'], ['85', 'Campañas'], ['100%', 'Transparente']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl py-3 px-2 border border-white/20">
                <div className="text-xl font-bold">{v}</div>
                <div className="text-xs text-blue-200 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">
              <span className="text-primary-800">Dona</span>
              <span className="text-danger-600">tech</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mb-8">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                })}
                type="email"
                placeholder="tu@correo.cl"
                className="input-field"
              />
              {errors.email && <p className="text-xs text-danger-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'La contraseña es requerida' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger-600 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
            Al ingresar aceptas nuestros{' '}
            <span className="text-primary-600 cursor-pointer hover:underline">Términos y Condiciones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
