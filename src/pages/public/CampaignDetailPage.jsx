import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  ShoppingCartIcon,
  HeartIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { addItem, setCampaignId } = useCart();
  const { isAuthenticated, isDonante } = useAuth();
  const navigate = useNavigate();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => catalogApi.getCampaignById(id),
    select: (r) => r.data,
  });

  if (isLoading) return <LoadingSpinner text="Cargando campaña..." />;
  if (!campaign) return <div className="text-center py-20 text-gray-400">Campaña no encontrada</div>;

  const handleAddKit = (kit) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para donar');
      navigate('/login');
      return;
    }
    if (!isDonante) {
      toast.error('Solo los donantes pueden realizar donaciones');
      return;
    }
    setCampaignId(campaign.id);
    addItem(kit);
    toast.success(`${kit.nombre} agregado al carrito`);
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
              <StatusBadge status={campaign.status} />
              {(campaign.region || campaign.comuna) && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPinIcon className="w-4 h-4" />
                  {campaign.comuna?.nombre ?? campaign.comuna?.name ?? ''}{campaign.region ? `, ${campaign.region?.nombre ?? campaign.region?.name ?? campaign.region}` : ''}
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

      {/* Kits */}
      <div>
        <h2 className="section-title mb-4 text-xl">Kits disponibles para donar</h2>
        {campaign.kits?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.kits.map((ck) => {
              const kit = ck.kit ?? ck;
              return (
                <div key={kit.id} className="card flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center flex-shrink-0">
                      <CubeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{kit.nombre}</h3>
                      {kit.precioBase && (
                        <p className="text-sm text-primary-600 font-medium">
                          ${kit.precioBase?.toLocaleString('es-CL')} CLP
                        </p>
                      )}
                    </div>
                  </div>

                  {kit.descripcion && (
                    <p className="text-sm text-gray-500">{kit.descripcion}</p>
                  )}

                  {kit.items?.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Contenido del kit:</p>
                      <ul className="space-y-1">
                        {kit.items.map((item, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                            {item.producto?.nombre ?? item.productoNombre} × {item.cantidad}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddKit(kit)}
                    className="btn-primary text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCartIcon className="w-4 h-4" />
                    Agregar al carrito
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-8 text-gray-400">
            No hay kits asignados a esta campaña aún.
          </div>
        )}
      </div>
    </div>
  );
}
