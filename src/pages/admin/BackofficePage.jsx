import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supportsApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import TransferDetailModal from '../../components/ui/TransferDetailModal';
import { ShieldCheckIcon, FunnelIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Soporte = tickets creados por personas. Las validaciones automáticas (campaña/transferencia)
// viven en la pestaña "Validaciones".
const VALIDATION_TYPES = ['VALIDACION_CAMPAÑA', 'VALIDACION_TRANSFERENCIA'];
const TICKET_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'INCIDENCIA_ENTREGA', label: 'Incidencias de Entrega' },
  { value: 'DONACION', label: 'Donación' },
  { value: 'PRODUCTO', label: 'Producto' },
  { value: 'USUARIO', label: 'Usuario' },
  { value: 'TECNICO', label: 'Técnico' },
  { value: 'OTRO', label: 'Otro' },
];

export default function BackofficePage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDIENTE');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', 'soporte', typeFilter, statusFilter],
    queryFn: () => (typeFilter ? supportsApi.getByType(typeFilter) : supportsApi.getAll()),
    // Excluir validaciones automáticas y aplicar el filtro de estado en cliente.
    select: (r) =>
      (r.data ?? [])
        .filter((t) => !VALIDATION_TYPES.includes(t.tipo))
        .filter((t) => !statusFilter || t.estado === statusFilter),
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries(['tickets']);
    setSelectedTicket(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Soporte</h1>
        <p className="text-gray-500">Tickets de soporte creados por usuarios</p>
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
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="card cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-150 group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-gray-900">Ticket #{ticket.id}</span>
                    <StatusBadge status={ticket.estado} />
                    <span className="badge-info">{ticket.tipo?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{ticket.descripcion}</p>
                  {ticket.donationId && (
                    <p className="text-xs text-gray-400 mt-1">Donación: #{ticket.donationId}</p>
                  )}
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <TransferDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
