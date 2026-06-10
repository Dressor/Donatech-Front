import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportsApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const TICKET_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'VALIDACION_TRANSFERENCIA', label: 'Transferencias' },
  { value: 'VALIDACION_CAMPAÑA', label: 'Campañas' },
  { value: 'OTRO', label: 'Otro' },
];

export default function BackofficePage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDIENTE');
  const [selectedId, setSelectedId] = useState(null);
  const [motivo, setMotivo] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', typeFilter, statusFilter],
    queryFn: () =>
      typeFilter
        ? supportsApi.getByType(typeFilter)
        : statusFilter
        ? supportsApi.getByStatus(statusFilter)
        : supportsApi.getAll(),
    select: (r) => r.data ?? [],
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, tipo }) =>
      tipo === 'VALIDACION_TRANSFERENCIA'
        ? supportsApi.validateTransfer(id, true)
        : supportsApi.validateCampaign(id, true),
    onSuccess: () => {
      toast.success('Aprobado exitosamente');
      queryClient.invalidateQueries(['tickets']);
      setSelectedId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, tipo }) =>
      tipo === 'VALIDACION_TRANSFERENCIA'
        ? supportsApi.validateTransfer(id, false, motivo)
        : supportsApi.validateCampaign(id, false, motivo),
    onSuccess: () => {
      toast.success('Rechazado');
      queryClient.invalidateQueries(['tickets']);
      setSelectedId(null);
      setMotivo('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Backoffice de Validación</h1>
        <p className="text-gray-500">Aprueba o rechaza transferencias y campañas</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">Filtrar por tipo:</span>
        </div>
        {TICKET_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === t.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Estado:</span>
          {['PENDIENTE', 'EN_PROGRESO', 'RESUELTO'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Cargando tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No hay tickets pendientes"
          description="Todo está al día."
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-semibold text-gray-900">Ticket #{ticket.id}</span>
                    <StatusBadge status={ticket.estado} />
                    <span className="badge-info">{ticket.tipo?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600">{ticket.descripcion}</p>
                  {ticket.donationId && (
                    <p className="text-xs text-gray-400 mt-1">Donación: #{ticket.donationId}</p>
                  )}
                </div>

                {ticket.estado === 'PENDIENTE' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveMutation.mutate({ id: ticket.id, tipo: ticket.tipo })}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => setSelectedId(selectedId === ticket.id ? null : ticket.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-danger-700 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>

              {/* Reject form */}
              {selectedId === ticket.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <label className="label">Motivo del rechazo</label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={2}
                    placeholder="Explica el motivo del rechazo..."
                    className="input-field resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectMutation.mutate({ id: ticket.id, tipo: ticket.tipo })}
                      disabled={rejectMutation.isPending}
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
      )}
    </div>
  );
}
