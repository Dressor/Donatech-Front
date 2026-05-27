import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import { PlusIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function AdminCatalogPage() {
  const [tab, setTab] = useState('kits');
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: kits = [], isLoading: kitsLoading } = useQuery({
    queryKey: ['admin-kits'],
    queryFn: () => catalogApi.getKits(),
    select: (r) => r.data ?? [],
  });

  const { data: campaigns = [], isLoading: campLoading } = useQuery({
    queryKey: ['admin-campaigns-all'],
    queryFn: () => catalogApi.getCampaigns(),
    select: (r) => r.data ?? [],
  });

  const closeMutation = useMutation({
    mutationFn: (id) => catalogApi.closeCampaign(id),
    onSuccess: () => {
      toast.success('Campaña cerrada');
      queryClient.invalidateQueries(['admin-campaigns-all']);
    },
  });

  const createKitMutation = useMutation({
    mutationFn: (data) => catalogApi.createKit(data),
    onSuccess: () => {
      toast.success('Kit creado');
      queryClient.invalidateQueries(['admin-kits']);
      setShowForm(false);
      reset();
    },
    onError: () => toast.error('Error al crear kit'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Catálogo</h1>
        <p className="text-gray-500">Gestiona kits de emergencia y campañas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[{ key: 'kits', label: 'Kits' }, { key: 'campaigns', label: 'Campañas' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Kits Tab */}
      {tab === 'kits' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo kit
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit((d) => createKitMutation.mutate(d))}
              className="card mb-4 space-y-4"
            >
              <h3 className="font-semibold text-gray-800">Crear nuevo kit</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre</label>
                  <input {...register('nombre', { required: true })} className="input-field" placeholder="Kit Alimentación" />
                </div>
                <div>
                  <label className="label">Precio estimado (CLP)</label>
                  <input {...register('precioEstimado')} type="number" className="input-field" placeholder="25000" />
                </div>
                <div className="col-span-2">
                  <label className="label">Descripción</label>
                  <textarea {...register('descripcion')} rows={2} className="input-field resize-none" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Crear kit</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm">Cancelar</button>
              </div>
            </form>
          )}

          {kitsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kits.map((kit) => (
                <div key={kit.id} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center flex-shrink-0">
                      <CubeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{kit.nombre}</h3>
                      {kit.precioEstimado && (
                        <p className="text-xs text-primary-600">${kit.precioEstimado?.toLocaleString('es-CL')} CLP</p>
                      )}
                    </div>
                  </div>
                  {kit.descripcion && (
                    <p className="text-xs text-gray-500 line-clamp-2">{kit.descripcion}</p>
                  )}
                  {kit.items?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{kit.items.length} productos</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {tab === 'campaigns' && (
        <div>
          {campLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-gray-500">#{c.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{c.titulo}</td>
                        <td className="px-4 py-3"><StatusBadge status={c.estado} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {(c.estado === 'ACTIVA' || c.estado === 'EN_VALIDACION') && (
                              <Link
                                to={`/beneficiary/campaign/${c.id}`}
                                className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-primary-700 hover:bg-blue-100 transition-colors"
                              >
                                Asignar kit
                              </Link>
                            )}
                            {c.estado === 'ACTIVA' && (
                              <button
                                onClick={() => closeMutation.mutate(c.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                Cerrar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
