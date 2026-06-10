import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATES = [
  { key: 'INGRESADA', label: 'Ingresada' },
  { key: 'EN_VALIDACION_TRANSFERENCIA', label: 'Validando pago' },
  { key: 'EN_PREPARACION', label: 'En preparación' },
  { key: 'ASIGNADA_ENVIO', label: 'Asignada envío' },
  { key: 'EN_CAMINO', label: 'En camino' },
  { key: 'PENDIENTE_CONFIRMACION', label: 'Pendiente confirmación' },
  { key: 'ENTREGADA', label: 'Entregada' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getDonationById(id),
    select: (r) => r.data,
    refetchInterval: 30000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['order-history', id],
    queryFn: () => ordersApi.getHistory(id),
    select: (r) => r.data ?? [],
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner text="Cargando seguimiento..." />;
  if (isError) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="text-center py-20 text-gray-500">
        {is404 ? 'Orden no encontrada.' : 'No se pudo cargar la orden. Intenta recargar la página.'}
      </div>
    );
  }
  if (!order) return <div className="text-center py-20 text-gray-400">Orden no encontrada</div>;

  const currentIdx = STATES.findIndex((s) => s.key === (order.status ?? order.estado));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title mb-1">Seguimiento de donación</h1>
          <p className="text-gray-500">Orden #{order.id}</p>
        </div>
        <StatusBadge status={order.status ?? order.estado} />
      </div>

      {/* Timeline */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 mb-6">Estado actual</h3>
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="space-y-6">
            {STATES.map((state, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div key={state.key} className="relative flex items-start gap-4 pl-10">
                  <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-primary-600 border-primary-600'
                      : 'bg-white border-gray-300'
                  } ${current ? 'ring-4 ring-primary-100' : ''}`}>
                    {done ? (
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    ) : (
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                  <div className={`pb-1 ${current ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
                    <p className={`font-medium text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {state.label}
                      {current && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">Actual</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History log */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Historial de cambios</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={h.estadoNuevo ?? h.status} />
                    {h.changedAt && (
                      <span className="text-gray-400">
                        {format(new Date(h.changedAt ?? h.fechaCambio), "d MMM, HH:mm", { locale: es })}
                      </span>
                    )}
                  </div>
                  {h.comentario && (
                    <p className="text-gray-500 mt-0.5">{h.comentario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
