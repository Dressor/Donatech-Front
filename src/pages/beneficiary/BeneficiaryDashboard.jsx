import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { catalogApi, ordersApi } from '../../api';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HeartIcon, PlusCircleIcon, TruckIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

export default function BeneficiaryDashboard() {
  const { user } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['beneficiary-orders'],
    queryFn: () => ordersApi.getAll(),
    select: (r) => r.data?.slice(0, 5) ?? [],
  });

  const { data: campaigns = [], isLoading: campLoading } = useQuery({
    queryKey: ['my-campaigns', user?.id],
    queryFn: () => catalogApi.getCampaignsByBeneficiary(user.id),
    select: (r) => r.data ?? [],
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome */}
      <div className="hero-gradient text-white rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative">
          <HeartIcon className="w-10 h-10 mb-3 text-white/80" />
          <h1 className="text-2xl font-bold mb-1">Bienvenido/a</h1>
          <p className="text-blue-100">{user?.email}</p>
        </div>
      </div>

      {/* My campaign */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MegaphoneIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Mi campaña</h2>
        </div>
        {campLoading ? (
          <LoadingSpinner size="sm" />
        ) : !campaigns[0] ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">No tienes campaña activa.</p>
            <Link to="/beneficiary/campaign" className="btn-primary text-sm">Crear campaña</Link>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-gray-900">{campaigns[0].titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5">{campaigns[0].motivo}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={campaigns[0].estado} />
              {(campaigns[0].estado === 'ACTIVA' || campaigns[0].estado === 'EN_VALIDACION') && (
                <Link
                  to={`/beneficiary/campaign/${campaigns[0].id}`}
                  className="btn-primary text-sm"
                >
                  Gestionar kits
                </Link>
              )}
              <Link to={`/campaigns/${campaigns[0].id}`} className="text-sm text-primary-600 hover:underline">
                Ver detalle →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link to="/beneficiary/campaign" className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-blue flex items-center justify-center flex-shrink-0">
            <PlusCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mi campaña</h3>
            <p className="text-sm text-gray-500">Ver o crear tu campaña de ayuda</p>
          </div>
        </Link>
        <Link to="/beneficiary/tracking" className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-red flex items-center justify-center flex-shrink-0">
            <TruckIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Seguimiento</h3>
            <p className="text-sm text-gray-500">Ver estado de tus donaciones</p>
          </div>
        </Link>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Donaciones recientes</h2>
        {ordersLoading ? (
          <LoadingSpinner size="sm" />
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No hay donaciones aún.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">Donación #{o.id}</p>
                  <p className="text-xs text-gray-400">${(o.finalPrice ?? 0).toLocaleString('es-CL')} CLP</p>
                </div>
                <StatusBadge status={o.status ?? o.estado} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
