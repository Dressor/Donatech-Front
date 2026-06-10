import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/ui/EmptyState';
import { ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clear } = useCart();
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Carrito de donación</h1>
        <button onClick={() => { if (window.confirm('¿Vaciar el carrito? Se eliminarán todos los kits seleccionados.')) clear(); }} className="text-sm text-danger-600 hover:text-danger-700 font-medium flex items-center gap-1">
          <TrashIcon className="w-4 h-4" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.kitId} className="card flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-blue flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xl font-bold">{item.kit.nombre?.[0] ?? 'K'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{item.kit.nombre}</h3>
                <p className="text-sm text-primary-600 font-medium">
                  ${(item.kit.precioEstimado ?? item.kit.precioBase ?? 0).toLocaleString('es-CL')} CLP c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.kitId, item.cantidad - 1)}
                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <MinusIcon className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.cantidad}</span>
                <button
                  onClick={() => updateQuantity(item.kitId, item.cantidad + 1)}
                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <PlusIcon className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button
                  onClick={() => { if (window.confirm(`¿Quitar "${item.kit.nombre}" del carrito?`)) removeItem(item.kitId); }}
                  className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1 transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5 text-danger-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card h-fit sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">Resumen de donación</h3>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.kitId} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate max-w-[160px]">
                  {item.kit.nombre} × {item.cantidad}
                </span>
                <span className="font-medium">
                  ${((item.kit.precioEstimado ?? item.kit.precioBase ?? 0) * item.cantidad).toLocaleString('es-CL')}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 mb-5">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total estimado</span>
              <span className="text-primary-700">${total.toLocaleString('es-CL')} CLP</span>
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
