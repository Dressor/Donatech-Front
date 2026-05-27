import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  return (
    <footer className="bg-primary-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Dona<span className="text-danger-400">tech</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Plataforma solidaria que conecta donantes con familias vulnerables en Chile,
              garantizando transparencia y trazabilidad en cada donación.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Campañas activas', to: '/campaigns' },
                { label: 'Cómo funciona', to: '/how-it-works' },
                { label: 'Registrarse', to: '/register' },
                { label: 'Iniciar sesión', to: '/login' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                'Términos y condiciones',
                'Política de privacidad',
                'Ley 19.628',
                'Ley 16.282',
              ].map((l) => (
                <li key={l}>
                  <span className="hover:text-white transition-colors cursor-pointer">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Donatech · Plataforma Solidaria de Donaciones y Acreditación</p>
          <p>
            Desarrollado con{' '}
            <HeartIcon className="w-3 h-3 text-danger-500 inline" /> por el equipo Donatech
          </p>
        </div>
      </div>
    </footer>
  );
}
