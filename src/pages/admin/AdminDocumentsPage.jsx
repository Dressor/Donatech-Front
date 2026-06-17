import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ordersApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import Markdown from '../../components/ui/Markdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const DOCS = [
  { slug: 'terms', label: 'Términos y Condiciones' },
  { slug: 'privacy', label: 'Política de Privacidad' },
];

function DocumentEditor() {
  const [slug, setSlug] = useState('terms');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-doc', slug],
    queryFn: () => ordersApi.getDocument(slug),
    select: (r) => r.data,
    retry: false,
  });

  useEffect(() => {
    setTitulo(data?.titulo ?? DOCS.find((d) => d.slug === slug)?.label ?? '');
    setContenido(data?.contenido ?? '');
  }, [data, slug]);

  const saveMutation = useMutation({
    mutationFn: () => ordersApi.saveDocument(slug, { titulo, contenido }),
    onSuccess: () => { toast.success('Documento guardado'); refetch(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-semibold text-gray-800">Documentos legales</h2>
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className="input-field max-w-xs">
          {DOCS.map((d) => <option key={d.slug} value={d.slug}>{d.label}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <label className="label">Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input-field mb-4" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="label">Contenido (Markdown)</label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                rows={20}
                className="input-field font-mono text-xs resize-none"
              />
            </div>
            <div>
              <label className="label">Vista previa</label>
              <div className="border border-gray-200 rounded-xl p-4 h-[480px] overflow-y-auto bg-white">
                <Markdown>{contenido}</Markdown>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary text-sm">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar documento'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CertificateConfigEditor() {
  const [form, setForm] = useState({ clausulaLegal: '', representanteNombre: '', representanteCargo: '', pie: '' });

  const { data, refetch } = useQuery({
    queryKey: ['cert-config'],
    queryFn: () => ordersApi.getCertificateConfig(),
    select: (r) => (r.data?.message ? null : r.data),
    retry: false,
  });

  useEffect(() => {
    if (data) setForm({
      clausulaLegal: data.clausulaLegal ?? '',
      representanteNombre: data.representanteNombre ?? '',
      representanteCargo: data.representanteCargo ?? '',
      pie: data.pie ?? '',
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => ordersApi.saveCertificateConfig(form),
    onSuccess: () => { toast.success('Certificado actualizado'); refetch(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-800 mb-4">Textos del certificado de donación</h2>
      <div className="space-y-4">
        <div>
          <label className="label">Cláusula legal</label>
          <textarea value={form.clausulaLegal} onChange={set('clausulaLegal')} rows={4} className="input-field resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Representante (nombre/empresa)</label>
            <input value={form.representanteNombre} onChange={set('representanteNombre')} className="input-field" />
          </div>
          <div>
            <label className="label">Cargo del firmante</label>
            <input value={form.representanteCargo} onChange={set('representanteCargo')} className="input-field" />
          </div>
        </div>
        <div>
          <label className="label">Pie de página</label>
          <textarea value={form.pie} onChange={set('pie')} rows={2} className="input-field resize-none" />
        </div>
        <div className="flex justify-end">
          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary text-sm">
            {saveMutation.isPending ? 'Guardando...' : 'Guardar certificado'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="section-title mb-1">Documentos y certificado</h1>
        <p className="text-gray-500">Edita los textos legales y del certificado de donación (sin redeploy).</p>
      </div>
      <DocumentEditor />
      <CertificateConfigEditor />
    </div>
  );
}
