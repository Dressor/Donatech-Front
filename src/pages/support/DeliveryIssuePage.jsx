import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supportsApi, catalogApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { LifebuoyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MAX_CHARS = 500;
const MOTIVOS = [
  'No estaré presente en la entrega',
  'Dirección de entrega incorrecta',
  'No recibí mi donación',
  'Producto dañado o incompleto',
  'Reprogramar entrega',
  'Otro',
];

export default function DeliveryIssuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [mensaje, setMensaje] = useState('');
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['active-campaigns'],
    queryFn: () => catalogApi.getActiveCampaigns(),
    select: (r) => r.data ?? [],
  });

  const mutation = useMutation({
    mutationFn: (form) =>
      supportsApi.create({
        tipo: 'INCIDENCIA_ENTREGA',
        prioridad: 'MEDIO',
        usuarioId: user.id,
        campaignId: Number(form.campaignId),
        donationId: orderId ? Number(orderId) : undefined,
        titulo: `Incidencia de entrega: ${form.motivo}`,
        descripcion: mensaje,
        recipientEmail: user.email,
      }),
    onSuccess: () => {
      toast.success('Tu solicitud fue enviada a soporte');
      setSent(true);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (form) => {
    if (!mensaje.trim()) {
      toast.error('Escribe tu consulta o solicitud');
      return;
    }
    mutation.mutate(form);
  };

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h1>
        <p className="text-gray-500 mb-8">
          Nuestro equipo de soporte revisará tu incidencia y te contactará a la brevedad.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/')} className="btn-primary">Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-2">
        <LifebuoyIcon className="w-6 h-6 text-primary-600" />
        <h1 className="section-title">Soporte — Incidencia de entrega</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Cuéntanos tu situación y nuestro equipo te ayudará. Selecciona la campaña relacionada, el motivo y
        describe tu solicitud.
      </p>

      {orderId && (
        <div className="card bg-blue-50 border border-blue-200 mb-6 text-sm text-primary-700">
          Esta solicitud quedará vinculada a tu donación <strong>#{orderId}</strong>.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div>
          <label className="label">Campaña</label>
          {loadingCampaigns ? (
            <LoadingSpinner size="sm" />
          ) : (
            <select {...register('campaignId', { required: 'Selecciona una campaña' })} className="input-field">
              <option value="">Selecciona una campaña...</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.titulo}</option>
              ))}
            </select>
          )}
          {errors.campaignId && <p className="text-xs text-danger-600 mt-1">{errors.campaignId.message}</p>}
        </div>

        <div>
          <label className="label">Motivo</label>
          <select {...register('motivo', { required: 'Selecciona un motivo' })} className="input-field">
            <option value="">Selecciona un motivo...</option>
            {MOTIVOS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.motivo && <p className="text-xs text-danger-600 mt-1">{errors.motivo.message}</p>}
        </div>

        <div>
          <label className="label">Tu consulta o solicitud</label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value.slice(0, MAX_CHARS))}
            rows={5}
            placeholder="Describe tu situación..."
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{mensaje.length}/{MAX_CHARS}</p>
        </div>

        <div className="flex gap-2 justify-end">
          <Link to="/" className="btn-secondary text-sm">Cancelar</Link>
          <button type="submit" disabled={mutation.isPending} className="btn-primary text-sm">
            {mutation.isPending ? 'Enviando...' : 'Enviar a soporte'}
          </button>
        </div>
      </form>
    </div>
  );
}
