import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { usersApi, authApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { isValidRut } from '../../utils/rutValidator';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { UsersIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ids de rol (data.sql): 1 ADMIN · 2 DONANTE · 3 VOLUNTARIO · 4 BENEFICIARIO · 5 ORGANIZACION
const ROLE_BENEFICIARIO = 4;
const ROLE_ORGANIZACION = 5;

function CreateUserModal({ onClose, onCreated }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { roleId: '' },
  });
  const roleId = Number(watch('roleId'));
  const regionId = watch('regionId');
  const isBeneficiario = roleId === ROLE_BENEFICIARIO;
  const isOrganizacion = roleId === ROLE_ORGANIZACION;
  const needsLocation = isBeneficiario || isOrganizacion;

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => usersApi.getRoles(),
    select: (r) => r.data ?? [],
  });
  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => usersApi.getRegions(),
    select: (r) => r.data ?? [],
    enabled: needsLocation,
  });
  const { data: comunas = [] } = useQuery({
    queryKey: ['comunas', regionId],
    queryFn: () => usersApi.getComunasByRegion(regionId),
    select: (r) => r.data ?? [],
    enabled: needsLocation && !!regionId,
  });

  const createMutation = useMutation({
    mutationFn: (form) => {
      const base = {
        name: form.name,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      };
      if (isBeneficiario) {
        return authApi.registerBeneficiary({
          ...base,
          rut: form.rut,
          regionId: Number(form.regionId),
          comunaId: Number(form.comunaId),
          direccionEntrega: form.direccionEntrega,
        });
      }
      if (isOrganizacion) {
        return authApi.registerOrganization({
          ...base,
          rut: form.rut,
          razonSocial: form.razonSocial,
          giro: form.giro || undefined,
          direccionLegal: form.direccionLegal || undefined,
          regionId: Number(form.regionId),
          comunaId: Number(form.comunaId),
        });
      }
      return authApi.register({ ...base, roleId: Number(form.roleId) });
    },
    onSuccess: () => {
      toast.success('Usuario creado correctamente');
      reset();
      onCreated();
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Agregar usuario / colaborador</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Rol</label>
            <select {...register('roleId', { required: 'Selecciona un rol' })} className="input-field">
              <option value="">Selecciona un rol...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name?.replace('ROLE_', '')}</option>
              ))}
            </select>
            {errors.roleId && <p className="text-xs text-danger-600 mt-1">{errors.roleId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre</label>
              <input
                {...register('name', {
                  required: 'Nombre obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$/, message: 'Solo letras, sin espacios' },
                })}
                className="input-field"
                placeholder="Juan"
              />
              {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Apellido</label>
              <input
                {...register('apellido', {
                  required: 'Apellido obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$/, message: 'Solo letras, sin espacios' },
                })}
                className="input-field"
                placeholder="Pérez"
              />
              {errors.apellido && <p className="text-xs text-danger-600 mt-1">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email</label>
              <input
                {...register('email', {
                  required: 'Email obligatorio',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                })}
                className="input-field"
                placeholder="correo@ejemplo.cl"
              />
              {errors.email && <p className="text-xs text-danger-600 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Contraseña obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
                className="input-field"
                placeholder="••••••"
              />
              {errors.password && <p className="text-xs text-danger-600 mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Teléfono (opcional)</label>
            <input {...register('phone')} className="input-field" placeholder="+56 9 ..." />
          </div>

          {/* Campos condicionales por rol */}
          {(isBeneficiario || isOrganizacion) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">RUT</label>
                <input
                  {...register('rut', {
                    required: 'RUT obligatorio',
                    validate: (v) => isValidRut(v) || 'RUT inválido',
                  })}
                  className="input-field"
                  placeholder="12.345.678-9"
                />
                {errors.rut && <p className="text-xs text-danger-600 mt-1">{errors.rut.message}</p>}
              </div>
              <div>
                <label className="label">Región</label>
                <select {...register('regionId', { required: 'Región obligatoria' })} className="input-field">
                  <option value="">Selecciona...</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre ?? r.name}</option>
                  ))}
                </select>
                {errors.regionId && <p className="text-xs text-danger-600 mt-1">{errors.regionId.message}</p>}
              </div>
              <div>
                <label className="label">Comuna</label>
                <select {...register('comunaId', { required: 'Comuna obligatoria' })} className="input-field" disabled={!regionId}>
                  <option value="">Selecciona...</option>
                  {comunas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre ?? c.name}</option>
                  ))}
                </select>
                {errors.comunaId && <p className="text-xs text-danger-600 mt-1">{errors.comunaId.message}</p>}
              </div>
              {isBeneficiario && (
                <div>
                  <label className="label">Dirección de entrega</label>
                  <input {...register('direccionEntrega', { required: 'Dirección obligatoria' })} className="input-field" placeholder="Calle, número, comuna" />
                  {errors.direccionEntrega && <p className="text-xs text-danger-600 mt-1">{errors.direccionEntrega.message}</p>}
                </div>
              )}
            </div>
          )}

          {isOrganizacion && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Razón social</label>
                <input {...register('razonSocial', { required: 'Razón social obligatoria', maxLength: { value: 200, message: 'Máx 200' } })} className="input-field" />
                {errors.razonSocial && <p className="text-xs text-danger-600 mt-1">{errors.razonSocial.message}</p>}
              </div>
              <div>
                <label className="label">Giro (opcional)</label>
                <input {...register('giro')} className="input-field" />
              </div>
              <div>
                <label className="label">Dirección legal (opcional)</label>
                <input {...register('direccionLegal')} className="input-field" />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary text-sm">
              {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [editEmail, setEditEmail] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user.name ?? '',
      apellido: user.apellido ?? '',
      email: user.email ?? '',
      roleId: user.role?.id ?? '',
      status: user.status ?? 1,
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => usersApi.getRoles(),
    select: (r) => r.data ?? [],
  });

  const mutation = useMutation({
    mutationFn: (form) => usersApi.updateUser(user.id, {
      name: form.name,
      apellido: form.apellido,
      email: form.email,
      roleId: Number(form.roleId),
      status: Number(form.status),
    }),
    onSuccess: () => { toast.success('Usuario actualizado'); onSaved(); onClose(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Editar usuario</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nombre</label>
              <input
                {...register('name', {
                  required: 'Nombre obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$/, message: 'Solo letras, sin espacios' },
                })}
                className="input-field"
              />
              {errors.name && <p className="text-xs text-danger-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Apellido</label>
              <input
                {...register('apellido', {
                  required: 'Apellido obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+$/, message: 'Solo letras, sin espacios' },
                })}
                className="input-field"
              />
              {errors.apellido && <p className="text-xs text-danger-600 mt-1">{errors.apellido.message}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="label mb-0">Correo</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={editEmail} onChange={(e) => setEditEmail(e.target.checked)} className="h-3.5 w-3.5 accent-primary-600" />
                Habilitar edición de correo
              </label>
            </div>
            <input
              {...register('email', {
                required: 'Correo obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
              })}
              readOnly={!editEmail}
              className={`input-field mt-1.5 ${!editEmail ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            />
            {errors.email && <p className="text-xs text-danger-600 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Rol</label>
              <select {...register('roleId', { required: 'Rol obligatorio' })} className="input-field">
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name?.replace('ROLE_', '')}</option>
                ))}
              </select>
              {errors.roleId && <p className="text-xs text-danger-600 mt-1">{errors.roleId.message}</p>}
            </div>
            <div>
              <label className="label">Estado</label>
              <select {...register('status')} className="input-field">
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary text-sm">
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll(),
    select: (r) => r.data ?? [],
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => usersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title mb-1">Gestión de Usuarios</h1>
          <p className="text-gray-500">{users.length} usuarios registrados</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <PlusIcon className="w-4 h-4" /> Agregar usuario
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="input-field pl-9"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Cargando usuarios..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No se encontraron usuarios" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Correo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{[u.name, u.apellido].filter(Boolean).join(' ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="badge-info">{u.role?.name ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.status === 1 ? 'badge-success' : 'badge-danger'}>
                        {u.status === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            const accion = u.status === 1 ? 'desactivar' : 'activar';
                            if (window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} al usuario ${u.email}?`))
                              statusMutation.mutate({ id: u.id, status: u.status === 1 ? 0 : 1 });
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            u.status === 1
                              ? 'bg-red-50 text-danger-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {u.status === 1 ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => queryClient.invalidateQueries(['admin-users'])}
        />
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => queryClient.invalidateQueries(['admin-users'])}
        />
      )}
    </div>
  );
}
