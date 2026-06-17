import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import {
  TruckIcon,
  CameraIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
  MapIcon,
  MapPinIcon,
  ArrowLeftIcon,
  UserIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

// Link Google Maps multi-parada con las direcciones de las órdenes (dirección + comuna).
function mapsLink(orders) {
  const addrs = (orders ?? [])
    .map((o) => [o.beneficiaryDireccion, o.beneficiaryComuna].filter(Boolean).join(', '))
    .filter((a) => a && !a.includes('Pendiente'));
  if (addrs.length === 0) return null;
  const enc = addrs.map(encodeURIComponent);
  const destination = enc[enc.length - 1];
  const waypoints = enc.slice(0, -1).join('|');
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  if (waypoints) url += `&waypoints=${waypoints}`;
  return url;
}

const estadoOf = (o) => o.estado ?? o.status;
const routeLabel = (key) => (key === 'sin-ruta' ? 'Sin ruta' : `Ruta ${String(key).slice(0, 8)}`);
// Nombre persistido de la ruta (propagado desde shipping); fallback al label por UUID para órdenes legacy.
const routeNameOf = (key, orders) => orders?.[0]?.routeName || routeLabel(key);

export default function DeliveryManagementPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState({});
  const [selectedRoute, setSelectedRoute] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'deliveries', isAdmin ? 'all' : user?.id],
    queryFn: () => ordersApi.getDeliveries(),
    select: (r) => r.data ?? [],
    enabled: !!user,
  });

  const inPreparation = orders.filter((o) => estadoOf(o) === 'EN_PREPARACION');

  // Agrupar entregas por ruta. Las EN_PREPARACION aún no tienen ruta (se asignan en /admin/routes),
  // así que se excluyen del agrupado y solo alimentan el aviso "en preparación".
  const groups = useMemo(() => {
    const m = new Map();
    orders
      .filter((o) => estadoOf(o) !== 'EN_PREPARACION')
      .forEach((o) => {
        const key = o.routeId || 'sin-ruta';
        if (!m.has(key)) m.set(key, []);
        m.get(key).push(o);
      });
    return m;
  }, [orders]);

  const setFile = (orderId, kind, file) =>
    setFiles((prev) => ({ ...prev, [orderId]: { ...prev[orderId], [kind]: file } }));
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['orders'] });

  const uploadMutation = useMutation({
    mutationFn: ({ id, photo, document }) => ordersApi.uploadDeliveryProof(id, photo, document),
    onSuccess: (_, { id }) => {
      toast.success(`Entrega registrada — orden #${id} (en revisión)`);
      setFiles((prev) => ({ ...prev, [id]: {} }));
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => ordersApi.confirmDelivery(id, user.id),
    onSuccess: (_, id) => { toast.success(`Entrega de la orden #${id} confirmada`); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const startRouteMutation = useMutation({
    mutationFn: async (groupOrders) => {
      const toStart = groupOrders.filter((o) => estadoOf(o) === 'ASIGNADA_ENVIO');
      const res = await Promise.allSettled(toStart.map((o) => ordersApi.markInTransit(o.id, user.id)));
      const failed = res.filter((r) => r.status === 'rejected').length;
      if (failed > 0) throw new Error(`${failed} entrega(s) no se pudieron iniciar`);
      return toStart.length;
    },
    onSuccess: (n) => { toast.success(`Ruta comenzada — ${n} entrega(s) en camino`); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingSpinner text="Cargando entregas..." />;

  const BeneficiaryInfo = ({ order }) => {
    const nombre = [order.beneficiaryName, order.beneficiaryApellido].filter(Boolean).join(' ') || '—';
    const dir = [order.beneficiaryDireccion, order.beneficiaryComuna, order.beneficiaryRegion].filter(Boolean).join(', ');
    return (
      <div className="text-sm text-gray-600 space-y-0.5">
        <p className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-gray-400" /> <span className="font-medium text-gray-800">{nombre}</span></p>
        {dir && <p className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4 text-gray-400" /> {dir}</p>}
      </div>
    );
  };

  const OrderKits = ({ order }) => (
    (order.items ?? []).length > 0 && (
      <p className="text-xs text-gray-500 mt-1 flex items-start gap-1.5">
        <CubeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>{order.items.map((it) => `${it.kitNameSnapshot ?? `Kit #${it.kitId}`} ×${it.quantity}`).join(' · ')}</span>
      </p>
    )
  );

  // ───────────────── DETALLE DE RUTA ─────────────────
  if (selectedRoute) {
    const groupOrders = groups.get(selectedRoute) ?? [];
    const link = mapsLink(groupOrders);
    const hasAssigned = groupOrders.some((o) => estadoOf(o) === 'ASIGNADA_ENVIO');

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => setSelectedRoute(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeftIcon className="w-4 h-4" /> Volver a rutas
        </button>

        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div>
            <h1 className="section-title mb-1">{routeNameOf(selectedRoute, groupOrders)}</h1>
            <p className="text-gray-500 text-sm">{groupOrders.length} entrega(s)</p>
          </div>
          <div className="flex gap-2">
            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="btn-secondary text-sm inline-flex items-center gap-1.5">
                <MapIcon className="w-4 h-4" /> Ver en Google Maps
              </a>
            )}
            {hasAssigned && (
              <button
                onClick={() => startRouteMutation.mutate(groupOrders)}
                disabled={startRouteMutation.isPending}
                className="btn-primary text-sm inline-flex items-center gap-1.5"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {startRouteMutation.isPending ? 'Comenzando...' : 'Comenzar ruta'}
              </button>
            )}
          </div>
        </div>

        {groupOrders.length === 0 ? (
          <EmptyState icon={CheckBadgeIcon} title="Ruta sin entregas pendientes" />
        ) : (
          <div className="space-y-4">
            {groupOrders.map((order) => {
              const estado = estadoOf(order);
              const selected = files[order.id] ?? {};
              return (
                <div key={order.id} className="card">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Link to={`/order/${order.id}`} className="font-semibold text-gray-900 hover:text-primary-700">Orden #{order.id}</Link>
                    <StatusBadge status={estado} />
                  </div>
                  <BeneficiaryInfo order={order} />
                  <OrderKits order={order} />

                  {/* Acción según estado */}
                  {estado === 'ASIGNADA_ENVIO' && (
                    <p className="text-xs text-blue-600 mt-3">Usa "Comenzar ruta" para iniciar el viaje de todas las entregas.</p>
                  )}

                  {estado === 'EN_CAMINO' && (
                    <div className="mt-4">
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-primary-400 text-sm">
                          <CameraIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="truncate text-gray-600">{selected.photo ? selected.photo.name : 'Foto de entrega (obligatoria)'}</span>
                          <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={(e) => setFile(order.id, 'photo', e.target.files[0])} />
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-primary-400 text-sm">
                          <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="truncate text-gray-600">{selected.document ? selected.document.name : 'Documento firmado (opcional)'}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFile(order.id, 'document', e.target.files[0])} />
                        </label>
                      </div>
                      <button
                        onClick={() => uploadMutation.mutate({ id: order.id, photo: selected.photo, document: selected.document })}
                        disabled={!selected.photo || uploadMutation.isPending}
                        className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                      >
                        {uploadMutation.isPending ? 'Subiendo...' : 'Marcar entregado →'}
                      </button>
                    </div>
                  )}

                  {estado === 'PENDIENTE_CONFIRMACION' && (
                    isAdmin ? (
                      <button
                        onClick={() => confirmMutation.mutate(order.id)}
                        disabled={confirmMutation.isPending}
                        className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
                      >
                        <CheckBadgeIcon className="w-4 h-4" />
                        {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar entrega'}
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400 mt-3">En revisión del administrador</p>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ───────────────── LISTA DE RUTAS ─────────────────
  const routeKeys = [...groups.keys()];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">{isAdmin ? 'Gestión de Entregas' : 'Mis Entregas'}</h1>
        <p className="text-gray-500">
          {isAdmin
            ? 'Entregas agrupadas por ruta. Crea rutas y confirma las entregas con evidencia.'
            : 'Tus rutas asignadas: comienza la ruta y registra cada entrega con su comprobante.'}
        </p>
      </div>

      {isAdmin && inPreparation.length > 0 && (
        <div className="card mb-8 flex items-center justify-between gap-4 flex-wrap bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <MapIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-primary-700">
              Hay <strong>{inPreparation.length}</strong> entrega(s) en preparación. Asígnalas creando una ruta.
            </p>
          </div>
          <Link to="/admin/routes" className="btn-primary text-sm">Crear ruta de entrega →</Link>
        </div>
      )}

      {routeKeys.length === 0 ? (
        <EmptyState icon={TruckIcon} title="No hay entregas asignadas"
          description={isAdmin ? 'Crea una ruta para asignar entregas.' : 'Cuando te asignen una ruta aparecerá aquí.'} />
      ) : (
        <div className="space-y-4">
          {routeKeys.map((key) => {
            const g = groups.get(key);
            const link = mapsLink(g);
            const hasAssigned = g.some((o) => estadoOf(o) === 'ASIGNADA_ENVIO');
            const counts = {
              asignadas: g.filter((o) => estadoOf(o) === 'ASIGNADA_ENVIO').length,
              camino: g.filter((o) => estadoOf(o) === 'EN_CAMINO').length,
              revision: g.filter((o) => estadoOf(o) === 'PENDIENTE_CONFIRMACION').length,
            };
            return (
              <div key={key} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <button onClick={() => setSelectedRoute(key)} className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="w-5 h-5 text-primary-600" />
                      <span className="font-semibold text-gray-900">{routeNameOf(key, g)}</span>
                      <span className="text-sm text-gray-500">· {g.length} entrega(s)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {counts.asignadas > 0 && `${counts.asignadas} por iniciar · `}
                      {counts.camino > 0 && `${counts.camino} en camino · `}
                      {counts.revision > 0 && `${counts.revision} en revisión`}
                      {counts.asignadas === 0 && counts.camino === 0 && counts.revision === 0 && 'Sin pendientes'}
                    </p>
                  </button>
                  <div className="flex gap-2 flex-wrap">
                    {link && (
                      <a href={link} target="_blank" rel="noreferrer" className="btn-secondary text-sm inline-flex items-center gap-1.5">
                        <MapIcon className="w-4 h-4" /> Maps
                      </a>
                    )}
                    {hasAssigned && (
                      <button
                        onClick={() => startRouteMutation.mutate(g)}
                        disabled={startRouteMutation.isPending}
                        className="btn-primary text-sm inline-flex items-center gap-1.5"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        {startRouteMutation.isPending ? '...' : 'Comenzar ruta'}
                      </button>
                    )}
                    <button onClick={() => setSelectedRoute(key)} className="btn-ghost text-sm">Ver detalle →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
