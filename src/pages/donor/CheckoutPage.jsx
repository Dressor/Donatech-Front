import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const { items, groups, subtotal, logisticaTotal, total, coupon, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  // Una donación (pago) que agrupa una orden por campaña.
  const [donationId, setDonationId] = useState(null);
  // Snapshot de la orden para mostrar en el paso 2 (el carrito se vacía al confirmar)
  const [snapshot, setSnapshot] = useState({ total: 0 });
  const fileRef = useRef();
  const multiCampaign = groups.length > 1;

  const { data: transferConfig } = useQuery({
    queryKey: ['transfer-config'],
    queryFn: () => ordersApi.getTransferConfig(),
    select: (r) => (r.data?.message ? null : r.data),
    retry: false,
    throwOnError: false,
  });

  if (step === 1 && items.length === 0) {
    navigate('/donor/cart');
    return null;
  }

  // Paso 1: crear UNA donación (una orden por campaña) y vaciar el carrito de inmediato.
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await ordersApi.createDonation({
        userEmail: user.email,
        couponCode: coupon || undefined,
        groups: groups.map((g) => ({
          campaignId: g.campaignId,
          items: g.items.map((i) => ({ kitId: i.kitId, quantity: i.cantidad })),
        })),
      });
      setDonationId(data.id);
      setSnapshot({ total }); // congelar para el paso 2
      clear(); // vaciar carrito ya: evita duplicar la donación
      setStep(2);
      toast.success(
        multiCampaign
          ? `¡Donación creada con ${groups.length} órdenes! Ahora sube tu comprobante de pago.`
          : '¡Donación creada! Ahora sube tu comprobante de pago.'
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: subir un comprobante a la donación (cubre todas sus órdenes) → EN_VALIDACION_TRANSFERENCIA
  const handleUploadProof = async () => {
    if (!file) {
      toast.error('Debes adjuntar el comprobante de transferencia');
      return;
    }
    setLoading(true);
    try {
      await ordersApi.uploadDonationProof(donationId, file);
      setStep(3);
      toast.success('¡Comprobante enviado! Tu donación está siendo validada.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step >= s ? 'text-primary-700' : 'text-gray-400'}`}>
              {s === 1 ? 'Revisar' : s === 2 ? 'Comprobante' : 'Confirmado'}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-primary-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Revisar y confirmar */}
      {step === 1 && (
        <div className="space-y-6">
          <h1 className="section-title">Revisar donación</h1>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Kits seleccionados</h3>
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.campaignId ?? 'sin-campana'}>
                  {multiCampaign && (
                    <p className="text-xs font-medium text-gray-500 mb-1">{g.campaignNombre ?? 'Sin campaña'}</p>
                  )}
                  {g.items.map((item) => (
                    <div key={`${g.campaignId}:${item.kitId}`} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.kit.nombre} × {item.cantidad}</span>
                      <span className="font-medium">${((item.kit.precioEstimado ?? item.kit.precioBase ?? 0) * item.cantidad).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                  {g.campaignLogistica > 0 && (
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>Logística ({g.unidades} × ${g.campaignLogistica.toLocaleString('es-CL')})</span>
                      <span>${g.logisticaTotal.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Productos</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
              </div>
              {logisticaTotal > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Logística total</span>
                  <span>${logisticaTotal.toLocaleString('es-CL')}</span>
                </div>
              )}
              {coupon && (
                <div className="flex justify-between text-sm text-primary-700">
                  <span>Cupón aplicado{multiCampaign ? ' (1ª orden)' : ''}</span>
                  <span className="font-medium">{coupon}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-1.5 border-t border-gray-100">
                <span>Total</span>
                <span className="text-primary-700">${total.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-700">
                {multiCampaign
                  ? `Al confirmar se crearán ${groups.length} órdenes (una por campaña) y se vaciará el carrito. Con una sola transferencia por el total y un comprobante cubres todas.`
                  : 'Al confirmar se creará tu orden y se vaciará el carrito. Luego deberás realizar la transferencia y subir el comprobante en el siguiente paso.'}
              </p>
            </div>
          </div>

          <button onClick={handleConfirm} disabled={loading} className="btn-primary w-full">
            {loading ? 'Procesando...' : 'Confirmar donación →'}
          </button>
        </div>
      )}

      {/* Step 2: subir comprobante */}
      {step === 2 && (
        <div className="space-y-6">
          <h1 className="section-title">Datos de transferencia</h1>

          <div className="card bg-gradient-blue text-white">
            <div className="flex items-center gap-2 mb-4">
              <BanknotesIcon className="w-5 h-5" />
              <h3 className="font-semibold">Información de pago</h3>
            </div>
            {transferConfig ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-200">Banco</p>
                  <p className="font-medium">{transferConfig.banco}</p>
                </div>
                <div>
                  <p className="text-blue-200">Tipo de cuenta</p>
                  <p className="font-medium">{transferConfig.tipoCuenta}</p>
                </div>
                <div>
                  <p className="text-blue-200">Número de cuenta</p>
                  <p className="font-medium">{transferConfig.nroCuenta}</p>
                </div>
                <div>
                  <p className="text-blue-200">RUT</p>
                  <p className="font-medium">{transferConfig.rut}</p>
                </div>
                <div>
                  <p className="text-blue-200">Beneficiario</p>
                  <p className="font-medium">{transferConfig.nombreBeneficiario}</p>
                </div>
                {transferConfig.email && (
                  <div>
                    <p className="text-blue-200">Email</p>
                    <p className="font-medium">{transferConfig.email}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-blue-200">Monto a transferir</p>
                  <p className="font-bold text-lg">${snapshot.total.toLocaleString('es-CL')} CLP</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-blue-100">
                <p className="italic mb-2">Datos de transferencia no configurados. Contacta al administrador.</p>
                <p className="text-blue-200">Monto a transferir</p>
                <p className="font-bold text-lg">${snapshot.total.toLocaleString('es-CL')} CLP</p>
              </div>
            )}
          </div>

          <div className="card">
            <label className="label">Adjuntar comprobante de transferencia</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
            >
              <DocumentArrowUpIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              {file ? (
                <p className="text-sm font-medium text-primary-700">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Haz clic para seleccionar</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG (max. 10MB)</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          <button onClick={handleUploadProof} disabled={loading || !file} className="btn-primary w-full">
            {loading ? 'Subiendo...' : 'Enviar comprobante →'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            ¿Aún no transfieres? Tu orden quedó guardada en "Mis Donaciones" y puedes subir el comprobante
            más tarde desde su detalle.
          </p>
        </div>
      )}

      {/* Step 3: confirmación */}
      {step === 3 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Donación enviada!</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">
            Tu comprobante está siendo revisado por nuestro equipo. Recibirás una notificación
            cuando sea aprobado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/donor/history')} className="btn-primary">
              Ver mis donaciones
            </button>
            <button onClick={() => navigate('/campaigns')} className="btn-outline">
              Explorar más campañas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
