const statusMap = {
  // Order/Donation
  DRAFT: { label: 'Borrador', cls: 'badge-gray' },
  INGRESADA: { label: 'Ingresada', cls: 'badge-info' },
  EN_VALIDACION_TRANSFERENCIA: { label: 'En Validación', cls: 'badge-warning' },
  EN_PREPARACION: { label: 'En Preparación', cls: 'badge-info' },
  ASIGNADA_ENVIO: { label: 'Asignada Envío', cls: 'badge-info' },
  EN_CAMINO: { label: 'En Camino', cls: 'badge-warning' },
  PENDIENTE_CONFIRMACION: { label: 'Pendiente Confirmación', cls: 'badge-warning' },
  ENTREGADA: { label: 'Entregada', cls: 'badge-success' },
  CANCELADA: { label: 'Cancelada', cls: 'badge-danger' },
  RECHAZADA: { label: 'Rechazada', cls: 'badge-danger' },
  // Campaign
  EN_VALIDACION: { label: 'En Validación', cls: 'badge-warning' },
  ACTIVA: { label: 'Activa', cls: 'badge-success' },
  INACTIVA: { label: 'Inactiva', cls: 'badge-gray' },
  FINALIZADA: { label: 'Finalizada', cls: 'badge-gray' },
  // Support (EstadoSoporte backend)
  EN_PROGRESO: { label: 'En Progreso', cls: 'badge-warning' },
  RESUELTO: { label: 'Resuelto', cls: 'badge-success' },
  CANCELADO: { label: 'Cancelado', cls: 'badge-danger' },
  CERRADO: { label: 'Cerrado', cls: 'badge-gray' },
  // Beneficiary
  PENDIENTE: { label: 'Pendiente', cls: 'badge-warning' },
  VERIFICADO: { label: 'Verificado', cls: 'badge-success' },
};

export default function StatusBadge({ status }) {
  const config = statusMap[status] ?? { label: status, cls: 'badge-gray' };
  return <span className={config.cls}>{config.label}</span>;
}
