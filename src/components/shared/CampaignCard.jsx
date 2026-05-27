import { Link } from 'react-router-dom';
import { MapPinIcon, HeartIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../ui/StatusBadge';

export default function CampaignCard({ campaign }) {
  return (
    <div className="card-hover flex flex-col h-full">
      {/* Header gradient */}
      <div className="h-28 rounded-xl bg-gradient-warm flex items-center justify-center mb-4 relative overflow-hidden">
        <HeartIcon className="w-12 h-12 text-white/30 absolute -right-3 -top-3 rotate-12" />
        <span className="text-white font-bold text-4xl opacity-20 absolute -bottom-2 -left-2 select-none text-7xl">
          D
        </span>
        <HeartIcon className="w-10 h-10 text-white drop-shadow-lg" />
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
            {campaign.titulo}
          </h3>
          <StatusBadge status={campaign.status} />
        </div>

        <p className="text-sm text-gray-500 line-clamp-3 flex-1">{campaign.descripcion}</p>

        {campaign.motivo && (
          <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium text-gray-600">Motivo:</span> {campaign.motivo}
          </div>
        )}

        {(campaign.region || campaign.comuna) && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span>
              {campaign.comuna?.nombre ?? campaign.comuna?.name ?? ''}{campaign.region ? `, ${campaign.region.nombre ?? campaign.region.name ?? campaign.region}` : ''}
            </span>
          </div>
        )}

        <Link
          to={`/campaigns/${campaign.id}`}
          className="btn-primary text-sm text-center mt-auto"
        >
          Ver campaña & donar
        </Link>
      </div>
    </div>
  );
}
