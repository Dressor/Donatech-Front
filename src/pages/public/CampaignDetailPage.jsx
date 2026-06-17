import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import KitDetailModal from '../../components/ui/KitDetailModal';
import CampaignKitCard from '../../components/shared/CampaignKitCard';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  HeartIcon,
  EyeIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated, isDonante, isOrganizacion } = useAuth();
  const navigate = useNavigate();
  const [selectedKit, setSelectedKit] = useState(null);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => catalogApi.getCampaignById(id),
    select: (r) => r.data,
  });

  const { data: campaignImages = [] } = useQuery({
    queryKey: ['campaign-images', id],
    queryFn: () => catalogApi.getCampaignImages(id),
    select: (r) => r.data ?? [],
    enabled: !!id,
  });

  const [lightboxImg, setLightboxImg] = useState(null);

  if (isLoading) return <LoadingSpinner text="Cargando campaña..." />;
  if (!campaign) return <div className="text-center py-20 text-gray-400">Campaña no encontrada</div>;

  const handleAddKit = (ck) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para donar');
      navigate('/login');
      return;
    }
    if (!isDonante && !isOrganizacion) {
      toast.error('Solo los donantes pueden realizar donaciones');
      return;
    }
    addItem(
      { id: ck.kitId, nombre: ck.kitNombre, precioEstimado: ck.kitPrecioEstimado },
      1,
      { campaignId: campaign.id, campaignNombre: campaign.titulo, campaignLogistica: campaign.costoLogistica ?? 0 }
    );
    toast.success(`${ck.kitNombre} agregado al carrito`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="card mb-6">
        <div className="h-32 rounded-xl bg-gradient-warm flex items-center justify-center mb-6 relative overflow-hidden">
          <HeartIcon className="w-16 h-16 text-white drop-shadow-xl" />
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.titulo}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={campaign.estado ?? campaign.status} />
              {(campaign.region || campaign.comuna) && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPinIcon className="w-4 h-4" />
                  {campaign.comuna?.nombre ?? campaign.comuna?.name ?? ''}
                  {campaign.region ? `, ${campaign.region?.nombre ?? campaign.region?.name ?? campaign.region}` : ''}
                </span>
              )}
            </div>
          </div>
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

      {/* Fotos de la campaña */}
      {campaignImages.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PhotoIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Fotos de la situación</h2>
          </div>
          <div className={`grid gap-3 ${campaignImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {campaignImages.map((img) => (
              <button
                key={img.id}
                onClick={() => setLightboxImg(img)}
                className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100 focus:outline-none"
              >
                <img
                  src={catalogApi.getCampaignImageUrl(id, img.id)}
                  alt={`Foto ${img.orden}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={catalogApi.getCampaignImageUrl(id, lightboxImg.id)}
            alt="Foto campaña"
            className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Kits */}
      <div>
        <h2 className="section-title mb-4 text-xl">Kits disponibles para donar</h2>
        {campaign.kits?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.kits.map((ck) => {
              const complete = (ck.cantidadFulfilled ?? 0) >= (ck.cantidadNecesaria ?? 1);
              return (
                <CampaignKitCard
                  key={ck.id}
                  kit={ck}
                  campaignLogistica={campaign.costoLogistica}
                  onViewDetails={() => setSelectedKit({ kitId: ck.kitId, kitNombre: ck.kitNombre })}
                  onDonate={() => handleAddKit(ck)}
                  donateDisabled={complete}
                />
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-8 text-gray-400">
            No hay kits asignados a esta campaña aún.
          </div>
        )}
      </div>

      {/* Kit detail modal */}
      {selectedKit && (
        <KitDetailModal
          kitId={selectedKit.kitId}
          onClose={() => setSelectedKit(null)}
        />
      )}
    </div>
  );
}
