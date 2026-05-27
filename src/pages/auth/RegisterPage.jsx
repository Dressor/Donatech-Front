import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi, usersApi } from '../../api';
import { isValidRut } from '../../utils/rutValidator';
import {
  HeartIcon,
  ClockIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

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
  const [patenteFile, setPatenteFile] = useState(null);
  const [registeredPending, setRegisteredPending] = useState(false);
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
    if (role === 'organization' && !patenteFile) {
      toast.error('Debes subir la Patente Municipal para registrar tu empresa.');
      return;
    }

    setLoading(true);
    const { terms, ...data } = rawData;
    if (data.rut) data.rut = data.rut.replace(/\./g, '').trim();
    try {
      if (role === 'donante') {
        await authApi.register({ ...data, roleId: 2 });
        toast.success('¡Cuenta creada! Revisa tu correo para confirmar.');
        navigate('/login');
      } else if (role === 'beneficiary') {
        await authApi.registerBeneficiary(data);
        setRegisteredPending(true);
      } else {
        // Organización — se envía como FormData para incluir el archivo
        const formData = new FormData();
        if (data.name)     formData.append('name', data.name);
        if (data.email)    formData.append('email', data.email);
        if (data.password) formData.append('password', data.password);
        if (data.phone)    formData.append('phone', data.phone);
        if (data.rut)      formData.append('rut', data.rut);
        if (data.regionId)      formData.append('regionId', data.regionId);
        if (data.comunaId)      formData.append('comunaId', data.comunaId);
        if (data.razonSocial)   formData.append('razonSocial', data.razonSocial);
        if (data.giro)          formData.append('giro', data.giro);
        if (data.direccionLegal) formData.append('direccionLegal', data.direccionLegal);
        formData.append('patenteFile', patenteFile);
        await authApi.registerOrganization(formData);
        setRegisteredPending(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  /* ── Pantalla de solicitud pendiente ── */
  if (registeredPending) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full card text-center p-10">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-5">
            <ClockIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {role === 'beneficiary' ? 'Solicitud recibida' : 'Empresa registrada'}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-2">
            {role === 'beneficiary'
              ? 'Tu registro fue enviado correctamente. Un administrador revisará tu información según los criterios de aprobación y te notificará cuando tu cuenta esté activa.'
              : 'Tu solicitud fue enviada. El administrador revisará tu Patente Municipal y activará tu cuenta una vez validada la documentación.'}
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Este proceso puede tomar algunos días hábiles.
          </p>
          <Link to="/" className="btn-primary w-full block text-center">
            Volver al inicio
          </Link>
          <Link to="/login" className="btn-outline w-full block text-center mt-3">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  /* ── Formulario de registro ── */
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

        {/* Selector de tipo de cuenta */}
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

        {/* Avisos informativos */}
        {role === 'beneficiary' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
            <strong>Importante:</strong> El registro como beneficiario requiere aprobación del administrador.
            Tu solicitud será revisada antes de que puedas acceder a la plataforma.
          </div>
        )}
        {role === 'organization' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            <strong>Importante:</strong> Para registrarte como empresa debes adjuntar tu Patente Municipal
            vigente. El administrador validará el documento antes de activar tu cuenta.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Nombre / Razón social */}
            <div className="sm:col-span-2">
              <label className="label">
                {role === 'organization' ? 'Razón Social o Nombre de la Empresa' : 'Nombre completo'}
              </label>
              <input
                {...register('name', { required: 'El nombre es requerido' })}
                placeholder={role === 'organization' ? 'Empresa XYZ Ltda.' : 'Juan Pérez'}
                className="input-field"
              />
              {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Correo */}
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

            {/* Contraseña */}
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

            {/* Teléfono */}
            <div>
              <label className="label">Teléfono (opcional)</label>
              <input
                {...register('phone')}
                placeholder="+56 9 1234 5678"
                className="input-field"
              />
            </div>

            {/* RUT – Beneficiario */}
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

            {/* Región y Comuna */}
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

            {/* Campos extra – Beneficiario */}
            {role === 'beneficiary' && (
              <>
                <div className="sm:col-span-2">
                  <label className="label">Dirección de entrega</label>
                  <input
                    {...register('direccionEntrega', { required: 'La dirección es requerida' })}
                    placeholder="Av. Principal 123, Santiago"
                    className="input-field"
                  />
                  {errors.direccionEntrega && (
                    <p className="text-xs text-danger-600 mt-1">{errors.direccionEntrega.message}</p>
                  )}
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

            {/* Campos específicos de Empresa/Organización */}
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
                <div className="sm:col-span-2">
                  <label className="label">
                    Patente Municipal <span className="text-danger-600">*</span>
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-5 transition-colors cursor-pointer ${
                      patenteFile
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setPatenteFile(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center pointer-events-none">
                      <ArrowUpTrayIcon
                        className={`w-8 h-8 mx-auto mb-2 ${
                          patenteFile ? 'text-primary-500' : 'text-gray-400'
                        }`}
                      />
                      {patenteFile ? (
                        <>
                          <p className="text-sm font-medium text-primary-700">{patenteFile.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Haz clic para cambiar el archivo</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600">Sube tu Patente Municipal aquí</p>
                          <p className="text-xs text-gray-400 mt-0.5">PDF, JPG o PNG · Máximo 10 MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Este documento es necesario para verificar tu empresa ante el administrador.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Términos */}
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

          <button
            type="submit"
            disabled={loading || (role === 'organization' && !patenteFile)}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </span>
            ) : role === 'beneficiary' ? (
              'Enviar solicitud'
            ) : role === 'organization' ? (
              'Registrar empresa'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
