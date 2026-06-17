import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingApi, usersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { MapIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';

const unwrap = (r) => r.data?.data ?? r.data ?? [];

const ROUTE_STATUS = {
  PLANNED: { label: 'Planificada', cls: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'En progreso', cls: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completada', cls: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-100 text-red-700' },
};
const statusBadge = (s) => ROUTE_STATUS[s] ?? { label: s ?? '—', cls: 'bg-gray-100 text-gray-500' };

function mapsLink(shipments) {
  const addrs = (shipments ?? [])
    .map((s) => s.shippingAddress)
    .filter((a) => a && a !== 'Pendiente de asignación');
  if (addrs.length === 0) return null;
  const enc = addrs.map(encodeURIComponent);
  const destination = enc[enc.length - 1];
  const waypoints = enc.slice(0, -1).join('|');
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

export default function RoutesPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState([]); // shipment ids
  const [collaboratorId, setCollaboratorId] = useState('');
  const [origin, setOrigin] = useState('Bodega Central Donatech');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data: pending = [], isLoading: loadingPending } = useQuery({
    queryKey: ['shipments-pending'],
    queryFn: () => shippingApi.getPendingShipments(),
    select: unwrap,
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ['collaborators'],
    queryFn: () => usersApi.getCollaborators(),
    select: (r) => r.data ?? [],
  });

  const { data: routes = [], isLoading: loadingRoutes } = useQuery({
    queryKey: ['routes', statusFilter],
    queryFn: () => shippingApi.getRoutes(statusFilter || undefined),
    select: unwrap,
  });

  // Backend ya entrega newest-first; filtro de fecha (routeDate) se aplica en cliente.
  const visibleRoutes = dateFilter ? routes.filter((rt) => rt.routeDate === dateFilter) : routes;

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const createMutation = useMutation({
    mutationFn: () => {
      const col = collaborators.find((c) => String(c.id) === String(collaboratorId));
      return shippingApi.createRoute({
        companyId: 'DONATECH',
        carrierId: 'LOCAL',
        collaboratorId: Number(collaboratorId),
        collaboratorNombre: col?.name,
        collaboratorEmail: col?.email,
        originAddress: origin,
        shipmentIds: selected,
        optimizeRoute: false,
      });
    },
    onSuccess: () => {
      toast.success('Ruta creada y asignada al colaborador');
      setSelected([]);
      setCollaboratorId('');
      queryClient.invalidateQueries({ queryKey: ['shipments-pending'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const canCreate = selected.length > 0 && collaboratorId && !createMutation.isPending;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Rutas de entrega</h1>
        <p className="text-gray-500">Agrupa entregas pendientes y asígnalas a un colaborador.</p>
      </div>

      {/* Crear ruta */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MapIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Nueva ruta</h2>
        </div>

        {loadingPending ? (
          <LoadingSpinner size="sm" />
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-3">No hay entregas pendientes de asignar.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {pending.map((s) => (
              <label key={s.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} className="mt-1" />
                <div className="text-sm min-w-0">
                  <p className="font-medium text-gray-800">Orden #{s.orderId} — {s.customerName ?? 'Beneficiario'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPinIcon className="w-3.5 h-3.5" /> {s.shippingAddress}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label">Colaborador</label>
            <select value={collaboratorId} onChange={(e) => setCollaboratorId(e.target.value)} className="input-field">
              <option value="">Selecciona un colaborador...</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Dirección de origen</label>
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="input-field" />
          </div>
        </div>

        <button onClick={() => createMutation.mutate()} disabled={!canCreate} className="btn-primary text-sm disabled:opacity-50">
          {createMutation.isPending ? 'Creando...' : `Crear ruta (${selected.length})`}
        </button>
      </div>

      {/* Rutas existentes */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <TruckIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-800">Rutas</h2>
          <span className="text-xs text-gray-400">({visibleRoutes.length})</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field py-1.5 text-sm">
            <option value="">Todos los estados</option>
            {Object.entries(ROUTE_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-field py-1.5 text-sm" />
          {(statusFilter || dateFilter) && (
            <button onClick={() => { setStatusFilter(''); setDateFilter(''); }} className="btn-ghost text-sm">Limpiar</button>
          )}
        </div>
      </div>
      {loadingRoutes ? (
        <LoadingSpinner size="sm" />
      ) : visibleRoutes.length === 0 ? (
        <EmptyState icon={TruckIcon} title="Sin rutas" description="Crea una ruta agrupando entregas pendientes o ajusta los filtros." />
      ) : (
        <div className="space-y-4">
          {visibleRoutes.map((rt) => {
            const link = mapsLink(rt.shipments);
            return (
              <div key={rt.id} className="card">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{rt.name ?? rt.collaboratorNombre ?? 'Ruta'}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(rt.status).cls}`}>
                        {statusBadge(rt.status).label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {rt.collaboratorNombre ?? 'Sin colaborador'} · {(rt.shipments?.length ?? 0)} parada(s) · {rt.routeDate}
                    </p>
                  </div>
                  {link && (
                    <a href={link} target="_blank" rel="noreferrer" className="btn-secondary text-sm flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4" /> Ver en Google Maps
                    </a>
                  )}
                </div>
                {rt.shipments?.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {rt.shipments.map((s) => (
                      <li key={s.id} className="text-xs text-gray-500">
                        Orden #{s.orderId} — {s.customerName ?? '—'} · {s.shippingAddress}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
