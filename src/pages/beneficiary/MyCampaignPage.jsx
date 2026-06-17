import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { catalogApi, ordersApi } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import CampaignKitCard from '../../components/shared/CampaignKitCard';
import CreateCampaignPage from './CreateCampaignPage';
import {
  MegaphoneIcon,
  CubeIcon,
  PhotoIcon,
  HeartIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export default function MyCampaignPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['my-campaigns', user?.id],
    queryFn: () => catalogApi.getCampaignsByBeneficiary(user.id),
    select: (r) => r.data ?? [],
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  const campaign = campaigns[0];

  const { data: images = [] } = useQuery({
    queryKey: ['campaign-images', campaign?.id],
    queryFn: () => catalogApi.getCampaignImages(campaign.id),
    select: (r) => r.data ?? [],
    enabled: !!campaign?.id,
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ['beneficiary-donations', campaign?.id],
    queryFn: () => ordersApi.getDonationsByCampaign(campaign.id, true),
    // Más recientes primero.
    select: (r) => [...(r.data ?? [])].sort((a, b) => new Date(b.orderDate ?? 0) - new Date(a.orderDate ?? 0)),
    enabled: !!campaign?.id,
  });

  if (isLoading) return <LoadingSpinner text="Cargando tu campaña..." />;

  // Sin campaña → mostrar el formulario de creación directamente
  if (!campaign) return <CreateCampaignPage />;

  const isEditable = campaign.estado === 'ACTIVA' || campaign.estado === 'EN_VALIDACION';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="card mb-6">
        <div className="h-28 rounded-xl bg-gradient-warm flex items-center justify-center mb-6">
          <HeartIcon className="w-14 h-14 text-white drop-shadow-xl" />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.titulo}</h1>
            <StatusBadge status={campaign.estado} />
          </div>
          {isEditable && (
            <Link to={`/beneficiary/campaign/${campaign.id}`} className="btn-primary text-sm">
              Gestionar kits
            </Link>
          )}
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-600">Descripción</p>
            <p className="text-gray-700 mt-1">{campaign.descripcion}</p>
          </div>
          {campaign.motivo && (
            <div>
              <p className="text-sm font-medium text-gray-600">Motivo principal</p>
              <p className="text-gray-700 mt-1">{campaign.motivo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Fotos */}
      {images.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PhotoIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Fotos de la situación</h2>
          </div>
          <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {images.map((img) => (
              <div key={img.id} className="rounded-xl overflow-hidden aspect-square bg-gray-100">
                <img
                  src={catalogApi.getCampaignImageUrl(campaign.id, img.id)}
                  alt={`Foto ${img.orden}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kits con contadores */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CubeIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Kits de la campaña</h2>
        </div>
        {campaign.kits?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campaign.kits.map((ck) => (
              <CampaignKitCard key={ck.id} kit={ck} campaignLogistica={campaign.costoLogistica} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No hay kits asignados aún.</p>
        )}
      </div>

      {/* Donaciones recibidas (EN_PREPARACION en adelante) */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <MegaphoneIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Donaciones recibidas</h2>
        </div>
        {loadingDonations ? (
          <LoadingSpinner size="sm" />
        ) : donations.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Aún no hay donaciones en preparación o entregadas.
          </p>
        ) : (
          <div className="space-y-2">
            {donations.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/order/${d.id}`)}
                className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Donación #{d.id}
                    {d.donorName ? ` — ${d.donorName}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">{(d.items?.length ?? 0)} kit(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={d.estado} />
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
