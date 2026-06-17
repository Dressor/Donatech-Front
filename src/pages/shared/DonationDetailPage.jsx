import { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuthImage } from '../../utils/imageBlob';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';
import {
  BanknotesIcon, DocumentArrowUpIcon, DocumentIcon, TruckIcon,
  HeartIcon, PhotoIcon, XMarkIcon, ArrowDownTrayIcon, CubeIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATES = [
  { key: 'INGRESADA', label: 'Ingresada' },
  { key: 'EN_VALIDACION_TRANSFERENCIA', label: 'Validando pago' },
  { key: 'EN_PREPARACION', label: 'En preparación' },
  { key: 'ASIGNADA_ENVIO', label: 'Asignada envío' },
  { key: 'EN_CAMINO', label: 'En camino' },
  { key: 'PENDIENTE_CONFIRMACION', label: 'Pendiente confirmación' },
  { key: 'ENTREGADA', label: 'Entregada' },
];
const CANCELLABLE_STATES = ['DRAFT', 'INGRESADA', 'EN_VALIDACION_TRANSFERENCIA'];
const THANK_MAX = 600;
const THANK_MAX_IMAGES = 4;

// Bloque de imagen protegida (comprobante / foto de entrega). Solo se monta si enabled.
function EvidenceImage({ title, queryKey, fetchFn, enabled }) {
  const { blobUrl, isLoading } = useAuthImage(queryKey, fetchFn, { enabled, retry: false });
  if (!enabled) return null;
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : blobUrl ? (
        <div className="bg-gray-50 rounded-xl p-2">
          <img
            src={blobUrl}
            alt={title}
            className="w-full rounded-lg object-contain max-h-80"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden items-center gap-2 p-3 text-sm text-gray-500">
            <DocumentIcon className="w-5 h-5" />
            <span>Archivo no previsualizable.</span>
            <a href={blobUrl} download className="text-primary-600 hover:underline ml-auto">Descargar</a>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400">No disponible.</p>
      )}
    </div>
  );
}

export default function DonationDetailPage() {
  const { id } = useParams();
  const { user, isAdmin, isValidador, isOrganizacion } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [proofFile, setProofFile] = useState(null);
  const [showThank, setShowThank] = useState(false);
  const [thankSent, setThankSent] = useState(false);
  const [message, setMessage] = useState('');
  const [thankImages, setThankImages] = useState([]);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id),
    select: (r) => r.data,
    refetchInterval: 30000,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['order-history', id],
    queryFn: () => ordersApi.getHistory(id),
    select: (r) => r.data ?? [],
    enabled: !!id,
  });

  const { data: transferConfig } = useQuery({
    queryKey: ['transfer-config'],
    queryFn: () => ordersApi.getTransferConfig(),
    select: (r) => (r.data?.message ? null : r.data),
    retry: false,
    throwOnError: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['order', id] });
    queryClient.invalidateQueries({ queryKey: ['order-history', id] });
  };

  const cancelMutation = useMutation({
    mutationFn: (motivo) => ordersApi.cancelOrder(id, motivo, user?.id),
    onSuccess: () => { toast.success('Orden cancelada'); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const uploadProofMutation = useMutation({
    mutationFn: (file) => ordersApi.uploadTransferProof(id, file),
    onSuccess: () => { toast.success('¡Comprobante enviado!'); setProofFile(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const thankMutation = useMutation({
    mutationFn: () => ordersApi.sendThankYou(id, message, thankImages),
    onSuccess: () => { toast.success('¡Gracias enviadas al donante!'); setThankSent(true); setShowThank(false); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: () => ordersApi.confirmDelivery(id, user?.id),
    onSuccess: () => { toast.success('¡Entrega confirmada!'); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingSpinner text="Cargando donación..." />;
  if (isError) {
    const status = error?.response?.status;
    return (
      <div className="text-center py-20 text-gray-500">
        {status === 404 ? 'Donación no encontrada.' : status === 403
          ? 'No tienes permiso para ver esta donación.'
          : 'No se pudo cargar la donación.'}
      </div>
    );
  }
  if (!order) return <div className="text-center py-20 text-gray-400">Donación no encontrada</div>;

  const estado = order.estado ?? order.status;
  const currentIdx = STATES.findIndex((s) => s.key === estado);
  const isTerminated = estado === 'RECHAZADA' || estado === 'CANCELADA';
  const isOwner = user?.email && order.userEmail && user.email.toLowerCase() === order.userEmail.toLowerCase();
  const isBeneficiaryViewer = user?.id && order.beneficiaryId && user.id === order.beneficiaryId;
  const isStaff = isAdmin || isValidador;
  const canCancel = isOwner && CANCELLABLE_STATES.includes(estado);
  const canThank = isBeneficiaryViewer && estado === 'ENTREGADA';
  const canConfirmDelivery = estado === 'PENDIENTE_CONFIRMACION' && (isBeneficiaryViewer || isAdmin);
  const CERT_STATES = ['EN_PREPARACION', 'ASIGNADA_ENVIO', 'EN_CAMINO', 'PENDIENTE_CONFIRMACION', 'ENTREGADA'];
  const canCertificate = isOrganizacion && isOwner && CERT_STATES.includes(estado);

  const downloadCertificate = async () => {
    try {
      const res = await ordersApi.getDonationCertificate(id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `certificado-donacion-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const downloadDoc = async () => {
    try {
      const res = await ordersApi.getDeliveryDocument(id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `documento-entrega-${id}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleThankImages = (e) => {
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    setThankImages((prev) => [...prev, ...files].slice(0, THANK_MAX_IMAGES));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabecera */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1">Detalle de donación</h1>
          <p className="text-gray-500">Orden #{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={estado} />
          {canCancel && (
            <button
              onClick={() => { if (window.confirm('¿Cancelar esta donación? No se puede deshacer.')) cancelMutation.mutate('Cancelada por el donante'); }}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-danger-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4" />
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
        </div>
      </div>

      {/* Partes involucradas — lista vertical para que un email largo no tape los demás campos */}
      <div className="card mb-6 divide-y divide-gray-100 text-sm">
        <div className="flex justify-between gap-4 py-2 first:pt-0">
          <span className="text-gray-400 text-xs shrink-0 pt-0.5">Donante</span>
          <span className="font-medium text-gray-800 text-right break-words min-w-0">{order.donorName || order.userEmail || '—'}</span>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <span className="text-gray-400 text-xs shrink-0 pt-0.5">Beneficiario</span>
          <span className="font-medium text-gray-800 text-right break-words min-w-0">{order.beneficiaryName || '—'}</span>
        </div>
        <div className="flex justify-between gap-4 py-2 last:pb-0">
          <span className="text-gray-400 text-xs shrink-0 pt-0.5">Campaña</span>
          <span className="font-medium text-gray-800 text-right break-words min-w-0">{order.campaignTitulo || (order.campaignId ? `#${order.campaignId}` : '—')}</span>
        </div>
      </div>

      {/* Banner terminal */}
      {isTerminated && (
        <div className="card mb-6 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <XCircleIcon className="w-6 h-6 text-danger-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-danger-700">
                {estado === 'RECHAZADA' ? 'Donación rechazada' : 'Donación cancelada'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {order.rejectionReason ? `Motivo: ${order.rejectionReason}`
                  : estado === 'RECHAZADA' ? 'El comprobante no fue aprobado.' : 'Esta donación fue cancelada.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de entrega (beneficiario dueño o admin, estado PENDIENTE_CONFIRMACION) */}
      {canConfirmDelivery && (
        <div className="card mb-6 border border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Confirma la recepción de tu donación</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            El transportista registró la entrega. Confirma que la recibiste para cerrar el proceso.
            Si hubo un problema, repórtalo a soporte en vez de confirmar.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { if (window.confirm('¿Confirmas que recibiste esta donación?')) confirmDeliveryMutation.mutate(); }}
              disabled={confirmDeliveryMutation.isPending}
              className="btn-primary flex items-center gap-1.5"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {confirmDeliveryMutation.isPending ? 'Confirmando...' : 'Confirmar entrega'}
            </button>
            <Link to={`/support/delivery-issue?orderId=${id}`} className="btn-secondary flex items-center gap-1.5">
              No la recibí / reportar
            </Link>
          </div>
        </div>
      )}

      {/* Kits */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CubeIcon className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-800">Kits donados</h3>
        </div>
        <div className="space-y-2">
          {(order.items ?? []).map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{it.kitNameSnapshot ?? `Kit #${it.kitId}`}</span>
              <span className="font-medium text-gray-600">× {it.quantity}</span>
            </div>
          ))}
        </div>
        {order.finalPrice != null && (
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-primary-700">${(order.finalPrice ?? 0).toLocaleString('es-CL')} CLP</span>
          </div>
        )}
      </div>

      {/* Pendiente de pago → el comprobante se sube a nivel donación (un pago) */}
      {estado === 'INGRESADA' && isOwner && order.donationId && (
        <div className="card mb-6 border border-amber-200 bg-amber-50 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BanknotesIcon className="w-5 h-5 text-amber-700" />
            <p className="text-sm text-amber-800">Esta orden pertenece a una donación pendiente de pago.</p>
          </div>
          <Link to={`/donation/${order.donationId}`} className="btn-primary text-sm">Ir a la donación →</Link>
        </div>
      )}

      {/* Certificado de donación (empresa, pago validado) */}
      {canCertificate && (
        <div className="card mb-6 border border-primary-200 bg-primary-50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-primary-800">Certificado de donación</p>
              <p className="text-sm text-gray-600">Documento con los datos de tu empresa para fines legales.</p>
            </div>
            <button onClick={downloadCertificate} className="btn-primary text-sm inline-flex items-center gap-1.5">
              <ArrowDownTrayIcon className="w-4 h-4" /> Descargar certificado
            </button>
          </div>
        </div>
      )}

      {/* Evidencias (visible para donante / beneficiario / staff, según authz backend) */}
      <div className="card mb-6 space-y-5">
        <h3 className="font-semibold text-gray-800">Evidencias y logística</h3>

        {order.transportistaNombre && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <TruckIcon className="w-5 h-5 text-primary-600" />
            <span>Transportista: <strong>{order.transportistaNombre}</strong>
              {order.transportistaContacto ? ` · ${order.transportistaContacto}` : ''}</span>
          </div>
        )}

        <EvidenceImage
          title="Comprobante de transferencia"
          queryKey={['transfer-proof', id]}
          fetchFn={() => ordersApi.getTransferProof(id)}
          enabled={!!order.transferProofUrl}
        />

        <EvidenceImage
          title="Foto de entrega"
          queryKey={['delivery-photo', id]}
          fetchFn={() => ordersApi.getDeliveryPhoto(id)}
          enabled={!!order.deliveryPhotoUrl}
        />

        {order.deliveryDocumentUrl && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Documento de entrega firmado</p>
            <button onClick={downloadDoc} className="btn-secondary text-sm inline-flex items-center gap-1.5">
              <ArrowDownTrayIcon className="w-4 h-4" /> Descargar documento
            </button>
          </div>
        )}

        {!order.transportistaNombre && !order.transferProofUrl && !order.deliveryPhotoUrl && !order.deliveryDocumentUrl && (
          <p className="text-xs text-gray-400">Aún no hay evidencias registradas.</p>
        )}
      </div>

      {/* Agradecimiento (beneficiario, orden ENTREGADA) */}
      {canThank && (
        <div className="card mb-6">
          {thankSent || order.thankYouMessage ? (
            <div className="text-center py-4">
              <HeartIcon className="w-10 h-10 text-danger-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Ya enviaste tu agradecimiento a este donante. ¡Gracias!</p>
            </div>
          ) : !showThank ? (
            <button onClick={() => setShowThank(true)} className="btn-primary w-full flex items-center justify-center gap-2">
              <HeartIcon className="w-5 h-5" /> Dar las gracias a {order.donorName || 'el donante'}
            </button>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Mensaje de agradecimiento</h3>
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, THANK_MAX))}
                  rows={5}
                  placeholder="Escribe tu mensaje... 💙 Puedes usar emojis."
                  className="input-field resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/{THANK_MAX}</p>
              </div>
              <div>
                <label className="btn-secondary text-sm inline-flex items-center gap-1.5 cursor-pointer">
                  <PhotoIcon className="w-4 h-4" /> Agregar imágenes
                  <input type="file" accept="image/*" multiple onChange={handleThankImages} className="hidden" />
                </label>
                {thankImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {thankImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setThankImages((p) => p.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/70">
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowThank(false)} className="btn-secondary text-sm">Cancelar</button>
                <button
                  onClick={() => { if (!message.trim()) { toast.error('Escribe un mensaje'); return; } thankMutation.mutate(); }}
                  disabled={thankMutation.isPending}
                  className="btn-primary text-sm"
                >
                  {thankMutation.isPending ? 'Enviando...' : 'Enviar agradecimiento'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {!isTerminated && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-800 mb-6">Estado actual</h3>
          <div className="relative">
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {STATES.map((state, i) => {
                const done = i <= currentIdx;
                const current = i === currentIdx;
                return (
                  <div key={state.key} className="relative flex items-start gap-4 pl-10">
                    <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center border-2 ${done ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'} ${current ? 'ring-4 ring-primary-100' : ''}`}>
                      {done ? <CheckCircleIcon className="w-4 h-4 text-white" /> : <ClockIcon className="w-3.5 h-3.5 text-gray-400" />}
                    </div>
                    <div className={`pb-1 ${current ? 'opacity-100' : done ? 'opacity-80' : 'opacity-40'}`}>
                      <p className={`font-medium text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {state.label}
                        {current && <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">Actual</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Historial de cambios</h3>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={h.estadoNuevo ?? h.status} />
                    {(h.fechaCambio ?? h.changedAt) && (
                      <span className="text-gray-400">{format(new Date(h.fechaCambio ?? h.changedAt), "d MMM, HH:mm", { locale: es })}</span>
                    )}
                  </div>
                  {h.comentario && <p className="text-gray-500 mt-0.5">{h.comentario}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
