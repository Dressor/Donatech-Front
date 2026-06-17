import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportsApi, ordersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import TransferDetailModal from '../../components/ui/TransferDetailModal';
import AdminBeneficiariesPage from './AdminBeneficiariesPage';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '');
const isOpen = (t) => t.estado === 'PENDIENTE' || t.estado === 'EN_PROGRESO';
const isResolved = (t) => t.estado === 'RESUELTO' || t.estado === 'CERRADO';
const byResolutionDesc = (a, b) => new Date(b.fechaResolucion ?? 0) - new Date(a.fechaResolucion ?? 0);

const SUBTABS = [
  { key: 'cuentas', label: 'Cuentas', icon: UserGroupIcon },
  { key: 'campanas', label: 'Campañas', icon: MegaphoneIcon },
  { key: 'ordenes', label: 'Ordenes', icon: ClipboardDocumentCheckIcon },
];

/* ── Tarjeta de ticket (pendiente, abre modal) ── */
function TicketCard({ ticket, onClick }) {
  return (
    <div onClick={onClick} className="card cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-semibold text-gray-900">Ticket #{ticket.id}</span>
            <StatusBadge status={ticket.estado} />
          </div>
          <p className="text-sm text-gray-600 truncate">{ticket.descripcion}</p>
          {ticket.donationId && <p className="text-xs text-gray-400 mt-1">Donación #{ticket.donationId}</p>}
        </div>
        <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-primary-500 flex-shrink-0" />
      </div>
    </div>
  );
}

/* ── Línea de historial de tickets resueltos ── */
function HistoryTicketRow({ ticket }) {
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          Ticket #{ticket.id}
          {ticket.donationId && <span className="text-xs font-normal text-gray-400 ml-2">Donación #{ticket.donationId}</span>}
        </p>
        {ticket.respuesta && <p className="text-xs text-gray-500 mt-0.5 truncate">{ticket.respuesta}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <StatusBadge status={ticket.estado} />
        <p className="text-xs text-gray-400 mt-1">{fmtDate(ticket.fechaResolucion)}</p>
      </div>
    </div>
  );
}

function HistorySection({ count, children, empty }) {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="w-4 h-4 text-gray-400" />
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Historial de validaciones</h2>
        <span className="text-xs text-gray-400">({count})</span>
      </div>
      {count === 0 ? <p className="text-sm text-gray-400">{empty}</p> : <div className="space-y-2">{children}</div>}
    </div>
  );
}

/* ── Panel: validación de campañas ── */
function CampaignsPanel() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', 'campanas'],
    queryFn: () => supportsApi.getByType('VALIDACION_CAMPAÑA'),
    select: (r) => r.data ?? [],
  });

  const pending = tickets.filter(isOpen);
  const history = tickets.filter(isResolved).sort(byResolutionDesc);
  const onSuccess = () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); setSelected(null); };

  return (
    <div>
      <h1 className="section-title mb-1">Validación de campañas</h1>
      <p className="text-gray-500 mb-6">Aprueba o rechaza las campañas creadas por beneficiarios y organizaciones.</p>

      {isLoading ? (
        <LoadingSpinner text="Cargando campañas..." />
      ) : pending.length === 0 ? (
        <EmptyState icon={MegaphoneIcon} title="No hay campañas por validar" description="Todo está al día." />
      ) : (
        <div className="space-y-3">
          {pending.map((t) => <TicketCard key={t.id} ticket={t} onClick={() => setSelected(t)} />)}
        </div>
      )}

      <HistorySection count={history.length} empty="Aún no hay campañas validadas.">
        {history.map((t) => <HistoryTicketRow key={t.id} ticket={t} />)}
      </HistorySection>

      {selected && <TransferDetailModal ticket={selected} onClose={() => setSelected(null)} onSuccess={onSuccess} />}
    </div>
  );
}

/* ── Panel: validación de órdenes (transferencias + entregas) ── */
function OrdersPanel() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [selected, setSelected] = useState(null);

  const { data: transferTickets = [], isLoading: loadingTransfers } = useQuery({
    queryKey: ['tickets', 'transferencias'],
    queryFn: () => supportsApi.getByType('VALIDACION_TRANSFERENCIA'),
    select: (r) => r.data ?? [],
  });

  const { data: deliveries = [], isLoading: loadingDeliveries } = useQuery({
    queryKey: ['orders', 'deliveries', 'validations'],
    queryFn: () => ordersApi.getDeliveries(),
    select: (r) => r.data ?? [],
  });

  // Historial de entregas confirmadas (todas las órdenes ENTREGADA, más recientes primero).
  const { data: deliveredHistory = [] } = useQuery({
    queryKey: ['orders', 'delivered-history'],
    queryFn: () => ordersApi.getAll(),
    select: (r) =>
      (r.data ?? [])
        .filter((o) => (o.estado ?? o.status) === 'ENTREGADA')
        .sort((a, b) => new Date(b.deliveryConfirmedAt ?? 0) - new Date(a.deliveryConfirmedAt ?? 0)),
  });

  const pendingTransfers = transferTickets.filter(isOpen);
  const transferHistory = transferTickets.filter(isResolved).sort(byResolutionDesc);
  const pendingDeliveries = deliveries.filter((o) => (o.estado ?? o.status) === 'PENDIENTE_CONFIRMACION');

  const confirmMutation = useMutation({
    mutationFn: (id) => ordersApi.confirmDelivery(id, user.id),
    onSuccess: (_, id) => {
      toast.success(`Entrega de la orden #${id} confirmada`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const onSuccess = () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); setSelected(null); };

  const loading = loadingTransfers || loadingDeliveries;

  return (
    <div>
      <h1 className="section-title mb-1">Validación de órdenes</h1>
      <p className="text-gray-500 mb-6">Aprueba transferencias de donaciones y confirma las entregas realizadas.</p>

      {loading ? (
        <LoadingSpinner text="Cargando órdenes..." />
      ) : (
        <div className="space-y-8">
          {/* Transferencias por validar */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Transferencias por validar ({pendingTransfers.length})
            </h3>
            {pendingTransfers.length === 0 ? (
              <p className="text-sm text-gray-400">No hay transferencias pendientes.</p>
            ) : (
              <div className="space-y-3">
                {pendingTransfers.map((t) => <TicketCard key={t.id} ticket={t} onClick={() => setSelected(t)} />)}
              </div>
            )}
          </section>

          {/* Entregas por confirmar */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Entregas por confirmar ({pendingDeliveries.length})
            </h3>
            {pendingDeliveries.length === 0 ? (
              <p className="text-sm text-gray-400">No hay entregas pendientes de confirmación.</p>
            ) : (
              <div className="space-y-3">
                {pendingDeliveries.map((o) => (
                  <div key={o.id} className="card flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/order/${o.id}`} className="font-semibold text-gray-900 hover:text-primary-700">Orden #{o.id}</Link>
                        <StatusBadge status={o.estado ?? o.status} />
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {[o.beneficiaryName, o.beneficiaryApellido].filter(Boolean).join(' ') || o.userEmail}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => confirmMutation.mutate(o.id)}
                        disabled={confirmMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
                      >
                        <CheckBadgeIcon className="w-4 h-4" />
                        {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar entrega'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Historial: transferencias validadas + entregas confirmadas */}
      <HistorySection
        count={transferHistory.length + deliveredHistory.length}
        empty="Aún no hay transferencias ni entregas validadas."
      >
        {transferHistory.map((t) => <HistoryTicketRow key={`t-${t.id}`} ticket={t} />)}
        {deliveredHistory.map((o) => (
          <div key={`o-${o.id}`} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                Orden #{o.id} entregada
                <span className="text-xs font-normal text-gray-400 ml-2">
                  {[o.beneficiaryName, o.beneficiaryApellido].filter(Boolean).join(' ') || o.userEmail}
                </span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <StatusBadge status="ENTREGADA" />
              <p className="text-xs text-gray-400 mt-1">{fmtDate(o.deliveryConfirmedAt)}</p>
            </div>
          </div>
        ))}
      </HistorySection>

      {selected && <TransferDetailModal ticket={selected} onClose={() => setSelected(null)} onSuccess={onSuccess} />}
    </div>
  );
}

export default function ValidationsPage() {
  const [sub, setSub] = useState('cuentas');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Validaciones</h1>
        <p className="text-gray-500">Valida cuentas, campañas y órdenes (transferencias y entregas).</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Submenú vertical */}
        <nav className="md:w-56 flex-shrink-0 flex md:flex-col gap-1">
          {SUBTABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSub(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                sub === key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Contenido del subtab */}
        <div className="flex-1 min-w-0">
          {sub === 'cuentas' && <AdminBeneficiariesPage embedded />}
          {sub === 'campanas' && <CampaignsPanel />}
          {sub === 'ordenes' && <OrdersPanel />}
        </div>
      </div>
    </div>
  );
}
