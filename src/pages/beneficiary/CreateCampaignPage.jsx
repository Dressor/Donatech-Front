import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi, usersApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [comunas, setComunas] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const regionId = watch('regionId');

  const { data: kits = [] } = useQuery({
    queryKey: ['kits'],
    queryFn: () => catalogApi.getKits(),
    select: (r) => r.data ?? [],
  });

  useEffect(() => {
    usersApi.getRegions().then((r) => setRegions(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (regionId) {
      usersApi.getComunasByRegion(regionId).then((r) => setComunas(r.data ?? [])).catch(() => {});
    }
  }, [regionId]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        beneficiaryId: user.id,
        regionId: data.regionId || undefined,
        comunaId: data.comunaId || undefined,
      };
      await catalogApi.createCampaign(payload);
      toast.success('¡Campaña creada! Está en revisión por nuestro equipo.');
      navigate('/beneficiary/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear la campaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="section-title mb-2">Crear campaña de ayuda</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Completa el formulario para que nuestros validadores revisen tu solicitud.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div>
          <label className="label">Título de la campaña</label>
          <input
            {...register('titulo', { required: 'El título es requerido' })}
            placeholder="Familia damnificada por aluvión en Atacama"
            className="input-field"
          />
          {errors.titulo && <p className="text-xs text-danger-600 mt-1">{errors.titulo.message}</p>}
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            {...register('descripcion', { required: 'La descripción es requerida' })}
            rows={4}
            placeholder="Describe tu situación con detalle..."
            className="input-field resize-none"
          />
          {errors.descripcion && <p className="text-xs text-danger-600 mt-1">{errors.descripcion.message}</p>}
        </div>

        <div>
          <label className="label">Motivo principal</label>
          <input
            {...register('motivo', { required: 'El motivo es requerido' })}
            placeholder="Ej: Incendio, inundación, cesantía, enfermedad..."
            className="input-field"
          />
          {errors.motivo && <p className="text-xs text-danger-600 mt-1">{errors.motivo.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Región</label>
            <select {...register('regionId')} className="input-field">
              <option value="">Selecciona región</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre ?? r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Comuna</label>
            <select {...register('comunaId')} className="input-field" disabled={!regionId}>
              <option value="">Selecciona comuna</option>
              {comunas.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre ?? c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Observaciones adicionales</label>
          <textarea
            {...register('observaciones')}
            rows={2}
            placeholder="Información adicional relevante..."
            className="input-field resize-none"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando...
            </span>
          ) : (
            'Enviar campaña para revisión'
          )}
        </button>
      </form>
    </div>
  );
}
