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
import { XCircleIcon } from '@heroicons/react/24/solid';
import {
  BanknotesIcon, DocumentArrowUpIcon, DocumentIcon, ChevronRightIcon,
  MegaphoneIcon, UserIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const clp = (n) => `$${(n ?? 0).toLocaleString('es-CL')}`;
const PAGO_LABEL = {
  INGRESADA: 'Pendiente de comprobante',
  EN_VALIDACION_TRANSFERENCIA: 'Validando pago',
  APROBADA: 'Pago aprobado',
  RECHAZADA: 'Pago rechazado',
  CANCELADA: 'Cancelada',
};

export default function DonationAggregatePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [proofFile, setProofFile] = useState(null);

  const { data: donation, isLoading, isError, error } = useQuery({
    queryKey: ['donation', id],
    queryFn: () => ordersApi.getDonation(id),
    select: (r) => r.data,
    refetchInterval: 30000,
  });

  const { data: transferConfig } = useQuery({
    queryKey: ['transfer-config'],
    queryFn: () => ordersApi.getTransferConfig(),
    select: (r) => (r.data?.message ? null : r.data),
    retry: false,
    throwOnError: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['donation', id] });

  const uploadMutation = useMutation({
    mutationFn: (file) => ordersApi.uploadDonationProof(id, file),
    onSuccess: () => { toast.success('¡Comprobante enviado!'); setProofFile(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancelDonation(id, 'Cancelada por el donante', user?.id),
    onSuccess: () => { toast.success('Donación cancelada'); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const estadoPago = donation?.estadoPago;
  const { blobUrl: proofUrl } = useAuthImage(
    ['donation-proof', id],
    () => ordersApi.getDonationProof(id),
    { enabled: !!donation?.transferProofUrl, retry: false }
  );

  if (isLoading) return <LoadingSpinner text="Cargando donación..." />;
  if (isError) {
    const status = error?.response?.status;
    return (
      <div className="text-center py-20 text-gray-500">
        {status === 404 ? 'Donación no encontrada.' : status === 403
          ? 'No tienes permiso para ver esta donación.' : 'No se pudo cargar la donación.'}
      </div>
    );
  }
  if (!donation) return <div className="text-center py-20 text-gray-400">Donación no encontrada</div>;

  const orders = donation.orders ?? [];
  const isOwner = user?.email && donation.userEmail
    && user.email.toLowerCase() === donation.userEmail.toLowerCase();
  const canCancel = isOwner && (estadoPago === 'INGRESADA' || estadoPago === 'EN_VALIDACION_TRANSFERENCIA');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabecera */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1">Donación #{donation.id}</h1>
          <p className="text-gray-500 flex items-center gap-1.5 text-sm">
            <ClockIcon className="w-4 h-4" />
            {donation.fechaCreacion ? format(new Date(donation.fechaCreacion), "d MMM yyyy, HH:mm", { locale: es }) : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={estadoPago} />
          {canCancel && (
            <button
              onClick={() => { if (window.confirm('¿Cancelar esta donación? Se cancelarán sus órdenes.')) cancelMutation.mutate(); }}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-danger-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              <XCircleIcon className="w-4 h-4" />
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
        </div>
      </div>

      <div className="card mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-500">{PAGO_LABEL[estadoPago] ?? estadoPago}</span>
        <span className="font-bold text-primary-700">{clp(donation.total)} CLP</span>
      </div>

      {donation.estadoPago === 'RECHAZADA' && (
        <div className="card mb-6 bg-red-50 border border-red-200 text-sm text-danger-700">
          Pago rechazado{donation.rejectionReason ? `: ${donation.rejectionReason}` : '. El comprobante no fue aprobado.'}
        </div>
      )}

      {/* Subir comprobante si pendiente */}
      {estadoPago === 'INGRESADA' && isOwner && (
        <div className="card mb-6 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <BanknotesIcon className="w-5 h-5 text-amber-700" />
            <h3 className="font-semibold text-amber-800">Sube tu comprobante de pago</h3>
          </div>
          {transferConfig && (
            <div className="rounded-xl bg-gradient-blue text-white p-4 mb-4 grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-blue-200 text-xs">Banco</p><p className="font-medium">{transferConfig.banco}</p></div>
              <div><p className="text-blue-200 text-xs">N° cuenta</p><p className="font-medium">{transferConfig.nroCuenta}</p></div>
              <div><p className="text-blue-200 text-xs">RUT</p><p className="font-medium">{transferConfig.rut}</p></div>
              <div><p className="text-blue-200 text-xs">Monto</p><p className="font-medium">{clp(donation.total)} CLP</p></div>
            </div>
          )}
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer mb-3 ${proofFile ? 'border-primary-400 bg-primary-50' : 'border-amber-300 hover:border-primary-400 hover:bg-white'}`}
          >
            <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">{proofFile ? proofFile.name : 'Haz clic para adjuntar comprobante'}</p>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setProofFile(e.target.files[0])} className="hidden" />
          <button
            onClick={() => { if (!proofFile) { toast.error('Adjunta el comprobante'); return; } uploadMutation.mutate(proofFile); }}
            disabled={uploadMutation.isPending}
            className="btn-primary w-full"
          >
            {uploadMutation.isPending ? 'Enviando...' : 'Enviar comprobante →'}
          </button>
        </div>
      )}

      {/* Comprobante adjunto */}
      {donation.transferProofUrl && proofUrl && (
        <div className="card mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Comprobante de transferencia</p>
          <div className="bg-gray-50 rounded-xl p-2">
            <img src={proofUrl} alt="Comprobante" className="w-full rounded-lg object-contain max-h-80"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div className="hidden items-center gap-2 p-3 text-sm text-gray-500">
              <DocumentIcon className="w-5 h-5" /><span>Archivo no previsualizable.</span>
              <a href={proofUrl} download className="text-primary-600 hover:underline ml-auto">Descargar</a>
            </div>
          </div>
        </div>
      )}

      {/* Órdenes (una por campaña) */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Órdenes de la donación</h3>
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/order/${o.id}`} className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors no-underline">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 flex items-center gap-1.5">
                    <MegaphoneIcon className="w-4 h-4 text-primary-500" />
                    {o.campaignTitulo ?? (o.campaignId ? `Campaña #${o.campaignId}` : 'Campaña')}
                  </p>
                  {o.beneficiaryName && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" /> {o.beneficiaryName}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(o.items?.length ?? 0)} kit(s) · {clp(o.finalPrice)} CLP
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={o.estado} />
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="text-primary-700">{clp(donation.total)} CLP</span>
        </div>
      </div>
    </div>
  );
}
