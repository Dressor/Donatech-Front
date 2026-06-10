import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import { PlusIcon, CubeIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const PRIORIDAD_OPTIONS = ['CRITICO', 'ALTO', 'MEDIO', 'BAJO'];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const NoImagePlaceholder = () => (
  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] font-medium select-none">
    N/A
  </div>
);

// Thumbnail with hover preview — only renders if hasImage=true to avoid 404 requests
function ProductImageThumb({ productId, nombre, hasImage }) {
  const [error, setError] = useState(false);
  if (!hasImage || error) return <NoImagePlaceholder />;
  const src = `/api/products/${productId}/image`;
  return (
    <div className="relative group inline-block">
      <img
        src={src}
        alt={nombre}
        onError={() => setError(true)}
        className="w-9 h-9 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
      />
      <div className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 z-50
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150
                      shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-white">
        <img src={src} alt={nombre} className="w-48 h-48 object-contain p-1" />
        <p className="text-xs text-center text-gray-500 py-1 px-2 truncate max-w-[192px]">{nombre}</p>
      </div>
    </div>
  );
}

// ─── Kit form section ────────────────────────────────────────────────────────

function KitForm({ kit, products, onCancel, onSaved }) {
  const [kitItems, setKitItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const queryClient = useQueryClient();

  // Fetch full kit by ID when editing — list endpoint may return lazy Hibernate proxy for items
  const { data: kitDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['kit-detail', kit?.id],
    queryFn: () => catalogApi.getKitById(kit.id),
    select: (r) => r.data,
    enabled: !!kit?.id,
    staleTime: 0,
  });

  useEffect(() => {
    if (!kitDetail) return;
    const items = Array.isArray(kitDetail.items) ? kitDetail.items : [];
    setKitItems(items.map((i) => ({
      // Backend field is "product" (Java camelCase), not "producto"
      productId: i.product?.id ?? i.productId,
      nombre: i.product?.nombre ?? `Producto #${i.product?.id ?? '?'}`,
      precio: i.product?.precio ?? 0,
      cantidadRequerida: i.cantidadRequerida,
    })));
  }, [kitDetail]);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: kit
      ? { nombre: kit.nombre, descripcion: kit.descripcion, precioEstimado: kit.precioEstimado }
      : {},
  });

  // Re-populate form fields from fetched detail (in case list returned partial data)
  useEffect(() => {
    if (!kitDetail) return;
    reset({
      nombre: kitDetail.nombre,
      descripcion: kitDetail.descripcion,
      precioEstimado: kitDetail.precioEstimado,
    });
  }, [kitDetail, reset]);

  const uploadImageAfterSave = async (kitId, imageFile) => {
    if (!imageFile || !kitId) return;
    const fd = new FormData();
    fd.append('file', imageFile);
    try { await catalogApi.uploadKitImage(kitId, fd); } catch { /* imagen no crítica */ }
  };

  const createMutation = useMutation({
    mutationFn: ({ payload, imageFile }) => catalogApi.createKit(payload).then(async (res) => {
      await uploadImageAfterSave(res.data?.id, imageFile);
      return res;
    }),
    onSuccess: () => { toast.success('Kit creado'); queryClient.invalidateQueries(['admin-kits']); onSaved(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }) => catalogApi.updateKit(id, data).then(async (res) => {
      await uploadImageAfterSave(id, imageFile);
      return res;
    }),
    onSuccess: () => { toast.success('Kit actualizado'); queryClient.invalidateQueries(['admin-kits']); onSaved(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const calcPrecio = () => kitItems.reduce((s, i) => s + (i.precio ?? 0) * i.cantidadRequerida, 0);

  const addItem = () => {
    if (!selectedProductId) return;
    const product = products.find((p) => String(p.id) === String(selectedProductId));
    if (!product) return;
    if (kitItems.some((i) => String(i.productId) === String(product.id))) {
      toast.error('Ese producto ya está en el kit'); return;
    }
    setKitItems((prev) => [...prev, { productId: product.id, nombre: product.nombre, precio: product.precio, cantidadRequerida: Number(selectedQty) }]);
    setSelectedProductId(''); setSelectedQty(1);
  };

  const removeItem = (productId) => setKitItems((prev) => prev.filter((i) => String(i.productId) !== String(productId)));

  const onSubmit = (formData) => {
    if (kitItems.length === 0) { toast.error('Agrega al menos un producto'); return; }
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precioEstimado: Number(formData.precioEstimado) || calcPrecio(),
      items: kitItems.map(({ productId, cantidadRequerida }) => ({ productId, cantidadRequerida })),
    };
    const imageFile = formData.imagenFile?.[0];

    if (kit) updateMutation.mutate({ id: kit.id, data: payload, imageFile });
    else createMutation.mutate({ payload, imageFile });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (kit && loadingDetail) {
    return <div className="card mb-4 py-8"><LoadingSpinner /></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card mb-4 space-y-4">
      <h3 className="font-semibold text-gray-800">{kit ? 'Editar kit' : 'Crear nuevo kit'}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre *</label>
          <input {...register('nombre', { required: true })} className="input-field" placeholder="Kit Alimentación Básica" />
        </div>
        <div>
          <label className="label">Precio estimado (CLP)</label>
          <input {...register('precioEstimado')} type="number" className="input-field" placeholder={`Auto: $${calcPrecio().toLocaleString('es-CL')}`} />
          <p className="text-xs text-gray-400 mt-0.5">Calculado: ${calcPrecio().toLocaleString('es-CL')}</p>
        </div>
        <div className="col-span-2">
          <label className="label">Descripción</label>
          <textarea {...register('descripcion')} rows={2} className="input-field resize-none" />
        </div>
        <div className="col-span-2">
          <label className="label">Imagen de referencia (opcional)</label>
          <input {...register('imagenFile')} type="file" accept="image/jpeg,image/png,image/webp"
            className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Productos del kit *</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="label">Producto</label>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="input-field">
              <option value="">Selecciona un producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} — ${p.precio?.toLocaleString('es-CL')} CLP</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="label">Cantidad</label>
            <input type="number" min="1" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} className="input-field" />
          </div>
          <button type="button" onClick={addItem} disabled={!selectedProductId} className="btn-outline text-sm h-10 px-3 flex-shrink-0">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {kitItems.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Sin productos. Agrega al menos uno.</p>
        ) : (
          <div className="space-y-1">
            {kitItems.map((item) => (
              <div key={item.productId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-800">{item.nombre}</span>
                  <span className="text-gray-400 ml-2">× {item.cantidadRequerida}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">${((item.precio ?? 0) * item.cantidadRequerida).toLocaleString('es-CL')}</span>
                  <button type="button" onClick={() => removeItem(item.productId)} className="text-danger-500 hover:text-danger-700">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-1 text-sm font-semibold text-primary-700">
              Total: ${calcPrecio().toLocaleString('es-CL')} CLP
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? 'Guardando...' : kit ? 'Actualizar kit' : 'Crear kit'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Product form section ─────────────────────────────────────────────────────

function ProductForm({ product, categories, units, onCancel, onSaved }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product ? {
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      stockMinimo: product.stockMinimo ?? 5,
      categoriaId: product.categoria?.id ?? product.categoriaId,
      unidadId: product.unid?.id ?? product.unidadId,
      prioridad: product.prioridad ?? 'MEDIO',
    } : { stockMinimo: 5, prioridad: 'MEDIO' },
  });

  const uploadImageAfterSave = async (productId, imageFile) => {
    if (!imageFile || !productId) return;
    const fd = new FormData();
    fd.append('file', imageFile);
    try { await catalogApi.uploadProductImage(productId, fd); } catch { /* imagen no crítica */ }
  };

  const createMutation = useMutation({
    mutationFn: ({ payload, imageFile }) => catalogApi.createProduct(payload).then(async (res) => {
      await uploadImageAfterSave(payload.id, imageFile);
      return res;
    }),
    onSuccess: () => { toast.success('Producto creado'); queryClient.invalidateQueries(['admin-products']); onSaved(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }) => catalogApi.updateProduct(id, data).then(async (res) => {
      await uploadImageAfterSave(id, imageFile);
      return res;
    }),
    onSuccess: () => { toast.success('Producto actualizado'); queryClient.invalidateQueries(['admin-products']); onSaved(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (formData) => {
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
    const imageFile = formData.imagenFile?.[0];

    if (product) updateMutation.mutate({ id: product.id, data: payload, imageFile });
    else createMutation.mutate({ payload, imageFile });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card mb-4 space-y-4">
      <h3 className="font-semibold text-gray-800">{product ? 'Editar producto' : 'Nuevo producto'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">ID del producto *</label>
          <input {...register('id', { required: 'Requerido' })} placeholder="AGUA-1L" className="input-field" disabled={!!product} />
          {errors.id && <p className="text-xs text-danger-600 mt-1">{errors.id.message}</p>}
        </div>
        <div>
          <label className="label">Nombre *</label>
          <input {...register('nombre', { required: 'Requerido' })} placeholder="Agua embotellada 1L" className="input-field" />
          {errors.nombre && <p className="text-xs text-danger-600 mt-1">{errors.nombre.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="label">Descripción *</label>
          <textarea {...register('descripcion', { required: 'Requerido' })} rows={2} className="input-field resize-none" />
          {errors.descripcion && <p className="text-xs text-danger-600 mt-1">{errors.descripcion.message}</p>}
        </div>
        <div>
          <label className="label">Precio (CLP) *</label>
          <input {...register('precio', { required: 'Requerido', min: 0 })} type="number" min="0" className="input-field" />
        </div>
        <div>
          <label className="label">Stock *</label>
          <input {...register('stock', { required: 'Requerido', min: 0 })} type="number" min="0" className="input-field" />
        </div>
        <div>
          <label className="label">Stock mínimo</label>
          <input {...register('stockMinimo', { min: 0 })} type="number" min="0" className="input-field" />
        </div>
        <div>
          <label className="label">Prioridad</label>
          <select {...register('prioridad')} className="input-field">
            {PRIORIDAD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Categoría</label>
          <select {...register('categoriaId')} className="input-field">
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre ?? c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Unidad de medida</label>
          <select {...register('unidadId')} className="input-field">
            <option value="">Sin unidad</option>
            {units.map((u) => <option key={u.id} value={u.id}>{u.nombre ?? u.name}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Imagen (opcional)</label>
          <input {...register('imagenFile')} type="file" accept="image/jpeg,image/png,image/webp"
            className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? 'Guardando...' : product ? 'Actualizar' : 'Crear producto'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm">Cancelar</button>
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCatalogPage() {
  const [tab, setTab] = useState('kits');
  const [showKitForm, setShowKitForm] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  // Safely extract array from any API response shape (plain array, Spring Page, 204 empty string)
  const toArray = (r) => {
    const d = r?.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.content)) return d.content;
    return [];
  };

  const { data: kits = [], isLoading: kitsLoading } = useQuery({
    queryKey: ['admin-kits'],
    queryFn: () => catalogApi.getKits(),
    select: toArray,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => catalogApi.getProducts({ page: 0, size: 100 }),
    select: toArray,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
    select: toArray,
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => catalogApi.getUnits(),
    select: toArray,
  });

  const { data: campaigns = [], isLoading: campLoading } = useQuery({
    queryKey: ['admin-campaigns-all'],
    queryFn: () => catalogApi.getCampaigns(),
    select: toArray,
  });

  const closeMutation = useMutation({
    mutationFn: (id) => catalogApi.closeCampaign(id),
    onSuccess: () => { toast.success('Campaña cerrada'); queryClient.invalidateQueries(['admin-campaigns-all']); },
  });

  const deleteKitMutation = useMutation({
    mutationFn: (id) => catalogApi.deleteKit(id),
    onSuccess: () => { toast.success('Kit eliminado'); queryClient.invalidateQueries(['admin-kits']); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => catalogApi.deleteProduct(id),
    onSuccess: () => { toast.success('Producto eliminado'); queryClient.invalidateQueries(['admin-products']); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const tabs = [
    { key: 'kits', label: 'Kits' },
    { key: 'products', label: 'Productos' },
    { key: 'campaigns', label: 'Campañas' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Catálogo</h1>
        <p className="text-gray-500">Gestiona productos, kits de emergencia y campañas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
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

      {/* ── Kits Tab ── */}
      {tab === 'kits' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingKit(null); setShowKitForm(true); }}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo kit
            </button>
          </div>

          {(showKitForm || editingKit) && (
            <KitForm
              key={editingKit?.id ?? 'new'}
              kit={editingKit}
              products={products}
              onCancel={() => { setShowKitForm(false); setEditingKit(null); }}
              onSaved={() => { setShowKitForm(false); setEditingKit(null); }}
            />
          )}

          {kitsLoading ? (
            <LoadingSpinner />
          ) : kits.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <p className="font-medium">No hay kits creados</p>
              <p className="text-sm mt-1">Crea productos primero, luego arma kits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kits.map((kit) => (
                <div key={kit.id} className="card flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-blue flex items-center justify-center flex-shrink-0">
                      <CubeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{kit.nombre}</h3>
                      {kit.precioEstimado && (
                        <p className="text-xs text-primary-600">${kit.precioEstimado?.toLocaleString('es-CL')} CLP</p>
                      )}
                    </div>
                  </div>

                  {kit.descripcion && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{kit.descripcion}</p>
                  )}

                  {Array.isArray(kit.items) && kit.items.length > 0 ? (
                    <div className="space-y-1 mb-3">
                      {kit.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-500">
                          <span>{item.product?.nombre ?? item.producto?.nombre ?? `Producto #${item.product?.id ?? item.productId ?? '?'}`}</span>
                          <span className="text-gray-400">× {item.cantidadRequerida}</span>
                        </div>
                      ))}
                      {kit.items.length > 3 && (
                      <p className="text-xs text-gray-400">+{kit.items.length - 3} más</p>
                    )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic mb-3">Sin productos asignados</p>
                  )}

                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                    <button
                      onClick={() => { setShowKitForm(false); setEditingKit(kit); }}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-primary-700 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el kit "${kit.nombre}"?`)) deleteKitMutation.mutate(kit.id);
                      }}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-danger-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Products Tab ── */}
      {tab === 'products' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              Nuevo producto
            </button>
          </div>

          {(showProductForm || editingProduct) && (
            <ProductForm
              key={editingProduct?.id ?? 'new-product'}
              product={editingProduct}
              categories={categories}
              units={units}
              onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
              onSaved={() => { setShowProductForm(false); setEditingProduct(null); }}
            />
          )}

          {productsLoading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <p className="font-medium">No hay productos registrados</p>
              <p className="text-sm mt-1">Crea el primer producto para comenzar a armar kits.</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">Img</th>
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
                        <td className="px-4 py-3">
                          <ProductImageThumb productId={p.id} nombre={p.nombre} hasImage={p.hasImage} />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                        <td className="px-4 py-3 text-gray-700">${p.precio?.toLocaleString('es-CL')}</td>
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
                              onClick={() => { setShowProductForm(false); setEditingProduct(p); }}
                              className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-primary-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                            >
                              <PencilIcon className="w-3 h-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Eliminar "${p.nombre}"?`)) deleteProductMutation.mutate(p.id);
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
      )}

      {/* ── Campaigns Tab ── */}
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
