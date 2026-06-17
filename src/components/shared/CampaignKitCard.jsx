import { useState } from 'react';
import {
  CubeIcon,
  EyeIcon,
  ShoppingCartIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

/**
 * Card de kit de campaña reutilizable (DRY).
 * - Modo donante: pasar `onDonate` y/o `onViewDetails` → botones "Ver contenido" / "Donar kit".
 * - Modo gestión (beneficiario): pasar `editable` → lápiz para editar la cantidad necesaria
 *   (`onUpdateQuantity(kitId, qty)`) y, si `canRemove`, papelera (`onRemove(kitId)`).
 * - Solo lectura: no pasar acciones.
 */
export default function CampaignKitCard({
  kit,
  campaignLogistica = 0,
  onDonate,
  onViewDetails,
  donateDisabled = false,
  editable = false,
  onUpdateQuantity,
  onRemove,
  canRemove = false,
}) {
  const fulfilled = kit.cantidadFulfilled ?? 0;
  const delivered = kit.cantidadEntregada ?? 0;
  const needed = kit.cantidadNecesaria ?? 1;
  const pct = Math.min(100, Math.round((fulfilled / needed) * 100));
  const complete = pct >= 100;

  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(needed);

  const startEdit = () => { setQty(needed); setEditing(true); };
  const save = () => {
    const n = parseInt(qty, 10);
    if (Number.isInteger(n) && n >= 1 && n !== needed) onUpdateQuantity?.(kit.kitId, n);
    setEditing(false);
  };

  const hasDonorActions = !!(onDonate || onViewDetails);

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center flex-shrink-0">
          <CubeIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{kit.kitNombre ?? `Kit #${kit.kitId}`}</h3>
          {kit.kitPrecioEstimado > 0 && (
            <p className="text-sm text-primary-600 font-medium">
              ${kit.kitPrecioEstimado.toLocaleString('es-CL')} CLP
            </p>
          )}
          {campaignLogistica > 0 && (
            <p className="text-xs text-gray-400">
              + ${campaignLogistica.toLocaleString('es-CL')} logística por kit
            </p>
          )}
        </div>
        {editable && canRemove && (
          <button
            onClick={() => onRemove?.(kit.kitId)}
            className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0"
            title="Eliminar kit"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progreso */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>En proceso: <span className="font-semibold text-gray-700">{fulfilled}</span></span>
          <span className="flex items-center gap-1">
            Necesarios:
            {editing ? (
              <span className="inline-flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-16 px-2 py-0.5 border border-gray-300 rounded text-xs"
                  autoFocus
                />
                <button onClick={save} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Guardar">
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setEditing(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancelar">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ) : (
              <>
                <span className="font-semibold text-gray-700">{needed}</span>
                {editable && (
                  <button
                    onClick={startEdit}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-200 rounded"
                    title="Editar cantidad necesaria"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${complete ? 'bg-green-500' : 'bg-primary-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Entregados: <span className="font-semibold text-gray-600">{delivered}</span>
        </p>
        {complete && <p className="text-xs text-green-600 font-medium mt-1">¡Meta alcanzada!</p>}
      </div>

      {/* Acciones de donante */}
      {hasDonorActions && (
        <div className="flex gap-2 mt-auto">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="btn-secondary text-sm flex items-center justify-center gap-1.5 flex-1"
            >
              <EyeIcon className="w-4 h-4" />
              Ver contenido
            </button>
          )}
          {onDonate && (
            <button
              onClick={onDonate}
              disabled={donateDisabled}
              className="btn-primary text-sm flex items-center justify-center gap-1.5 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              Donar kit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
