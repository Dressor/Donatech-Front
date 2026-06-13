import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import LoadingSpinner from './LoadingSpinner';
import { XMarkIcon, CubeIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function KitDetailModal({ kitId, onClose }) {
  const { data: kit, isLoading } = useQuery({
    queryKey: ['kit-detail', kitId],
    queryFn: () => catalogApi.getKitById(kitId),
    select: (r) => r.data,
    enabled: !!kitId,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 text-lg">
              {kit?.nombre ?? 'Detalle del kit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : !kit ? (
          <div className="p-8 text-center text-gray-400">No se pudo cargar el kit.</div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Kit image — hover amplía */}
            {kit.hasImage && (
              <div className="overflow-hidden rounded-xl">
                <img
                  src={`/api/kits/${kit.id}/image`}
                  alt={kit.nombre}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Kit info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {kit.descripcion && (
                  <p className="text-sm text-gray-600 leading-relaxed">{kit.descripcion}</p>
                )}
              </div>
              {kit.precioEstimado > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Precio estimado</p>
                  <p className="text-lg font-bold text-primary-700">
                    ${kit.precioEstimado.toLocaleString('es-CL')}
                    <span className="text-xs font-normal text-gray-400 ml-1">CLP</span>
                  </p>
                </div>
              )}
            </div>

            {/* Products */}
            {kit.items?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Contenido del kit ({kit.items.length} {kit.items.length === 1 ? 'producto' : 'productos'})
                </p>
                <div className="space-y-2">
                  {kit.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      {/* Product image con preview hover */}
                      <div className="relative group flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                          {item.productHasImage ? (
                            <img
                              src={`/api/products/${item.productId}/image`}
                              alt={item.productNombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <PhotoIcon
                            className="w-6 h-6 text-gray-400"
                            style={{ display: item.productHasImage ? 'none' : 'block' }}
                          />
                        </div>

                        {/* Preview popup al hacer hover */}
                        {item.productHasImage && (
                          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block pointer-events-none">
                            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden w-36 h-36">
                              <img
                                src={`/api/products/${item.productId}/image`}
                                alt={item.productNombre}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-center text-gray-600 mt-1 bg-white/90 rounded px-1 truncate max-w-36">
                              {item.productNombre}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {item.productNombre}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: <span className="font-semibold text-gray-700">{item.cantidadRequerida}</span>
                        </p>
                      </div>

                      {/* Price */}
                      {item.productPrecio > 0 && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-800">
                            ${item.productPrecio.toLocaleString('es-CL')}
                          </p>
                          <p className="text-xs text-gray-400">c/u</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn-secondary w-full text-sm"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
