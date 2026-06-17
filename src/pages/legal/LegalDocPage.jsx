import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api';
import Markdown from '../../components/ui/Markdown';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Página pública de documento legal (Términos / Privacidad). Contenido editable por admin.
export default function LegalDocPage({ slug }) {
  const { data, isLoading } = useQuery({
    queryKey: ['legal-doc', slug],
    queryFn: () => ordersApi.getDocument(slug),
    select: (r) => r.data,
    retry: false,
  });

  if (isLoading) return <LoadingSpinner text="Cargando documento..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="card">
        {data?.contenido
          ? <Markdown>{data.contenido}</Markdown>
          : <p className="text-gray-500 text-center py-10">Documento no disponible.</p>}
      </div>
    </div>
  );
}
