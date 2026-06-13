import { useState } from 'react';
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
  UserCircleIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

export default function DeliveryManagementPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState({});      // { [orderId]: { photo, document } }
  const [couriers, setCouriers] = useState({}); // { [orderId]: { nombre, contacto } }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', 'deliveries'],
    queryFn: () => ordersApi.getAll(),
    select: (r) => r.data ?? [],
  });

  const byStatus = (s) => orders.filter((o) => (o.estado ?? o.status) === s);
  const inPreparation = byStatus('EN_PREPARACION');
  const assigned = byStatus('ASIGNADA_ENVIO');
  const inTransit = byStatus('EN_CAMINO');
  const pendingConfirmation = byStatus('PENDIENTE_CONFIRMACION');

  const setFile = (orderId, kind, file) =>
    setFiles((prev) => ({ ...prev, [orderId]: { ...prev[orderId], [kind]: file } }));
  const setCourier = (orderId, kind, value) =>
    setCouriers((prev) => ({ ...prev, [orderId]: { ...prev[orderId], [kind]: value } }));

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['orders'] });

  const assignMutation = useMutation({
    mutationFn: ({ id, nombre, contacto }) =>
      ordersApi.assignCourier(id, { transportistaNombre: nombre, transportistaContacto: contacto }, user.id),
    onSuccess: (_, { id }) => {
      toast.success(`Transportista asignado a la orden #${id}`);
      setCouriers((prev) => ({ ...prev, [id]: {} }));
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const transitMutation = useMutation({
    mutationFn: (id) => ordersApi.markInTransit(id, user.id),
    onSuccess: (_, id) => {
      toast.success(`Orden #${id} marcada en camino`);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, photo, document }) => ordersApi.uploadDeliveryProof(id, photo, document),
    onSuccess: (_, { id }) => {
      toast.success(`Evidencia de entrega registrada para la orden #${id}`);
      setFiles((prev) => ({ ...prev, [id]: {} }));
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => ordersApi.confirmDelivery(id, user.id),
    onSuccess: (_, id) => {
      toast.success(`Entrega de la orden #${id} confirmada`);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingSpinner text="Cargando entregas..." />;

  const OrderTitle = ({ order }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Link to={`/donation/${order.id}`} className="font-semibold text-gray-900 hover:text-primary-700">
        Orden #{order.id}
      </Link>
      <StatusBadge status={order.estado ?? order.status} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Gestión de Entregas</h1>
        <p className="text-gray-500">
          Flujo logístico secuencial: asignar transportista → en camino → evidencia de entrega → confirmación.
        </p>
      </div>

      {/* 1. EN_PREPARACION → asignar transportista */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <UserCircleIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-800">
            En preparación — asignar transportista ({inPreparation.length})
          </h2>
        </div>

        {inPreparation.length === 0 ? (
          <EmptyState
            icon={UserCircleIcon}
            title="No hay órdenes en preparación"
            description="Las órdenes aparecerán aquí cuando su transferencia sea aprobada."
          />
        ) : (
          <div className="space-y-4">
            {inPreparation.map((order) => {
              const c = couriers[order.id] ?? {};
              return (
                <div key={order.id} className="card">
                  <div className="mb-4">
                    <OrderTitle order={order} />
                    <p className="text-sm text-gray-500 mt-1">Donante: {order.userEmail}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <input
                      type="text"
                      value={c.nombre ?? ''}
                      onChange={(e) => setCourier(order.id, 'nombre', e.target.value)}
                      placeholder="Nombre del transportista *"
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      value={c.contacto ?? ''}
                      onChange={(e) => setCourier(order.id, 'contacto', e.target.value)}
                      placeholder="Contacto / patente (opcional)"
                      className="input-field text-sm"
                    />
                  </div>

                  <button
                    onClick={() =>
                      assignMutation.mutate({ id: order.id, nombre: c.nombre, contacto: c.contacto })
                    }
                    disabled={!c.nombre?.trim() || assignMutation.isPending}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {assignMutation.isPending ? 'Asignando...' : 'Asignar transportista →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. ASIGNADA_ENVIO → marcar en camino */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">
            Asignadas — marcar en camino ({assigned.length})
          </h2>
        </div>

        {assigned.length === 0 ? (
          <EmptyState
            icon={PaperAirplaneIcon}
            title="No hay órdenes asignadas"
            description="Asigna un transportista para que aparezcan aquí."
          />
        ) : (
          <div className="space-y-4">
            {assigned.map((order) => (
              <div key={order.id} className="card flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <OrderTitle order={order} />
                  <p className="text-sm text-gray-500 mt-1">Donante: {order.userEmail}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    🚚 {order.transportistaNombre}
                    {order.transportistaContacto && (
                      <span className="text-gray-400"> · {order.transportistaContacto}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => transitMutation.mutate(order.id)}
                  disabled={transitMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {transitMutation.isPending ? 'Actualizando...' : 'Marcar en camino'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. EN_CAMINO → subir evidencia de entrega */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <TruckIcon className="w-5 h-5 text-amber-600" />
          <h2 className="font-semibold text-gray-800">
            En camino — subir evidencia de entrega ({inTransit.length})
          </h2>
        </div>

        {inTransit.length === 0 ? (
          <EmptyState
            icon={TruckIcon}
            title="No hay órdenes en camino"
            description="Marca una orden en camino para subir su evidencia de entrega."
          />
        ) : (
          <div className="space-y-4">
            {inTransit.map((order) => {
              const selected = files[order.id] ?? {};
              return (
                <div key={order.id} className="card">
                  <div className="mb-4">
                    <OrderTitle order={order} />
                    <p className="text-sm text-gray-500 mt-1">Donante: {order.userEmail}</p>
                    {order.transportistaNombre && (
                      <p className="text-sm text-gray-700 mt-1">🚚 {order.transportistaNombre}</p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-primary-400 transition-colors text-sm">
                      <CameraIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-600">
                        {selected.photo ? selected.photo.name : 'Foto de entrega (obligatoria)'}
                      </span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFile(order.id, 'photo', e.target.files[0])}
                      />
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-primary-400 transition-colors text-sm">
                      <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-gray-600">
                        {selected.document ? selected.document.name : 'Documento firmado (opcional)'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFile(order.id, 'document', e.target.files[0])}
                      />
                    </label>
                  </div>

                  <button
                    onClick={() =>
                      uploadMutation.mutate({
                        id: order.id,
                        photo: selected.photo,
                        document: selected.document,
                      })
                    }
                    disabled={!selected.photo || uploadMutation.isPending}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? 'Subiendo...' : 'Registrar entrega →'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. PENDIENTE_CONFIRMACION → confirmar (solo admin) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-800">
            Pendientes de confirmación ({pendingConfirmation.length})
          </h2>
        </div>

        {pendingConfirmation.length === 0 ? (
          <EmptyState
            icon={CheckBadgeIcon}
            title="No hay entregas por confirmar"
            description="Cuando se suba evidencia de entrega, las órdenes aparecerán aquí."
          />
        ) : (
          <div className="space-y-4">
            {pendingConfirmation.map((order) => (
              <div key={order.id} className="card flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <OrderTitle order={order} />
                  <p className="text-sm text-gray-500 mt-1">Donante: {order.userEmail}</p>
                  {order.transportistaNombre && (
                    <p className="text-sm text-gray-700 mt-1">🚚 {order.transportistaNombre}</p>
                  )}
                </div>
                {isAdmin ? (
                  <button
                    onClick={() => confirmMutation.mutate(order.id)}
                    disabled={confirmMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <CheckBadgeIcon className="w-4 h-4" />
                    {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar entrega'}
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">
                    Solo un administrador puede confirmar la entrega
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
