import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api';
import { getErrorMessage } from '../../utils/errorHandler';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const done = useRef(false); // evita doble llamada en StrictMode

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Falta el token de verificación en el enlace.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then((r) => {
        setStatus('success');
        setMessage(r.data?.message || 'Correo verificado correctamente.');
      })
      .catch((e) => {
        setStatus('error');
        setMessage(getErrorMessage(e));
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card text-center">
        {status === 'loading' && <LoadingSpinner text="Verificando tu correo..." />}

        {status === 'success' && (
          <>
            <CheckCircleIcon className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">¡Correo verificado!</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link to="/login" className="btn-primary">Ir a iniciar sesión</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircleIcon className="w-14 h-14 text-red-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">No pudimos verificar tu correo</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <p className="text-sm text-gray-400 mb-4">
              Inicia sesión y usa el botón "Reenviar verificación" en tu perfil para obtener un enlace nuevo.
            </p>
            <Link to="/login" className="btn-primary">Ir a iniciar sesión</Link>
          </>
        )}
      </div>
    </div>
  );
}
