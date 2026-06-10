import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const PRIORIDAD_OPTIONS = ['CRITICO', 'ALTO', 'MEDIO', 'BAJO'];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { stockMinimo: 5, prioridad: 'MEDIO' },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => catalogApi.getProducts({ page: 0, size: 100 }),
    select: (r) => r.data?.content ?? r.data ?? [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
    select: (r) => r.data ?? [],
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => catalogApi.getUnits(),
    select: (r) => r.data ?? [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => catalogApi.createProduct(data),
    onSuccess: () => {
      toast.success('Producto creado');
      queryClient.invalidateQueries(['admin-products']);
      handleClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => catalogApi.updateProduct(id, data),
    onSuccess: () => {
      toast.success('Producto actualizado');
      queryClient.invalidateQueries(['admin-products']);
      handleClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => catalogApi.deleteProduct(id),
    onSuccess: () => {
      toast.success('Producto eliminado');
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    reset({ stockMinimo: 5, prioridad: 'MEDIO' });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    reset({
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      stockMinimo: product.stockMinimo ?? 5,
      categoriaId: product.categoria?.id ?? product.categoriaId,
      unidadId: product.unid?.id ?? product.unidadId,
      prioridad: product.prioridad ?? 'MEDIO',
    });
  };

  const onSubmit = async (formData) => {
    const imageFile = formData.imagenFile?.[0];
    const payload = {
      id: formData.id,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      stock: Number(formData.stock),
      stockMinimo: Number(formData.stockMinimo),
      categoriaId: formData.categoriaId ? Number(formData.categoriaId) : undefined,
      unidadId: formData.unidadId ? Number(formData.unidadId) : undefined,
      prioridad: formData.prioridad,
    };

    if (imageFile) {
      payload.imagen = await fileToBase64(imageFile);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title mb-1">Productos</h1>
          <p className="text-gray-500 text-sm">Gestiona el catálogo base de productos para crear kits</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">
            {editingProduct ? 'Editar producto' : 'Nuevo producto'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ID del producto *</label>
              <input
                {...register('id', { required: 'Requerido' })}
                placeholder="AGUA-1L"
                className="input-field"
                disabled={!!editingProduct}
              />
              {errors.id && <p className="text-xs text-danger-600 mt-1">{errors.id.message}</p>}
            </div>
            <div>
              <label className="label">Nombre *</label>
              <input
                {...register('nombre', { required: 'Requerido' })}
                placeholder="Agua embotellada 1L"
                className="input-field"
              />
              {errors.nombre && <p className="text-xs text-danger-600 mt-1">{errors.nombre.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="label">Descripción *</label>
              <textarea
                {...register('descripcion', { required: 'Requerido' })}
                rows={2}
                placeholder="Describe el producto..."
                className="input-field resize-none"
              />
              {errors.descripcion && <p className="text-xs text-danger-600 mt-1">{errors.descripcion.message}</p>}
            </div>

            <div>
              <label className="label">Precio (CLP) *</label>
              <input
                {...register('precio', { required: 'Requerido', min: 0 })}
                type="number"
                min="0"
                placeholder="1500"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Stock inicial *</label>
              <input
                {...register('stock', { required: 'Requerido', min: 0 })}
                type="number"
                min="0"
                placeholder="100"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Stock mínimo</label>
              <input
                {...register('stockMinimo', { min: 0 })}
                type="number"
                min="0"
                defaultValue={5}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Prioridad</label>
              <select {...register('prioridad')} className="input-field">
                {PRIORIDAD_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Categoría</label>
              <select {...register('categoriaId')} className="input-field">
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre ?? c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Unidad de medida</label>
              <select {...register('unidadId')} className="input-field">
                <option value="">Sin unidad</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre ?? u.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="label">Imagen de referencia (opcional)</label>
              <input
                {...register('imagenFile')}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-400 mt-1">Formatos aceptados: JPG, PNG, WebP</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isPending} className="btn-primary text-sm">
              {isPending ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear producto'}
            </button>
            <button type="button" onClick={handleClose} className="btn-outline text-sm">Cancelar</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <p className="font-medium mb-1">No hay productos registrados</p>
          <p className="text-sm">Crea el primer producto para comenzar a armar kits.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Prioridad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-700">
                      ${p.precio?.toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock <= (p.stockMinimo ?? 5) ? 'text-danger-600' : 'text-gray-700'}`}>
                        {p.stock}
                      </span>
                      <span className="text-gray-400 text-xs"> / mín {p.stockMinimo ?? 5}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.prioridad === 'CRITICO' ? 'bg-red-100 text-red-700' :
                        p.prioridad === 'ALTO' ? 'bg-orange-100 text-orange-700' :
                        p.prioridad === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {p.prioridad ?? 'MEDIO'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-primary-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <PencilIcon className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) {
                              deleteMutation.mutate(p.id);
                            }
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-danger-600 hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                          <TrashIcon className="w-3 h-3" />
                          Eliminar
                        </button>
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
  );
}
