import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Fetches a protected image via axios (sends JWT headers) and returns a blob URL.
 *
 * El Blob se cachea en TanStack Query (reutilizable entre montajes). El objectURL
 * se crea por montaje desde el Blob cacheado y se revoca solo al desmontar — así
 * el cache nunca queda con una URL revocada (causaba img rota al reabrir el modal).
 *
 * @param {string[]} queryKey - TanStack Query key
 * @param {() => Promise} fetchFn - función que retorna respuesta axios con responseType:'blob'
 * @param {object} options - opciones extra de useQuery
 * @returns {{ blobUrl: string|undefined, isLoading: boolean }}
 */
export function useAuthImage(queryKey, fetchFn, options = {}) {
  const { data: blob, isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await fetchFn()).data,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const [blobUrl, setBlobUrl] = useState();

  useEffect(() => {
    if (!blob) {
      setBlobUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return { blobUrl, isLoading };
}
