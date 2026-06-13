import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ordersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { CreditCardIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

const TABS = [
  { id: 'transferencia', label: 'Transferencia Bancaria', icon: BuildingLibraryIcon },
];

export default function AdminTransferConfigPage() {
  const [activeTab, setActiveTab] = useState('transferencia');
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: config, isLoading } = useQuery({
    queryKey: ['transfer-config'],
    queryFn: () => ordersApi.getTransferConfig(),
    select: (r) => (r.data?.message ? null : r.data),
    retry: false,
    throwOnError: false,
  });

  useEffect(() => {
    if (config) {
      reset({
        banco: config.banco,
        tipoCuenta: config.tipoCuenta,
        nroCuenta: config.nroCuenta,
        rut: config.rut,
        nombreBeneficiario: config.nombreBeneficiario,
        email: config.email ?? '',
      });
    }
  }, [config, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) => ordersApi.saveTransferConfig(data),
    onSuccess: () => {
      toast.success('Datos bancarios actualizados');
      queryClient.invalidateQueries(['transfer-config']);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center">
          <CreditCardIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Medios de Pago</h1>
          <p className="text-gray-500 text-sm">Configura las opciones de pago para donantes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                active
                  ? 'border-primary-600 text-primary-700 bg-primary-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'transferencia' && (
        <>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="card space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Banco *</label>
                  <input
                    {...register('banco', { required: 'Requerido' })}
                    placeholder="Banco Estado"
                    className="input-field"
                  />
                  {errors.banco && <p className="text-xs text-danger-600 mt-1">{errors.banco.message}</p>}
                </div>

                <div>
                  <label className="label">Tipo de cuenta *</label>
                  <select {...register('tipoCuenta', { required: 'Requerido' })} className="input-field">
                    <option value="">Selecciona tipo</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                    <option value="Cuenta Vista">Cuenta Vista</option>
                    <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                    <option value="CuentaRUT">CuentaRUT</option>
                  </select>
                  {errors.tipoCuenta && <p className="text-xs text-danger-600 mt-1">{errors.tipoCuenta.message}</p>}
                </div>

                <div>
                  <label className="label">Número de cuenta *</label>
                  <input
                    {...register('nroCuenta', {
                      required: 'Requerido',
                      pattern: { value: /^[\d\-]+$/, message: 'Solo números y guiones' },
                    })}
                    placeholder="123-456-789-0"
                    className="input-field"
                  />
                  {errors.nroCuenta && <p className="text-xs text-danger-600 mt-1">{errors.nroCuenta.message}</p>}
                </div>

                <div>
                  <label className="label">RUT *</label>
                  <input
                    {...register('rut', {
                      required: 'Requerido',
                      pattern: { value: /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/, message: 'Formato: 12.345.678-9' },
                    })}
                    placeholder="76.543.210-K"
                    className="input-field"
                  />
                  {errors.rut && <p className="text-xs text-danger-600 mt-1">{errors.rut.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label">Nombre del titular *</label>
                  <input
                    {...register('nombreBeneficiario', {
                      required: 'Requerido',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                    })}
                    placeholder="Donatech SpA"
                    className="input-field"
                  />
                  {errors.nombreBeneficiario && <p className="text-xs text-danger-600 mt-1">{errors.nombreBeneficiario.message}</p>}
                </div>

                <div className="col-span-2">
                  <label className="label">Email de contacto (opcional)</label>
                  <input
                    {...register('email', {
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                    })}
                    type="email"
                    placeholder="donaciones@donatech.cl"
                    className="input-field"
                  />
                  {errors.email && <p className="text-xs text-danger-600 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              {!config && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                  Aún no hay datos configurados. Completa el formulario para que los donantes puedan ver la información de pago.
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar datos bancarios'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
