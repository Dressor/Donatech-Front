import { useState } from 'react';
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
  PlusIcon,
} from '@heroicons/react/24/outline';

const ACTIVE_STATES = ['ACTIVA', 'EN_VALIDACION'];

export default function MyCampaignPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['my-campaigns', user?.id],
    queryFn: () => catalogApi.getCampaignsByBeneficiary(user.id),
    // Más recientes primero.
    select: (r) => [...(r.data ?? [])].sort((a, b) => new Date(b.fechaCreacion ?? 0) - new Date(a.fechaCreacion ?? 0)),
    enabled: !!user?.id,
    refetchOnMount: 'always',
  });

  const activa = campaigns.find((c) => ACTIVE_STATES.includes(c.estado));
  // Campaña mostrada: la seleccionada, o la activa, o la más reciente.
  const selected = campaigns.find((c) => c.id === selectedId) ?? activa ?? campaigns[0];

  const { data: images = [] } = useQuery({
    queryKey: ['campaign-images', selected?.id],
    queryFn: () => catalogApi.getCampaignImages(selected.id),
    select: (r) => r.data ?? [],
    enabled: !!selected?.id,
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ['beneficiary-donations', selected?.id],
    queryFn: () => ordersApi.getDonationsByCampaign(selected.id, true),
    select: (r) => [...(r.data ?? [])].sort((a, b) => new Date(b.orderDate ?? 0) - new Date(a.orderDate ?? 0)),
    enabled: !!selected?.id,
  });

  if (isLoading) return <LoadingSpinner text="Cargando tus campañas..." />;

  // Sin ninguna campaña → formulario de creación directo.
  if (campaigns.length === 0) return <CreateCampaignPage />;

  const isEditable = selected && ACTIVE_STATES.includes(selected.estado);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Barra de campañas: seleccionar una para ver + crear nueva (si no hay activa) */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <h1 className="section-title mr-2">Mis campañas</h1>
        <div className="flex flex-wrap gap-2 flex-1">
          {campaigns.map((c) => {
            const active = !creating && selected?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setCreating(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="truncate max-w-[160px]">{c.titulo}</span>
                <StatusBadge status={c.estado} />
              </button>
            );
          })}
        </div>
        {activa ? (
          <span className="text-xs text-gray-400" title="Solo puedes tener una campaña activa a la vez">
            Ya tienes una campaña activa
          </span>
        ) : (
          <button
            onClick={() => { setCreating(true); setSelectedId(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              creating ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            Crear nueva campaña
          </button>
        )}
      </div>

      {creating ? (
        <CreateCampaignPage />
      ) : !selected ? null : (
        <>
          {/* Header */}
          <div className="card mb-6">
            <div className="h-28 rounded-xl bg-gradient-warm flex items-center justify-center mb-6">
              <HeartIcon className="w-14 h-14 text-white drop-shadow-xl" />
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selected.titulo}</h2>
                <StatusBadge status={selected.estado} />
              </div>
              {isEditable && (
                <Link to={`/beneficiary/campaign/${selected.id}`} className="btn-primary text-sm">
                  Gestionar kits
                </Link>
              )}
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Descripción</p>
                <p className="text-gray-700 mt-1">{selected.descripcion}</p>
              </div>
              {selected.motivo && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Motivo principal</p>
                  <p className="text-gray-700 mt-1">{selected.motivo}</p>
                </div>
              )}
              {selected.motivoRechazo && (
                <div>
                  <p className="text-sm font-medium text-danger-600">Motivo de rechazo</p>
                  <p className="text-gray-700 mt-1">{selected.motivoRechazo}</p>
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
                      src={catalogApi.getCampaignImageUrl(selected.id, img.id)}
                      alt={`Foto ${img.orden}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kits */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CubeIcon className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900">Kits de la campaña</h2>
            </div>
            {selected.kits?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selected.kits.map((ck) => (
                  <CampaignKitCard key={ck.id} kit={ck} campaignLogistica={selected.costoLogistica} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No hay kits asignados aún.</p>
            )}
          </div>

          {/* Donaciones recibidas */}
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
        </>
      )}
    </div>
  );
}
