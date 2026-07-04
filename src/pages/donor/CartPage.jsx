import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/ui/EmptyState';
import { ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const clp = (n) => `$${(n ?? 0).toLocaleString('es-CL')}`;

export default function CartPage() {
  const { items, groups, removeItem, updateQuantity, subtotal, logisticaTotal, total, clear, coupon, setCoupon } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingCartIcon}
          title="Tu carrito está vacío"
          description="Explora las campañas activas y agrega kits para donar."
          action={
            <Link to="/campaigns" className="btn-primary">
              Ver campañas
            </Link>
          }
        />
      </div>
    );
  }

  const multiCampaign = groups.length > 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Carrito de donación</h1>
        <button onClick={() => { if (window.confirm('¿Vaciar el carrito? Se eliminarán todos los kits seleccionados.')) clear(); }} className="text-sm text-danger-600 hover:text-danger-700 font-medium flex items-center gap-1">
          <TrashIcon className="w-4 h-4" />
          Vaciar carrito
        </button>
      </div>

      {multiCampaign && (
        <div className="card bg-blue-50 border border-blue-200 mb-6 flex items-start gap-2">
          <MegaphoneIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary-700">
            Tu carrito tiene kits de <strong>{groups.length} campañas</strong>. Se creará una donación
            por cada campaña (cada una con su propia logística y beneficiario).
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items agrupados por campaña */}
        <div className="lg:col-span-2 space-y-6">
          {groups.map((g) => (
            <div key={g.campaignId ?? 'sin-campana'} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <MegaphoneIcon className="w-4 h-4 text-primary-500" />
                <h2 className="font-semibold text-gray-800 text-sm">{g.campaignNombre ?? 'Sin campaña'}</h2>
              </div>
              {g.items.map((item) => (
                <div key={`${g.campaignId}:${item.kitId}`} className="card flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-blue flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{item.kit.nombre?.[0] ?? 'K'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.kit.nombre}</h3>
                    <p className="text-sm text-primary-600 font-medium">
                      {clp(item.kit.precioEstimado ?? item.kit.precioBase ?? 0)} CLP c/u
                    </p>
                    {item.maxCantidad != null && item.cantidad >= item.maxCantidad && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        Máximo {item.maxCantidad} para este kit (lo que la campaña necesita)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(g.campaignId, item.kitId, item.cantidad - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <MinusIcon className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(g.campaignId, item.kitId, item.cantidad + 1)}
                      disabled={item.maxCantidad != null && item.cantidad >= item.maxCantidad}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`¿Quitar "${item.kit.nombre}" del carrito?`)) removeItem(g.campaignId, item.kitId); }}
                      className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-danger-600" />
                    </button>
                  </div>
                </div>
              ))}
              {g.campaignLogistica > 0 && (
                <p className="text-xs text-gray-400 px-1">
                  Logística: {g.unidades} {g.unidades === 1 ? 'kit' : 'kits'} × {clp(g.campaignLogistica)} = {clp(g.logisticaTotal)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card h-fit sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen de donación</h3>
          <div className="space-y-3 mb-4">
            {groups.map((g) => (
              <div key={g.campaignId ?? 'sin-campana'}>
                {multiCampaign && (
                  <p className="text-xs font-medium text-gray-500 mb-1 truncate">{g.campaignNombre ?? 'Sin campaña'}</p>
                )}
                {g.items.map((item) => (
                  <div key={`${g.campaignId}:${item.kitId}`} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[160px]">
                      {item.kit.nombre} × {item.cantidad}
                    </span>
                    <span className="font-medium">
                      {clp((item.kit.precioEstimado ?? item.kit.precioBase ?? 0) * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* Cupón (opcional) */}
          <div className="mb-4">
            <label className="label">Código de cupón (opcional)</label>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Ingresa tu código..."
              className="input-field"
            />
            {multiCampaign && coupon && (
              <p className="text-xs text-gray-400 mt-1">El cupón se aplica a la primera donación.</p>
            )}
          </div>
          <div className="border-t border-gray-100 pt-3 mb-5 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Productos</span>
              <span>{clp(subtotal)}</span>
            </div>
            {logisticaTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Logística</span>
                <span>{clp(logisticaTotal)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
              <span>Total estimado</span>
              <span className="text-primary-700">{clp(total)} CLP</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/donor/checkout')}
            className="btn-primary w-full"
          >
            Proceder al pago →
          </button>
          <Link to="/campaigns" className="text-center text-sm text-gray-500 hover:text-primary-600 mt-3 block">
            Seguir explorando campañas
          </Link>
        </div>
      </div>
    </div>
  );
}
