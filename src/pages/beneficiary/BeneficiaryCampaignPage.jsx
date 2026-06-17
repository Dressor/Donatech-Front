import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import AIChatModal from '../../components/ui/AIChatModal';
import ManualKitForm from '../../components/ui/ManualKitForm';
import CampaignKitCard from '../../components/shared/CampaignKitCard';
import { useAuth } from '../../context/AuthContext';
import {
  CubeIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function BeneficiaryCampaignPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showManualKit, setShowManualKit] = useState(false);
  const photoInputRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  /* ── Campaña ── */
  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => catalogApi.getCampaignById(id),
    select: (r) => r.data,
  });

  /* ── Kits disponibles ── */
  const { data: kits = [], isLoading: loadingKits } = useQuery({
    queryKey: ['kits'],
    queryFn: () => catalogApi.getKits(),
    select: (r) => r.data ?? [],
  });

  /* ── Agregar kit ── */
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

  /* ── Eliminar kit ── */
  const removeMutation = useMutation({
    mutationFn: (kitId) => catalogApi.removeKitFromCampaign(id, kitId),
    onSuccess: () => {
      toast.success('Kit eliminado de la campaña');
      queryClient.invalidateQueries(['campaign', id]);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  /* ── Editar cantidad necesaria ── */
  const updateQtyMutation = useMutation({
    mutationFn: ({ kitId, qty }) => catalogApi.updateCampaignKit(id, kitId, qty),
    onSuccess: () => {
      toast.success('Cantidad necesaria actualizada');
      queryClient.invalidateQueries(['campaign', id]);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  /* ── Fotos de campaña ── */
  const { data: campaignImages = [], isLoading: loadingImages } = useQuery({
    queryKey: ['campaign-images', id],
    queryFn: () => catalogApi.getCampaignImages(id),
    select: (r) => r.data ?? [],
    enabled: !!id,
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file) => catalogApi.uploadCampaignImage(id, file),
    onSuccess: () => {
      toast.success('Foto subida correctamente');
      queryClient.invalidateQueries(['campaign-images', id]);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId) => catalogApi.deleteCampaignImage(id, imageId),
    onSuccess: () => {
      toast.success('Foto eliminada');
      queryClient.invalidateQueries(['campaign-images', id]);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadImageMutation.mutate(file);
    e.target.value = '';
  };

  if (loadingCampaign) return <LoadingSpinner />;
  if (!campaign) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
      <p className="text-gray-500">Campaña no encontrada.</p>
      <Link to="/beneficiary/dashboard" className="btn-primary mt-4 inline-block">Volver</Link>
    </div>
  );

  const isEditable = campaign.estado === 'ACTIVA' || campaign.estado === 'EN_VALIDACION';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/beneficiary/dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver al dashboard
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="section-title mb-1">{campaign.titulo}</h1>
            <p className="text-sm text-gray-500">{campaign.motivo}</p>
          </div>
          <StatusBadge status={campaign.estado} />
        </div>
      </div>

      {/* Descripción */}
      <div className="card mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">{campaign.descripcion}</p>
        {campaign.observaciones && (
          <p className="text-xs text-gray-400 mt-2">{campaign.observaciones}</p>
        )}
      </div>

      {/* Kits asignados */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Kits asignados</h2>
          </div>
          {isEditable && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIChat(true)}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <SparklesIcon className="w-4 h-4" />
                Crear kit
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <PlusCircleIcon className="w-4 h-4" />
                Agregar kit
              </button>
            </div>
          )}
        </div>

        {/* Formulario agregar kit */}
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

        {/* Lista de kits */}
        {!campaign.kits || campaign.kits.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No hay kits asignados a esta campaña.
            {isEditable && ' Agrega uno usando el botón de arriba.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {campaign.kits.map((ck) => {
              const fresh = (ck.cantidadFulfilled ?? 0) === 0 && (ck.cantidadEntregada ?? 0) === 0;
              return (
                <CampaignKitCard
                  key={ck.id}
                  kit={ck}
                  campaignLogistica={campaign.costoLogistica}
                  editable={isEditable}
                  onUpdateQuantity={(kitId, qty) => updateQtyMutation.mutate({ kitId, qty })}
                  onRemove={(kitId) => {
                    if (window.confirm(`¿Quitar el kit "${ck.kitNombre}" de la campaña?`))
                      removeMutation.mutate(kitId);
                  }}
                  canRemove={fresh}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Fotos de la campaña */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Fotos de la situación</h2>
            <span className="text-xs text-gray-400">({campaignImages.length}/3)</span>
          </div>
          {campaignImages.length < 3 && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadImageMutation.isPending}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                {uploadImageMutation.isPending ? 'Subiendo...' : 'Agregar foto'}
              </button>
            </>
          )}
        </div>

        {loadingImages ? (
          <LoadingSpinner size="sm" />
        ) : campaignImages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No hay fotos aún. Agrega hasta 3 imágenes que ilustren la situación de la campaña.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {campaignImages.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                <img
                  src={catalogApi.getCampaignImageUrl(id, img.id)}
                  alt={`Foto ${img.orden}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    if (window.confirm('¿Eliminar esta foto?'))
                      deleteImageMutation.mutate(img.id);
                  }}
                  disabled={deleteImageMutation.isPending}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado no editable */}
      {!isEditable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          Esta campaña está en estado <strong>{campaign.estado}</strong> — no se pueden modificar los kits.
        </div>
      )}

      {/* Chat IA para kit personalizado */}
      {showAIChat && (
        <AIChatModal
          campaignId={id}
          nombreAfectado={user?.nombre || user?.email || 'afectado'}
          tituloCampana={campaign.titulo}
          descripcionCampana={campaign.descripcion}
          onClose={() => setShowAIChat(false)}
          onConfirmed={() => {
            queryClient.invalidateQueries(['campaign', id]);
          }}
          onUnavailable={() => { setShowAIChat(false); setShowManualKit(true); }}
        />
      )}

      {/* Fallback: creación manual de kit personalizado si la IA no responde */}
      {showManualKit && (
        <ManualKitForm
          campaignId={id}
          existingKits={campaign.kits}
          onClose={() => setShowManualKit(false)}
          onConfirmed={() => {
            queryClient.invalidateQueries(['campaign', id]);
          }}
        />
      )}
    </div>
  );
}
