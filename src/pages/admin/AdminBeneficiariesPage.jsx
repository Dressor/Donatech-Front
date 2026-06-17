import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '');

export default function AdminBeneficiariesPage({ embedded = false }) {
  const [tab, setTab] = useState('beneficiarios');
  const [selectedId, setSelectedId] = useState(null);
  const [motivo, setMotivo] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  /* ── Queries ── */
  const { data: pendingBeneficiaries = [], isLoading: loadingBen } = useQuery({
    queryKey: ['pending-beneficiaries'],
    queryFn: () => usersApi.getBeneficiariesByStatus('PENDIENTE'),
    select: (r) => (r.data ?? []).filter((b) => b.user?.role?.name === 'ROLE_BENEFICIARIO'),
  });

  const { data: pendingCompanies = [], isLoading: loadingOrg } = useQuery({
    queryKey: ['pending-companies'],
    queryFn: () => usersApi.getCompaniesByStatus('PENDIENTE'),
    select: (r) => (r.data ?? []).filter((c) => c.user?.role?.name === 'ROLE_ORGANIZACION'),
  });

  // Historial: cuentas ya validadas (aprobadas + rechazadas), de la más reciente a la más antigua.
  const { data: resolvedAccounts = [] } = useQuery({
    queryKey: ['accounts-history'],
    queryFn: async () => {
      const [v, r] = await Promise.all([
        usersApi.getBeneficiariesByStatus('VERIFICADO'),
        usersApi.getBeneficiariesByStatus('RECHAZADO'),
      ]);
      return [...(v.data ?? []), ...(r.data ?? [])].sort(
        (a, b) => new Date(b.fechaVerificacion ?? 0) - new Date(a.fechaVerificacion ?? 0)
      );
    },
  });

  /* ── Mutaciones beneficiarios ── */
  const approveBenMutation = useMutation({
    mutationFn: (id) => usersApi.verifyBeneficiary(id, { estado: 'VERIFICADO', verificadorId: user?.id }),
    onSuccess: () => {
      toast.success('Beneficiario aprobado');
      queryClient.invalidateQueries(['pending-beneficiaries']);
      queryClient.invalidateQueries(['pending-companies']);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectBenMutation = useMutation({
    mutationFn: ({ id, motivo }) => usersApi.verifyBeneficiary(id, { estado: 'RECHAZADO', verificadorId: user?.id, motivoRechazo: motivo }),
    onSuccess: () => {
      toast.success('Beneficiario rechazado');
      queryClient.invalidateQueries(['pending-beneficiaries']);
      queryClient.invalidateQueries(['pending-companies']);
      setSelectedId(null);
      setMotivo('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  /* ── Mutaciones empresas ── */
  const approveOrgMutation = useMutation({
    mutationFn: (id) => usersApi.verifyCompany(id, { estado: 'VERIFICADO', verificadorId: user?.id }),
    onSuccess: () => {
      toast.success('Empresa aprobada');
      queryClient.invalidateQueries(['pending-companies']);
      queryClient.invalidateQueries(['pending-beneficiaries']);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectOrgMutation = useMutation({
    mutationFn: ({ id, motivo }) => usersApi.verifyCompany(id, { estado: 'RECHAZADO', verificadorId: user?.id, motivoRechazo: motivo }),
    onSuccess: () => {
      toast.success('Empresa rechazada');
      queryClient.invalidateQueries(['pending-companies']);
      queryClient.invalidateQueries(['pending-beneficiaries']);
      setSelectedId(null);
      setMotivo('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  /* ── Helpers ── */
  const openReject = (id) => {
    setSelectedId(selectedId === id ? null : id);
    setMotivo('');
  };

  /* ── Render ── */
  return (
    <div className={embedded ? '' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'}>
      {!embedded && (
        <div className="mb-8">
          <h1 className="section-title mb-1">Validación de Cuentas</h1>
          <p className="text-gray-500">
            Aprueba o rechaza las solicitudes de registro de beneficiarios y empresas
          </p>
        </div>
      )}

      {/* Pestañas */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => { setTab('beneficiarios'); setSelectedId(null); setMotivo(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'beneficiarios'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          Beneficiarios
          {pendingBeneficiaries.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingBeneficiaries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => { setTab('empresas'); setSelectedId(null); setMotivo(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'empresas'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BuildingOfficeIcon className="w-4 h-4" />
          Empresas / Organizaciones
          {pendingCompanies.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingCompanies.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab: Beneficiarios ── */}
      {tab === 'beneficiarios' && (
        loadingBen ? (
          <LoadingSpinner text="Cargando beneficiarios pendientes..." />
        ) : pendingBeneficiaries.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="No hay beneficiarios pendientes"
            description="Todas las solicitudes de beneficiarios han sido revisadas."
          />
        ) : (
          <div className="space-y-4">
            {pendingBeneficiaries.map((b) => (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {b.name ?? b.user?.name ?? '—'}
                    </h3>
                    <p className="text-sm text-gray-500">{b.email ?? b.user?.email ?? '—'}</p>

                    {b.rut && (
                      <p className="text-xs text-gray-400 mt-1">RUT: {b.rut}</p>
                    )}
                    {b.direccionEntrega && (
                      <p className="text-xs text-gray-400">Dirección: {b.direccionEntrega}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {b.region?.nombre && (
                        <span className="badge-info">{b.region.nombre}</span>
                      )}
                      {b.comuna?.nombre && (
                        <span className="badge-info">{b.comuna.nombre}</span>
                      )}
                    </div>

                    {b.observaciones && (
                      <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3 leading-relaxed">
                        {b.observaciones}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveBenMutation.mutate(b.id)}
                      disabled={approveBenMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => openReject(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-danger-700 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>

                {selectedId === b.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <label className="label">Motivo del rechazo</label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      rows={2}
                      placeholder="Explica el motivo del rechazo para informar al solicitante..."
                      className="input-field resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectBenMutation.mutate({ id: b.id, motivo })}
                        disabled={rejectBenMutation.isPending}
                        className="btn-danger text-sm px-4 py-2"
                      >
                        Confirmar rechazo
                      </button>
                      <button
                        onClick={() => { setSelectedId(null); setMotivo(''); }}
                        className="btn-outline text-sm px-4 py-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Tab: Empresas ── */}
      {tab === 'empresas' && (
        loadingOrg ? (
          <LoadingSpinner text="Cargando empresas pendientes..." />
        ) : pendingCompanies.length === 0 ? (
          <EmptyState
            icon={BuildingOfficeIcon}
            title="No hay empresas pendientes"
            description="Todas las solicitudes de empresas han sido revisadas."
          />
        ) : (
          <div className="space-y-4">
            {pendingCompanies.map((c) => (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {c.name ?? c.razonSocial ?? '—'}
                    </h3>
                    <p className="text-sm text-gray-500">{c.email ?? c.user?.email ?? '—'}</p>

                    {c.rut && (
                      <p className="text-xs text-gray-400 mt-1">RUT: {c.rut}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {c.region?.nombre && (
                        <span className="badge-info">{c.region.nombre}</span>
                      )}
                      {c.comuna?.nombre && (
                        <span className="badge-info">{c.comuna.nombre}</span>
                      )}
                    </div>

                    {/* Enlace a la Patente Municipal */}
                    {c.patenteUrl ? (
                      <a
                        href={c.patenteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline mt-3"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        Ver Patente Municipal
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 mt-3 italic">
                        Sin documento adjunto
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveOrgMutation.mutate(c.id)}
                      disabled={approveOrgMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => openReject(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-danger-700 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>

                {selectedId === c.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <label className="label">Motivo del rechazo</label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      rows={2}
                      placeholder="Ej: La Patente Municipal está vencida o el RUT no coincide..."
                      className="input-field resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => rejectOrgMutation.mutate({ id: c.id, motivo })}
                        disabled={rejectOrgMutation.isPending}
                        className="btn-danger text-sm px-4 py-2"
                      >
                        Confirmar rechazo
                      </button>
                      <button
                        onClick={() => { setSelectedId(null); setMotivo(''); }}
                        className="btn-outline text-sm px-4 py-2"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Historial de validaciones de cuentas (último a primero) ── */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-3">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Historial de validaciones</h2>
          <span className="text-xs text-gray-400">({resolvedAccounts.length})</span>
        </div>
        {resolvedAccounts.length === 0 ? (
          <p className="text-sm text-gray-400">Aún no hay cuentas validadas.</p>
        ) : (
          <div className="space-y-2">
            {resolvedAccounts.map((a) => (
              <div key={`${a.id}-${a.estadoVerificacion}`} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {a.name ?? a.user?.name ?? a.razonSocial ?? a.user?.email ?? '—'}
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      {a.user?.role?.name === 'ROLE_ORGANIZACION' ? 'Empresa' : 'Beneficiario'}
                    </span>
                  </p>
                  {a.motivoRechazo && <p className="text-xs text-gray-500 mt-0.5">Motivo: {a.motivoRechazo}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={a.estadoVerificacion} />
                  <p className="text-xs text-gray-400 mt-1">{fmtDate(a.fechaVerificacion)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
