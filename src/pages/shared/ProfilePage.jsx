import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { usersApi, authApi, ordersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuthImage } from '../../utils/imageBlob';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { UserCircleIcon, TruckIcon, CameraIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const { user, isValidador, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [regions, setRegions] = useState([]);
  const [comunas, setComunas] = useState([]);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const regionId = watch('regionId');

  // Perfil propio (prefill)
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.getMyProfile(),
    select: (r) => r.data,
    enabled: !!user,
  });

  const role = profile?.role;
  const isBenef = role === 'ROLE_BENEFICIARIO';
  const isOrg = role === 'ROLE_ORGANIZACION';

  // Avatar actual
  const { blobUrl: avatarUrl } = useAuthImage(
    ['user-avatar', user?.id],
    // 404 = el usuario no tiene foto de perfil; se traga para no disparar el toast de error global.
    () => usersApi.getAvatar(user.id).catch((e) => {
      if (e?.response?.status === 404) return { data: null };
      throw e;
    }),
    { enabled: !!user?.id, retry: false }
  );

  // Entregas asignadas (colaborador)
  const { data: assigned = [] } = useQuery({
    queryKey: ['my-deliveries', user?.id],
    queryFn: () => ordersApi.getByCollaborator(user.id),
    select: (r) => r.data ?? [],
    enabled: isValidador && !!user?.id,
  });

  useEffect(() => {
    usersApi.getRegions().then((r) => setRegions(r.data ?? [])).catch(() => {});
  }, []);

  // Prefill del formulario al cargar el perfil
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? '',
        apellido: profile.apellido ?? '',
        phone: profile.phone ?? '',
        regionId: profile.regionId ?? '',
        comunaId: profile.comunaId ?? '',
        direccionEntrega: profile.direccionEntrega ?? '',
        observaciones: profile.observaciones ?? '',
        razonSocial: profile.razonSocial ?? '',
        giro: profile.giro ?? '',
        direccionLegal: profile.direccionLegal ?? '',
      });
    }
  }, [profile, reset]);

  // Cargar comunas cuando cambia la región (incluye la precarga inicial)
  useEffect(() => {
    if (regionId) {
      usersApi.getComunasByRegion(regionId).then((r) => setComunas(r.data ?? [])).catch(() => {});
    } else {
      setComunas([]);
    }
  }, [regionId]);

  const saveMutation = useMutation({
    mutationFn: (data) => usersApi.updateMyProfile({
      name: data.name,
      apellido: data.apellido,
      phone: data.phone || null,
      regionId: data.regionId || null,
      comunaId: data.comunaId || null,
      direccionEntrega: isBenef ? (data.direccionEntrega || null) : null,
      observaciones: isBenef ? (data.observaciones || null) : null,
      razonSocial: isOrg ? data.razonSocial : null,
      giro: isOrg ? (data.giro || null) : null,
      direccionLegal: isOrg ? (data.direccionLegal || null) : null,
    }),
    onSuccess: (res) => {
      toast.success('Perfil actualizado');
      updateUser({ name: res.data?.name, apellido: res.data?.apellido });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => usersApi.uploadMyAvatar(file),
    onSuccess: () => {
      toast.success('Avatar actualizado');
      queryClient.invalidateQueries({ queryKey: ['user-avatar', user?.id] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Inicia sesión para ver tu perfil.</p>
        <Link to="/login" className="btn-primary mt-4 inline-block">Iniciar sesión</Link>
      </div>
    );
  }
  if (isLoading) return <LoadingSpinner text="Cargando perfil..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Cabecera + avatar */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="w-16 h-16 text-primary-600" />
            )}
            <label className="absolute -bottom-1 -right-1 bg-primary-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-primary-700">
              <CameraIcon className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files[0]) avatarMutation.mutate(e.target.files[0]); }}
              />
            </label>
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 text-lg truncate">{[profile?.name, profile?.apellido].filter(Boolean).join(' ') || user.email}</h1>
            <p className="text-sm text-gray-500 truncate">{profile?.email ?? user.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {(user.roles ?? []).map((r) => (
                <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-primary-700 font-medium">
                  {r.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Datos del perfil */}
      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="card space-y-5">
        <h2 className="font-semibold text-gray-800">Datos personales</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre</label>
            <input
              {...register('name', {
                required: 'El nombre es requerido',
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúüÜñÑ]+$/, message: 'Solo letras, sin espacios' },
              })}
              className="input-field"
            />
            {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Apellido</label>
            <input
              {...register('apellido', {
                required: 'El apellido es requerido',
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúüÜñÑ]+$/, message: 'Solo letras, sin espacios' },
              })}
              className="input-field"
            />
            {errors.apellido && <p className="text-xs text-danger-600 mt-1">{errors.apellido.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Email (no editable)</label>
          <input value={profile?.email ?? ''} disabled className="input-field bg-gray-100 text-gray-500 cursor-not-allowed" />
        </div>

        <div>
          <label className="label">Teléfono</label>
          <input {...register('phone')} placeholder="+56 9 1234 5678" className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Región</label>
            <select {...register('regionId')} className="input-field">
              <option value="">Selecciona región</option>
              {regions.map((r) => <option key={r.id} value={r.id}>{r.name ?? r.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Comuna</label>
            <select {...register('comunaId')} className="input-field" disabled={!regionId}>
              <option value="">Selecciona comuna</option>
              {comunas.map((c) => <option key={c.id} value={c.id}>{c.name ?? c.nombre}</option>)}
            </select>
          </div>
        </div>

        {(isBenef || isOrg) && (
          <div>
            <label className="label">RUT (no editable)</label>
            <input value={profile?.rut ?? ''} disabled className="input-field bg-gray-100 text-gray-500 cursor-not-allowed" />
          </div>
        )}

        {isBenef && (
          <>
            <div>
              <label className="label">Dirección de entrega</label>
              <input {...register('direccionEntrega')} className="input-field" />
            </div>
            <div>
              <label className="label">Observaciones</label>
              <textarea {...register('observaciones')} rows={2} className="input-field resize-none" />
            </div>
          </>
        )}

        {isOrg && (
          <>
            <div>
              <label className="label">Razón social</label>
              <input {...register('razonSocial', { required: 'La razón social es requerida' })} className="input-field" />
              {errors.razonSocial && <p className="text-xs text-danger-600 mt-1">{errors.razonSocial.message}</p>}
            </div>
            <div>
              <label className="label">Giro</label>
              <input {...register('giro')} className="input-field" />
            </div>
            <div>
              <label className="label">Dirección legal</label>
              <input {...register('direccionLegal')} className="input-field" />
            </div>
          </>
        )}

        <button type="submit" disabled={saveMutation.isPending} className="btn-primary w-full">
          {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {/* Cambiar contraseña */}
      <ChangePasswordCard />

      {/* Entregas asignadas (colaborador) */}
      {isValidador && (
        <div className="card flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <TruckIcon className="w-5 h-5 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Mis entregas asignadas</p>
              <p className="text-sm text-gray-500">{assigned.length} entrega(s) en curso</p>
            </div>
          </div>
          <Link to="/admin/deliveries" className="btn-primary text-sm">Ver entregas →</Link>
        </div>
      )}
    </div>
  );
}

function ChangePasswordCard() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const mutation = useMutation({
    mutationFn: (data) => authApi.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }),
    onSuccess: () => { toast.success('Contraseña actualizada'); reset(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
      <div className="flex items-center gap-2">
        <LockClosedIcon className="w-5 h-5 text-primary-600" />
        <h2 className="font-semibold text-gray-800">Cambiar contraseña</h2>
      </div>
      <div>
        <label className="label">Contraseña actual</label>
        <input type="password" {...register('currentPassword', { required: 'Requerida' })} className="input-field" />
        {errors.currentPassword && <p className="text-xs text-danger-600 mt-1">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="label">Nueva contraseña</label>
        <input type="password" {...register('newPassword', { required: 'Requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} className="input-field" />
        {errors.newPassword && <p className="text-xs text-danger-600 mt-1">{errors.newPassword.message}</p>}
      </div>
      <div>
        <label className="label">Confirmar nueva contraseña</label>
        <input
          type="password"
          {...register('confirmPassword', { validate: (v) => v === newPassword || 'Las contraseñas no coinciden' })}
          className="input-field"
        />
        {errors.confirmPassword && <p className="text-xs text-danger-600 mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={mutation.isPending} className="btn-secondary w-full">
        {mutation.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
      </button>
    </form>
  );
}
