import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { kitIaApi, catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import {
  XMarkIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const FASE_CHAT = 'chat';
const FASE_KIT = 'kit';

/**
 * Chat conversacional asistido por IA para crear un kit personalizado (USO_UNICO)
 * vinculado a la campaña del afectado.
 */
export default function AIChatModal({
  campaignId,
  nombreAfectado,
  tituloCampana,
  descripcionCampana,
  onClose,
  onConfirmed,
  onUnavailable,
}) {
  const [fase, setFase] = useState(FASE_CHAT);
  const [sesionId, setSesionId] = useState(null);
  const [mensajes, setMensajes] = useState([]); // {rol: 'assistant'|'user', texto}
  const [input, setInput] = useState('');
  const [listo, setListo] = useState(false);
  const [kit, setKit] = useState(null); // {nombre_kit, descripcion_kit, productos[]}
  const [meta, setMeta] = useState(1); // cuántos de estos kits necesita
  const scrollRef = useRef(null);

  /* ── Iniciar sesión al montar ── */
  const iniciarMutation = useMutation({
    mutationFn: () =>
      kitIaApi.iniciarSesion({
        campana_id: Number(campaignId),
        nombre_afectado: nombreAfectado,
        titulo_campana: tituloCampana,
        descripcion_campana: descripcionCampana,
      }),
    onSuccess: (r) => {
      const d = r.data;
      setSesionId(d.sesion_id);
      setMensajes([{ rol: 'assistant', texto: d.mensaje_asistente }]);
      setListo(d.listo_para_generar);
    },
    onError: () => {
      // El ms de IA no respondió: caer al formulario manual.
      toast.error('El asistente IA no está disponible. Abriendo creación manual.');
      onUnavailable?.();
    },
  });

  useEffect(() => {
    iniciarMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [mensajes]);

  /* ── Enviar mensaje ── */
  const mensajeMutation = useMutation({
    mutationFn: (texto) =>
      kitIaApi.enviarMensaje({ sesion_id: sesionId, mensaje_usuario: texto }),
    onSuccess: (r) => {
      const d = r.data;
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: d.mensaje_asistente }]);
      setListo(d.listo_para_generar);
    },
    onError: () => {
      toast.error('El asistente IA falló. Continúa creando tu kit manualmente.');
      onUnavailable?.();
    },
  });

  const enviar = () => {
    const texto = input.trim();
    if (!texto || mensajeMutation.isPending) return;
    setMensajes((prev) => [...prev, { rol: 'user', texto }]);
    setInput('');
    mensajeMutation.mutate(texto);
  };

  /* ── Generar kit ── */
  const generarMutation = useMutation({
    mutationFn: () => kitIaApi.generarKit(sesionId),
    onSuccess: (r) => {
      setKit(r.data);
      setFase(FASE_KIT);
    },
    onError: () => {
      toast.error('No se pudo generar el kit con IA. Continúa manualmente.');
      onUnavailable?.();
    },
  });

  /* ── Confirmar kit ── */
  const confirmarMutation = useMutation({
    mutationFn: () =>
      kitIaApi.confirmarKit({
        sesion_id: sesionId,
        nombre_kit: kit.nombre_kit,
        descripcion_kit: kit.descripcion_kit,
        campana_id: Number(campaignId),
        cantidad_necesaria: Number(meta) || 1,
        productos: kit.productos.map((p) => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
        })),
      }),
    onSuccess: (r) => {
      toast.success('Kit personalizado creado y vinculado a tu campaña');
      onConfirmed?.(r.data);
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  /* ── Edición del kit ── */
  const cambiarCantidad = (productoId, cantidad) => {
    setKit((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        p.producto_id === productoId
          ? { ...p, cantidad: Math.max(1, cantidad), subtotal: Math.max(1, cantidad) * p.precio_unitario }
          : p
      ),
    }));
  };

  const quitarProducto = (productoId) => {
    setKit((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => p.producto_id !== productoId),
    }));
  };

  const montoTotal = kit?.productos.reduce((acc, p) => acc + p.precio_unitario * p.cantidad, 0) ?? 0;

  const cerrar = () => {
    if (sesionId) kitIaApi.cerrarSesion(sesionId).catch(() => {});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 text-lg">
              {fase === FASE_CHAT ? 'Asistente de kit personalizado' : 'Tu kit propuesto'}
            </h2>
          </div>
          <button
            onClick={cerrar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ── Fase chat ── */}
        {fase === FASE_CHAT && (
          <>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3">
              {iniciarMutation.isPending && (
                <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
              )}
              {mensajes.map((m, i) => (
                <div key={i} className={`flex ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      m.rol === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {m.texto}
                  </div>
                </div>
              ))}
              {mensajeMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-400 rounded-2xl px-4 py-2 text-sm">…</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-3">
              {listo ? (
                <button
                  onClick={() => generarMutation.mutate()}
                  disabled={generarMutation.isPending}
                  className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {generarMutation.isPending ? 'Generando kit...' : 'Generar mi kit'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') enviar(); }}
                    placeholder="Escribe tu respuesta..."
                    disabled={mensajeMutation.isPending || iniciarMutation.isPending}
                    className="input-field flex-1"
                  />
                  <button
                    onClick={enviar}
                    disabled={mensajeMutation.isPending || !input.trim()}
                    className="btn-primary px-3 flex items-center"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Fase kit editable ── */}
        {fase === FASE_KIT && kit && (
          <KitEditor
            kit={kit}
            montoTotal={montoTotal}
            meta={meta}
            onMetaChange={setMeta}
            onCambiarCantidad={cambiarCantidad}
            onQuitar={quitarProducto}
            onAgregar={(prod) =>
              setKit((prev) => ({
                ...prev,
                productos: [
                  ...prev.productos,
                  {
                    producto_id: prod.id,
                    nombre: prod.nombre,
                    cantidad: 1,
                    precio_unitario: prod.precio,
                    subtotal: prod.precio,
                  },
                ],
              }))
            }
            onConfirmar={() => confirmarMutation.mutate()}
            confirmando={confirmarMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

/* Sub-componente: edición del kit antes de confirmar */
function KitEditor({ kit, montoTotal, meta, onMetaChange, onCambiarCantidad, onQuitar, onAgregar, onConfirmar, confirmando }) {
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const idsActuales = new Set(kit.productos.map((p) => p.producto_id));

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos-disponibles'],
    queryFn: () => catalogApi.getProducts({ page: 0, size: 100 }),
    select: (r) => (Array.isArray(r.data) ? r.data : r.data?.content ?? []),
    enabled: mostrarAgregar,
  });

  const disponibles = productos.filter((p) => !idsActuales.has(p.id));

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
        <div>
          <p className="font-semibold text-gray-900">{kit.nombre_kit}</p>
          {kit.descripcion_kit && (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{kit.descripcion_kit}</p>
          )}
        </div>

        <div className="space-y-2">
          {kit.productos.map((p) => (
            <div key={p.producto_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{p.nombre}</p>
                <p className="text-xs text-gray-500">
                  ${p.precio_unitario.toLocaleString('es-CL')} c/u
                </p>
              </div>
              <input
                type="number"
                min="1"
                value={p.cantidad}
                onChange={(e) => onCambiarCantidad(p.producto_id, Number(e.target.value))}
                className="input-field w-16 text-center text-sm py-1"
              />
              <button
                onClick={() => onQuitar(p.producto_id)}
                className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                title="Quitar producto"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Agregar producto */}
        {!mostrarAgregar ? (
          <button
            onClick={() => setMostrarAgregar(true)}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" />
            Agregar producto
          </button>
        ) : isLoading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <select
            className="input-field text-sm"
            defaultValue=""
            onChange={(e) => {
              const prod = disponibles.find((p) => p.id === e.target.value);
              if (prod) onAgregar(prod);
              setMostrarAgregar(false);
            }}
          >
            <option value="">Selecciona un producto...</option>
            {disponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — ${p.precio?.toLocaleString('es-CL')}
              </option>
            ))}
          </select>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">
            ¿Cuántos de estos kits necesitas? (meta)
          </label>
          <input
            type="number"
            min="1"
            value={meta}
            onChange={(e) => onMetaChange(Math.max(1, Number(e.target.value) || 1))}
            className="input-field w-32 mt-1"
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Monto total (productos)</span>
          <span className="text-lg font-bold text-primary-700">
            ${montoTotal.toLocaleString('es-CL')}
            <span className="text-xs font-normal text-gray-400 ml-1">CLP</span>
          </span>
        </div>
        <button
          onClick={onConfirmar}
          disabled={confirmando || kit.productos.length === 0}
          className="btn-primary w-full text-sm"
        >
          {confirmando ? 'Creando kit...' : 'Confirmar y crear kit'}
        </button>
      </div>
    </>
  );
}
