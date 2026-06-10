import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import CampaignCard from '../../components/shared/CampaignCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function CampaignsPage() {
  const [search, setSearch] = useState('');

  const { data: campaigns = [], isLoading, isError } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => catalogApi.getActiveCampaigns(),
    select: (r) => r.data ?? [],
  });

  const filtered = campaigns.filter(
    (c) =>
      c.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title mb-1">Campañas activas</h1>
        <p className="text-gray-500">
          Familias verificadas que necesitan tu apoyo en este momento
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          className="input-field pl-9"
        />
      </div>

      {isError ? (
        <div className="text-center py-12 text-red-600">
          No se pudieron cargar las campañas. Intenta recargar la página.
        </div>
      ) : isLoading ? (
        <LoadingSpinner text="Cargando campañas..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HeartIcon}
          title="No hay campañas activas"
          description="Vuelve pronto, estamos validando nuevas campañas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
