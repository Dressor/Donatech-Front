import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { catalogApi, ordersApi } from '../../api';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { HeartIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

export default function BeneficiaryDashboard() {
  const { user } = useAuth();

  const { data: campaigns = [], isLoading: campLoading } = useQuery({
    queryKey: ['my-campaigns', user?.id],
    queryFn: () => catalogApi.getCampaignsByBeneficiary(user.id),
    select: (r) => r.data ?? [],
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  const campaignId = campaigns[0]?.id;

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['beneficiary-orders', campaignId],
    queryFn: () => ordersApi.getDonationsByCampaign(campaignId),
    select: (r) => r.data?.slice(0, 5) ?? [],
    enabled: !!campaignId,
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
              <Link to="/beneficiary/campaign" className="btn-primary text-sm">
                Ver mi campaña →
              </Link>
            </div>
          </div>
        )}
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
