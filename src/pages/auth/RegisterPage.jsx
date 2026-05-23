import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi, usersApi } from '../../api';
import { isValidRut } from '../../utils/rutValidator';
import { HeartIcon } from '@heroicons/react/24/outline';

const roleOptions = [
  { value: 'donante', label: 'Donante', desc: 'Quiero realizar donaciones a familias en Chile' },
  { value: 'beneficiary', label: 'Beneficiario', desc: 'Mi familia necesita ayuda de emergencia' },
  { value: 'organization', label: 'Empresa/Organización', desc: 'Somos una empresa que desea donar con certificado' },
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'donante';
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [comunas, setComunas] = useState([]);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const regionId = watch('regionId');

  useEffect(() => {
    usersApi.getRegions().then((r) => setRegions(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (regionId) {
      usersApi.getComunasByRegion(regionId).then((r) => setComunas(r.data ?? [])).catch(() => {});
    }
  }, [regionId]);

  const onSubmit = async (rawData) => {
    setLoading(true);
    const { terms, ...data } = rawData;
    if (data.rut) data.rut = data.rut.replace(/\./g, '').trim();
    try {
      if (role === 'donante') {
        await authApi.register({ ...data, roleId: 2 });
      } else if (role === 'beneficiary') {
        await authApi.registerBeneficiary(data);
      } else {
        await authApi.registerOrganization(data);
      }
      toast.success('¡Cuenta creada! Revisa tu correo para confirmar.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center shadow-md">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl">
              <span className="text-primary-800">Dona</span>
              <span className="text-danger-600">tech</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Role selector */}
        <div className="card mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Tipo de cuenta</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roleOptions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                  role === r.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-semibold text-sm ${role === r.value ? 'text-primary-700' : 'text-gray-800'}`}>
                  {r.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="label">Nombre completo</label>
              <input
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder="Juan Pérez"
                className="input-field"
              />
              {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <input
                {...register('email', {
                  required: 'El correo es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
                })}
                type="email"
                placeholder="juan@correo.cl"
                className="input-field"
              />
              {errors.email && <p className="text-xs text-danger-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
              {errors.password && <p className="text-xs text-danger-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Teléfono (opcional)</label>
              <input
                {...register('phone')}
                placeholder="+56 9 1234 5678"
                className="input-field"
              />
            </div>

            {role === 'beneficiary' && (
              <div>
                <label className="label">RUT</label>
                <input
                  {...register('rut', {
                    required: 'El RUT es requerido',
                    pattern: { value: /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/, message: 'Formato inválido (ej: 12345678-9)' },
                    validate: (v) => isValidRut(v) || 'RUT inválido (dígito verificador incorrecto)',
                  })}
                  placeholder="12345678-9"
                  className="input-field"
                />
                {errors.rut && <p className="text-xs text-danger-600 mt-1">{errors.rut.message}</p>}
              </div>
            )}

            {(role === 'beneficiary' || role === 'organization') && (
              <>
                <div>
                  <label className="label">Región</label>
                  <select {...register('regionId')} className="input-field">
                    <option value="">Selecciona región</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre ?? r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Comuna</label>
                  <select {...register('comunaId')} className="input-field" disabled={!regionId}>
                    <option value="">Selecciona comuna</option>
                    {comunas.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre ?? c.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {role === 'beneficiary' && (
              <>
                <div className="sm:col-span-2">
                  <label className="label">Dirección de entrega</label>
                  <input
                    {...register('direccionEntrega', { required: 'La dirección es requerida' })}
                    placeholder="Av. Principal 123, Santiago"
                    className="input-field"
                  />
                  {errors.direccionEntrega && <p className="text-xs text-danger-600 mt-1">{errors.direccionEntrega.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Descripción de la situación</label>
                  <textarea
                    {...register('observaciones')}
                    rows={3}
                    placeholder="Describe brevemente tu situación..."
                    className="input-field resize-none"
                  />
                </div>
              </>
            )}

            {role === 'organization' && (
              <>
                <div>
                  <label className="label">RUT de la empresa</label>
                  <input
                    {...register('rut', {
                      required: 'El RUT de la empresa es obligatorio',
                      pattern: { value: /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/, message: 'Formato inválido (ej: 12345678-9)' },
                      validate: (v) => isValidRut(v) || 'RUT inválido (dígito verificador incorrecto)',
                    })}
                    placeholder="12345678-9"
                    className="input-field"
                  />
                  {errors.rut && <p className="text-xs text-danger-600 mt-1">{errors.rut.message}</p>}
                </div>
                <div>
                  <label className="label">Razón social</label>
                  <input
                    {...register('razonSocial', {
                      required: 'La razón social es obligatoria',
                      maxLength: { value: 200, message: 'Máximo 200 caracteres' },
                    })}
                    placeholder="Empresa S.A."
                    className="input-field"
                  />
                  {errors.razonSocial && <p className="text-xs text-danger-600 mt-1">{errors.razonSocial.message}</p>}
                </div>
                <div>
                  <label className="label">Giro comercial (opcional)</label>
                  <input
                    {...register('giro', { maxLength: { value: 200, message: 'Máximo 200 caracteres' } })}
                    placeholder="Comercio al por menor"
                    className="input-field"
                  />
                  {errors.giro && <p className="text-xs text-danger-600 mt-1">{errors.giro.message}</p>}
                </div>
                <div>
                  <label className="label">Dirección legal (opcional)</label>
                  <input
                    {...register('direccionLegal', { maxLength: { value: 400, message: 'Máximo 400 caracteres' } })}
                    placeholder="Av. Providencia 123, Santiago"
                    className="input-field"
                  />
                  {errors.direccionLegal && <p className="text-xs text-danger-600 mt-1">{errors.direccionLegal.message}</p>}
                </div>
              </>
            )}
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              {...register('terms', { required: 'Debes aceptar los términos' })}
              className="mt-0.5 h-4 w-4 accent-primary-600"
            />
            <label className="text-sm text-gray-600">
              Acepto los{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Términos y Condiciones</span>
              {' '}y la{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">Política de Privacidad</span>
              {' '}conforme a la Ley 19.628
            </label>
          </div>
          {errors.terms && <p className="text-xs text-danger-600">{errors.terms.message}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
