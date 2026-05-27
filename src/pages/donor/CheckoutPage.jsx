import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api';
import toast from 'react-hot-toast';
import {
  BanknotesIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const BANK_INFO = {
  banco: 'Banco Estado',
  tipo: 'Cuenta Corriente',
  numero: '123-456-789-0',
  rut: '76.543.210-K',
  nombre: 'Donatech SpA',
  email: 'donaciones@donatech.cl',
};

export default function CheckoutPage() {
  const { items, total, campaignId, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const fileRef = useRef();

  if (items.length === 0) {
    navigate('/donor/cart');
    return null;
  }

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        userEmail: user.email,
        campaignId: campaignId || undefined,
        items: items.map((i) => ({ kitId: i.kitId, quantity: i.cantidad })),
        couponCode: coupon || undefined,
      };
      const { data } = await ordersApi.createDonation(payload);
      setOrderId(data.id);
      setStep(2);
      toast.success('¡Orden creada! Ahora sube tu comprobante de pago.');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!file) {
      toast.error('Debes adjuntar el comprobante de transferencia');
      return;
    }
    setLoading(true);
    try {
      await ordersApi.uploadTransferProof(orderId, file);
      clear();
      setStep(3);
      toast.success('¡Comprobante enviado! Tu donación está siendo validada.');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al subir el comprobante');
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

      {/* Step 1: Review */}
      {step === 1 && (
        <div className="space-y-6">
          <h1 className="section-title">Revisar donación</h1>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Kits seleccionados</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.kitId} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.kit.nombre} × {item.cantidad}</span>
                  <span className="font-medium">${((item.kit.precioEstimado ?? item.kit.precioBase ?? 0) * item.cantidad).toLocaleString('es-CL')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary-700">${total.toLocaleString('es-CL')} CLP</span>
            </div>
          </div>

          <div className="card">
            <label className="label">Código de cupón (opcional)</label>
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Ingresa tu código..."
                className="input-field"
              />
              <button className="btn-outline px-4 py-2">Aplicar</button>
            </div>
          </div>

          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-700">
                Al confirmar, se creará tu orden y deberás realizar la transferencia bancaria
                y subir el comprobante en el siguiente paso.
              </p>
            </div>
          </div>

          <button onClick={handleCreateOrder} disabled={loading} className="btn-primary w-full">
            {loading ? 'Procesando...' : 'Confirmar y continuar →'}
          </button>
        </div>
      )}

      {/* Step 2: Upload proof */}
      {step === 2 && (
        <div className="space-y-6">
          <h1 className="section-title">Datos de transferencia</h1>

          <div className="card bg-gradient-blue text-white">
            <div className="flex items-center gap-2 mb-4">
              <BanknotesIcon className="w-5 h-5" />
              <h3 className="font-semibold">Información de pago</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {Object.entries(BANK_INFO).map(([k, v]) => (
                <div key={k}>
                  <p className="text-blue-200 capitalize">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-blue-200">Monto a transferir</p>
                <p className="font-bold text-lg">${total.toLocaleString('es-CL')} CLP</p>
              </div>
            </div>
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
        </div>
      )}

      {/* Step 3: Confirmation */}
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
