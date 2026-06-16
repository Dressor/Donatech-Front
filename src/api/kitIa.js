import api from './axios';

// El LLM (sobre todo Ollama en CPU) puede tardar bastante por respuesta;
// se sobreescribe el timeout global de axios (15s) en las llamadas que invocan al modelo.
const LLM_TIMEOUT = 180000; // 3 min

// Microservicio IA (Python) expuesto vía gateway en /api/kit-ia/**
export const kitIaApi = {
  iniciarSesion: (data) => api.post('/api/kit-ia/sesion/iniciar', data, { timeout: LLM_TIMEOUT }),
  enviarMensaje: (data) => api.post('/api/kit-ia/sesion/mensaje', data, { timeout: LLM_TIMEOUT }),
  generarKit: (sesionId) =>
    api.post('/api/kit-ia/kit/generar', { sesion_id: sesionId }, { timeout: LLM_TIMEOUT }),
  confirmarKit: (data) => api.post('/api/kit-ia/kit/confirmar', data, { timeout: 30000 }),
  cerrarSesion: (sesionId) => api.delete(`/api/kit-ia/sesion/${sesionId}`),
};
