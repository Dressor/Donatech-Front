import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ordersApi, usersApi, supportsApi, catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuthImage } from '../../utils/imageBlob';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import { XMarkIcon, ShieldCheckIcon, CheckCircleIcon, XCircleIcon, UserIcon, BuildingOffice2Icon, DocumentIcon, HeartIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TransferDetailModal({ ticket, onClose, onSuccess }) {
  const [rejecting, setRejecting] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [respuesta, setRespuesta] = useState('');

  const isValidation = ['VALIDACION_TRANSFERENCIA', 'VALIDACION_CAMPAÑA'].includes(ticket.tipo);

  const { data: order, isLoading: loadingOrder } = useQuery({
    queryKey: ['order', ticket.donationId],
    queryFn: () => ordersApi.getDonationById(ticket.donationId),
    select: (r) => r.data,
    enabled: !!ticket.donationId,
  });

  const { data: donor } = useQuery({
    queryKey: ['user-by-email', order?.userEmail],
    queryFn: () => usersApi.getByEmail(order.userEmail),
    select: (r) => r.data,
    enabled: !!order?.userEmail,
  });

  // Para incidencias/otros tickets la campaña viene en el ticket (sin order); caer a ticket.campaignId.
  const campaignIdToLoad = order?.campaignId ?? ticket.campaignId;
  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignIdToLoad],
    queryFn: () => catalogApi.getCampaignById(campaignIdToLoad),
    select: (r) => r.data,
    enabled: !!campaignIdToLoad,
  });

  // Owner = user id del dueño de la campaña. Preferir el de la orden (backend nuevo),
  // caer al del campaign para órdenes antiguas (beneficiaryId null).
  const ownerUserId = order?.beneficiaryId ?? campaign?.beneficiaryId;

  const { data: beneficiary } = useQuery({
    queryKey: ['beneficiary-by-user', ownerUserId],
    queryFn: () => usersApi.getBeneficiaryByUserId(ownerUserId),
    select: (r) => r.data,
    enabled: !!ownerUserId,
    retry: false,   // campañas de ORGANIZACION pueden no tener entidad Beneficiary (404)
  });

  const { blobUrl: proofUrl, isLoading: loadingProof } = useAuthImage(
    ['transfer-proof', ticket.donationId],
    () => ordersApi.getTransferProof(ticket.donationId),
    { enabled: !!ticket.donationId && ticket.tipo === 'VALIDACION_TRANSFERENCIA' }
  );

  const approveMutation = useMutation({
    mutationFn: () =>
      ticket.tipo === 'VALIDACION_TRANSFERENCIA'
        ? supportsApi.validateTransfer(ticket.id, true)
        : supportsApi.validateCampaign(ticket.id, true),
    onSuccess: () => { toast.success('Aprobado exitosamente'); onSuccess(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      ticket.tipo === 'VALIDACION_TRANSFERENCIA'
        ? supportsApi.validateTransfer(ticket.id, false, motivo)
        : supportsApi.validateCampaign(ticket.id, false, motivo),
    onSuccess: () => { toast.success('Rechazado'); onSuccess(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const respondMutation = useMutation({
    mutationFn: () => supportsApi.respond(ticket.id, { respuesta }),
    onSuccess: () => { toast.success('Ticket respondido y resuelto'); onSuccess(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isPending = ticket.estado === 'PENDIENTE';
  const isOpen = ticket.estado === 'PENDIENTE' || ticket.estado === 'EN_PROGRESO';
  const donorName = donor
    ? [donor.nombre, donor.apellido].filter(Boolean).join(' ') || donor.email
    : null;
  const beneficiaryName = beneficiary?.user?.name || beneficiary?.user?.email || null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 text-lg">{isValidation ? 'Detalle de validación' : 'Detalle de ticket'}</h2>
            <span className="text-sm text-gray-400">Ticket #{ticket.id}</span>
            <span className="badge-info text-xs">{ticket.tipo?.replace(/_/g, ' ')}</span>
            <StatusBadge status={ticket.estado} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Donación */}
          {ticket.donationId && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Donación #{ticket.donationId}
              </h3>
              {loadingOrder ? (
                <LoadingSpinner />
              ) : order ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {/* Donante */}
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Donante</p>
                      <p className="text-sm font-medium text-gray-900">{donorName || order.userEmail}</p>
                      {donorName && <p className="text-xs text-gray-500">{order.userEmail}</p>}
                    </div>
                  </div>

                  {/* Monto + fecha */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Monto total</p>
                      <p className="font-bold text-primary-700 text-base">
                        ${(order.finalPrice ?? 0).toLocaleString('es-CL')} CLP
                      </p>
                    </div>
                    {order.orderDate && (
                      <div>
                        <p className="text-xs text-gray-400">Fecha</p>
                        <p className="font-medium">
                          {format(new Date(order.orderDate), "d MMM yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Kits donados</p>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.kitNombre || item.kitName || `Kit #${item.kitId}`}
                              {item.quantity > 1 && <span className="text-gray-400"> × {item.quantity}</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No se pudo cargar la donación.</p>
              )}
            </section>
          )}

          {/* Campaña */}
          {campaign && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Campaña</h3>
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-4">
                <HeartIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-0.5">
                  <p className="font-medium text-gray-900">{campaign.titulo}</p>
                  {campaign.motivo && <p className="text-gray-500">Motivo: {campaign.motivo}</p>}
                </div>
              </div>
            </section>
          )}

          {/* Beneficiario */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Beneficiario</h3>
            {ownerUserId ? (
              beneficiary ? (
                <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-4">
                  <BuildingOffice2Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium text-gray-900">{beneficiaryName}</p>
                    {beneficiary.user?.email && <p className="text-gray-500">{beneficiary.user.email}</p>}
                    {beneficiary.rut && <p className="text-gray-500">RUT: {beneficiary.rut}</p>}
                    {beneficiary.estadoVerificacion && (
                      <StatusBadge status={beneficiary.estadoVerificacion} />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Campaña de organización — sin entidad beneficiario registrada.
                </p>
              )
            ) : (
              <p className="text-sm text-gray-400 italic">Sin beneficiario asignado.</p>
            )}
          </section>

          {/* Comprobante de transferencia */}
          {ticket.tipo === 'VALIDACION_TRANSFERENCIA' && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Comprobante</h3>
              {loadingProof ? (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-2 text-sm text-gray-400">
                  <LoadingSpinner size="sm" />
                  <span>Cargando comprobante...</span>
                </div>
              ) : proofUrl ? (
                <div className="bg-gray-50 rounded-xl p-2">
                  <img
                    src={proofUrl}
                    alt="Comprobante de transferencia"
                    className="w-full rounded-lg object-contain max-h-80"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden items-center gap-2 p-3 text-sm text-gray-500">
                    <DocumentIcon className="w-5 h-5" />
                    <span>El comprobante es un PDF u otro formato no previsualizable.</span>
                    <a href={proofUrl} download="comprobante" className="text-primary-600 hover:underline ml-auto">
                      Descargar
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic bg-gray-50 rounded-xl p-4">Sin comprobante subido.</p>
              )}
            </section>
          )}

          {/* Solicitante (tickets no de validación, p.ej. incidencia de entrega) */}
          {!isValidation && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Solicitante</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                {ticket.recipientEmail && <p className="text-gray-700">{ticket.recipientEmail}</p>}
                {ticket.titulo && <p className="text-gray-500">{ticket.titulo}</p>}
                {ticket.donationId && <p className="text-xs text-gray-400">Donación vinculada: #{ticket.donationId}</p>}
              </div>
            </section>
          )}

          {/* Descripción ticket */}
          {ticket.descripcion && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {isValidation ? 'Descripción' : 'Mensaje del solicitante'}
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-line">{ticket.descripcion}</p>
            </section>
          )}

          {/* Respuesta previa */}
          {ticket.respuesta && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Respuesta de soporte</h3>
              <p className="text-sm text-gray-700 bg-green-50 rounded-xl p-4 whitespace-pre-line">{ticket.respuesta}</p>
            </section>
          )}

          {/* Responder y resolver — tickets no de validación */}
          {!isValidation && isOpen && (
            <section className="border-t border-gray-100 pt-4 space-y-3">
              <label className="label">Respuesta a soporte</label>
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={3}
                placeholder="Escribe la respuesta o resolución para el solicitante..."
                className="input-field resize-none"
              />
              <button
                onClick={() => respondMutation.mutate()}
                disabled={respondMutation.isPending || !respuesta.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {respondMutation.isPending ? 'Resolviendo...' : 'Responder y resolver'}
              </button>
            </section>
          )}

          {/* Acciones de validación */}
          {isValidation && isPending && (
            <section className="border-t border-gray-100 pt-4">
              {rejecting ? (
                <div className="space-y-3">
                  <label className="label">Motivo del rechazo</label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={2}
                    placeholder="Explica el motivo del rechazo..."
                    className="input-field resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectMutation.mutate()}
                      disabled={rejectMutation.isPending || !motivo.trim()}
                      className="btn-danger text-sm px-4 py-2"
                    >
                      {rejectMutation.isPending ? 'Rechazando...' : 'Confirmar rechazo'}
                    </button>
                    <button
                      onClick={() => { setRejecting(false); setMotivo(''); }}
                      className="btn-outline text-sm px-4 py-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveMutation.mutate()}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => setRejecting(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-danger-700 text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
