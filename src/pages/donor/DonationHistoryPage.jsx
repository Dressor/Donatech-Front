import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DonationHistoryPage() {
  const { user } = useAuth();

  const { data: donations = [], isLoading, isError } = useQuery({
    queryKey: ['donations', user?.email],
    queryFn: () => ordersApi.getDonationsByDonor(user.email),
    // Pendientes (INGRESADA, sin comprobante) primero; luego por fecha desc.
    select: (r) => {
      const list = r.data ?? [];
      const fecha = (d) => new Date(d.fechaCreacion ?? d.orderDate ?? 0).getTime();
      const esPendiente = (d) => (d.estadoPago ?? d.estado) === 'INGRESADA';
      return [...list].sort((a, b) => {
        if (esPendiente(a) !== esPendiente(b)) return esPendiente(a) ? -1 : 1;
        return fecha(b) - fecha(a);
      });
    },
    enabled: !!user?.email,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Mis donaciones</h1>
        <p className="text-gray-500">Historial completo de todas tus contribuciones</p>
      </div>

      {isError ? (
        <div className="text-center py-12 text-red-600">
          No se pudieron cargar las donaciones. Intenta recargar la página.
        </div>
      ) : isLoading ? (
        <LoadingSpinner text="Cargando donaciones..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon={HeartIcon}
          title="Aún no has realizado donaciones"
          description="Explora las campañas activas y ayuda a una familia hoy."
          action={<Link to="/campaigns" className="btn-primary">Ver campañas</Link>}
        />
      ) : (
        <div className="space-y-4">
          {donations.map((d) => {
            const nOrders = d.orders?.length ?? 0;
            return (
              <Link key={d.id} to={`/donation/${d.id}`} className="card-hover flex items-start gap-4 no-underline">
                <div className="w-12 h-12 rounded-xl bg-gradient-blue flex-shrink-0 flex items-center justify-center">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Donación #{d.id}
                        {d.activa && <span className="ml-2 text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Activa</span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        {nOrders} {nOrders === 1 ? 'campaña' : 'campañas'}
                      </p>
                    </div>
                    <StatusBadge status={d.estadoPago ?? d.estado} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {d.fechaCreacion
                        ? format(new Date(d.fechaCreacion), "d MMM yyyy, HH:mm", { locale: es })
                        : 'Fecha desconocida'}
                    </span>
                    <span className="font-medium text-primary-600">
                      ${(d.total ?? 0).toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                  {(d.estadoPago ?? d.estado) === 'INGRESADA' && (
                    <p className="text-xs text-amber-600 font-medium mt-1.5">
                      Pendiente: sube tu comprobante para continuar
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
