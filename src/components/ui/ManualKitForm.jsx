import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import { XMarkIcon, CubeIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const BASE = 'Kit Personalizado';

export function siguienteNombrePersonalizado(existingKits) {
  const n = (existingKits || []).filter(
    (k) => (k.kitNombre || '').trim().startsWith(BASE)
  ).length;
  return n === 0 ? BASE : `${BASE} ${n + 1}`;
}

/**
 * Formulario manual de kit personalizado (USO_UNICO) — fallback cuando el
 * asistente IA no está disponible. Crea el kit y lo vincula a la campaña.
 */
export default function ManualKitForm({ campaignId, existingKits, onClose, onConfirmed }) {
  const [items, setItems] = useState([]);
  const [selProd, setSelProd] = useState('');
  const [selQty, setSelQty] = useState(1);
  const [meta, setMeta] = useState(1);
  const [descripcion, setDescripcion] = useState('');

  const nombre = siguienteNombrePersonalizado(existingKits);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productos-disponibles'],
    queryFn: () => catalogApi.getProducts({ page: 0, size: 100 }),
    select: (r) => (Array.isArray(r.data) ? r.data : r.data?.content ?? []),
  });

  const total = items.reduce((s, i) => s + (i.precio ?? 0) * i.cantidadRequerida, 0);

  const addItem = () => {
    if (!selProd) return;
    const p = products.find((x) => String(x.id) === String(selProd));
    if (!p) return;
    if (items.some((i) => String(i.productId) === String(p.id))) {
      toast.error('Ese producto ya está en el kit');
      return;
    }
    setItems((prev) => [...prev, {
      productId: p.id, nombre: p.nombre, precio: p.precio, cantidadRequerida: Number(selQty) || 1,
    }]);
    setSelProd('');
    setSelQty(1);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => String(i.productId) !== String(id)));

  const crearMutation = useMutation({
    mutationFn: async () => {
      const res = await catalogApi.createPersonalizedKit({
        nombre,
        descripcion,
        items: items.map(({ productId, cantidadRequerida }) => ({ productId, cantidadRequerida })),
      });
      const kitId = res.data?.id;
      if (!kitId) throw new Error('No se pudo crear el kit');
      await catalogApi.addKitToCampaign(campaignId, {
        kitId: Number(kitId),
        cantidadNecesaria: Number(meta) || 1,
      });
      return kitId;
    },
    onSuccess: () => {
      toast.success('Kit personalizado creado y vinculado a tu campaña');
      onConfirmed?.();
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CubeIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 text-lg">Crear kit personalizado</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          <p className="text-sm text-gray-500">
            El asistente con IA no está disponible. Arma tu kit manualmente.
          </p>

          <div>
            <label className="label">Nombre</label>
            <input value={nombre} disabled className="input-field bg-gray-50 text-gray-500" />
          </div>

          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="input-field resize-none"
              placeholder="Describe brevemente el kit"
            />
          </div>

          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Productos *</p>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="label">Producto</label>
                  <select value={selProd} onChange={(e) => setSelProd(e.target.value)} className="input-field">
                    <option value="">Selecciona...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${p.precio?.toLocaleString('es-CL')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="label">Cant.</label>
                  <input type="number" min="1" value={selQty} onChange={(e) => setSelQty(e.target.value)} className="input-field" />
                </div>
                <button type="button" onClick={addItem} disabled={!selProd} className="btn-outline text-sm h-10 px-3">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {items.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin productos. Agrega al menos uno.</p>
            ) : (
              <div className="space-y-1">
                {items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-gray-800">{it.nombre} <span className="text-gray-400">× {it.cantidadRequerida}</span></span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs">${((it.precio ?? 0) * it.cantidadRequerida).toLocaleString('es-CL')}</span>
                      <button type="button" onClick={() => removeItem(it.productId)} className="text-danger-500 hover:text-danger-700">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">¿Cuántos de estos kits necesitas? (meta)</label>
            <input type="number" min="1" value={meta} onChange={(e) => setMeta(e.target.value)} className="input-field w-32" />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Monto por kit (productos)</span>
            <span className="text-lg font-bold text-primary-700">
              ${total.toLocaleString('es-CL')}<span className="text-xs font-normal text-gray-400 ml-1">CLP</span>
            </span>
          </div>
          <button
            onClick={() => crearMutation.mutate()}
            disabled={crearMutation.isPending || items.length === 0}
            className="btn-primary w-full text-sm"
          >
            {crearMutation.isPending ? 'Creando...' : 'Crear kit'}
          </button>
        </div>
      </div>
    </div>
  );
}
