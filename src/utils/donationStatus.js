// Estado "real" de una donación para mostrar en listados.
//
// `estadoPago` (INGRESADA → EN_VALIDACION_TRANSFERENCIA → APROBADA…) es el ciclo del PAGO
// y se queda en APROBADA aunque las órdenes ya avancen y se entreguen. Para el listado
// queremos reflejar el avance logístico real, derivado de las órdenes hijas.

// Progreso de una orden, de menos a más avanzado.
const ORDER_PROGRESS = [
  'EN_PREPARACION',
  'ASIGNADA_ENVIO',
  'EN_CAMINO',
  'PENDIENTE_CONFIRMACION',
  'ENTREGADA',
];
const ORDER_TERMINAL = ['ENTREGADA', 'CANCELADA', 'RECHAZADA'];

/**
 * Devuelve el estado a mostrar para una donación.
 * - Antes de aprobar el pago: se usa el propio estadoPago (INGRESADA, RECHAZADA, etc.).
 * - Aprobada: se deriva de las órdenes. Todas entregadas → ENTREGADA; si no, la orden
 *   activa menos avanzada (el "cuello de botella" que representa el estado global).
 */
export function donationDisplayStatus(d) {
  const pago = d?.estadoPago ?? d?.estado;
  if (pago !== 'APROBADA') return pago;

  const estados = (d?.orders ?? []).map((o) => o.estado ?? o.status).filter(Boolean);
  if (estados.length === 0) return pago;

  const activos = estados.filter((e) => !['CANCELADA', 'RECHAZADA'].includes(e));
  if (activos.length === 0) return estados[0]; // todas canceladas/rechazadas
  if (activos.every((e) => e === 'ENTREGADA')) return 'ENTREGADA';

  const pendientes = activos.filter((e) => !ORDER_TERMINAL.includes(e));
  const pool = pendientes.length > 0 ? pendientes : activos;
  return [...pool].sort(
    (a, b) => ORDER_PROGRESS.indexOf(a) - ORDER_PROGRESS.indexOf(b)
  )[0];
}
