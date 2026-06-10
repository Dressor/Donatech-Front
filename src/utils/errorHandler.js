export function getErrorMessage(err) {
  if (!err?.response) return 'Sin conexión con el servidor. Verifica tu red.';
  const { status, data } = err.response;

  if (data?.message) return data.message;

  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).join(' · ');
  }

  // Mapa plano {fieldName: "msg"} sin clave message ni errors
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const values = Object.values(data).filter(v => typeof v === 'string');
    if (values.length > 0) return values[0];
  }

  switch (status) {
    case 400: return 'Datos inválidos. Revisa el formulario.';
    case 401: return 'No autorizado. Verifica tus credenciales.';
    case 403: return 'No tienes permiso para realizar esta acción.';
    case 404: return 'El recurso solicitado no existe.';
    case 409: return 'Ya existe un registro con esos datos.';
    case 422: return 'Datos incorrectos. Revisa los campos.';
    case 500: return 'Error en el servidor. Intenta más tarde.';
    case 503: return 'Servicio no disponible. Intenta más tarde.';
    default:  return `Error inesperado (${status}). Intenta nuevamente.`;
  }
}
