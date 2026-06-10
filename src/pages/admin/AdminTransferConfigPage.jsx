import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ordersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function AdminTransferConfigPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: config, isLoading } = useQuery({
    queryKey: ['transfer-config'],
    queryFn: () => ordersApi.getTransferConfig(),
    select: (r) => (r.data?.message ? null : r.data),
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

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-10"><LoadingSpinner /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center">
          <BanknotesIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="section-title mb-0">Datos bancarios</h1>
          <p className="text-gray-500 text-sm">Configuración para transferencias de donaciones</p>
        </div>
      </div>

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
              {...register('nroCuenta', { required: 'Requerido' })}
              placeholder="123-456-789-0"
              className="input-field"
            />
            {errors.nroCuenta && <p className="text-xs text-danger-600 mt-1">{errors.nroCuenta.message}</p>}
          </div>

          <div>
            <label className="label">RUT *</label>
            <input
              {...register('rut', { required: 'Requerido' })}
              placeholder="76.543.210-K"
              className="input-field"
            />
            {errors.rut && <p className="text-xs text-danger-600 mt-1">{errors.rut.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="label">Nombre del beneficiario *</label>
            <input
              {...register('nombreBeneficiario', { required: 'Requerido' })}
              placeholder="Donatech SpA"
              className="input-field"
            />
            {errors.nombreBeneficiario && <p className="text-xs text-danger-600 mt-1">{errors.nombreBeneficiario.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="label">Email de contacto (opcional)</label>
            <input
              {...register('email')}
              type="email"
              placeholder="donaciones@donatech.cl"
              className="input-field"
            />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? 'Guardando...' : 'Guardar datos bancarios'}
          </button>
        </div>
      </form>
    </div>
  );
}
