import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  CubeIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function AdminCampaignKitsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => catalogApi.getCampaignById(id),
    select: (r) => r.data,
  });

  const { data: kits = [], isLoading: loadingKits } = useQuery({
    queryKey: ['kits'],
    queryFn: () => catalogApi.getKits(),
    select: (r) => r.data ?? [],
  });

  const addMutation = useMutation({
    mutationFn: (data) =>
      catalogApi.addKitToCampaign(id, {
        kitId: Number(data.kitId),
        cantidadNecesaria: Number(data.cantidadNecesaria),
      }),
    onSuccess: () => {
      toast.success('Kit agregado a la campaña');
      queryClient.invalidateQueries(['campaign', id]);
      reset();
      setShowForm(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: (kitId) => catalogApi.removeKitFromCampaign(id, kitId),
    onSuccess: () => {
      toast.success('Kit eliminado de la campaña');
      queryClient.invalidateQueries(['campaign', id]);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (loadingCampaign) return <LoadingSpinner />;
  if (!campaign) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
      <p className="text-gray-500">Campaña no encontrada.</p>
      <Link to="/admin/catalog" className="btn-primary mt-4 inline-block">Volver a catálogo</Link>
    </div>
  );

  const isEditable = campaign.estado === 'ACTIVA' || campaign.estado === 'EN_VALIDACION';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/admin/catalog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a catálogo
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="section-title mb-1">{campaign.titulo}</h1>
            <p className="text-sm text-gray-500">{campaign.motivo}</p>
          </div>
          <StatusBadge status={campaign.estado} />
        </div>
      </div>

      <div className="card mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">{campaign.descripcion}</p>
        {campaign.observaciones && (
          <p className="text-xs text-gray-400 mt-2">{campaign.observaciones}</p>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Kits asignados</h2>
          </div>
          {isEditable && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Agregar kit
            </button>
          )}
        </div>

        {showForm && isEditable && (
          <form
            onSubmit={handleSubmit((data) => addMutation.mutate(data))}
            className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Kit</label>
                {loadingKits ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <select
                    {...register('kitId', { required: 'Selecciona un kit' })}
                    className="input-field"
                  >
                    <option value="">Selecciona un kit...</option>
                    {kits.map((k) => (
                      <option key={k.id} value={k.id}>{k.nombre}</option>
                    ))}
                  </select>
                )}
                {errors.kitId && <p className="text-xs text-danger-600 mt-1">{errors.kitId.message}</p>}
              </div>
              <div>
                <label className="label">Cantidad necesaria</label>
                <input
                  type="number"
                  min="1"
                  {...register('cantidadNecesaria', {
                    required: 'Indica la cantidad',
                    min: { value: 1, message: 'Mínimo 1' },
                  })}
                  className="input-field"
                  placeholder="Ej: 10"
                />
                {errors.cantidadNecesaria && (
                  <p className="text-xs text-danger-600 mt-1">{errors.cantidadNecesaria.message}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); }}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="btn-primary text-sm"
              >
                {addMutation.isPending ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
          </form>
        )}

        {!campaign.kits || campaign.kits.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No hay kits asignados a esta campaña.
            {isEditable && ' Agrega uno usando el botón de arriba.'}
          </p>
        ) : (
          <div className="space-y-2">
            {campaign.kits.map((ck) => (
              <div
                key={ck.id}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{ck.kit?.nombre ?? `Kit #${ck.kit?.id}`}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Necesarios: <span className="font-semibold">{ck.cantidadNecesaria}</span>
                    {' · '}
                    Recibidos: <span className="font-semibold text-green-600">{ck.cantidadFulfilled}</span>
                  </p>
                </div>
                {isEditable && (
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Quitar el kit "${ck.kit?.nombre}" de la campaña?`))
                        removeMutation.mutate(ck.id);
                    }}
                    disabled={removeMutation.isPending}
                    className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                    title="Eliminar kit"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isEditable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          Esta campaña está en estado <strong>{campaign.estado}</strong> — no se pueden modificar los kits.
        </div>
      )}
    </div>
  );
}
