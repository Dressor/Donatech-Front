import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ordersApi, usersApi } from '../../api';
import {
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navLinks = {
  public: [
    { label: 'Inicio', to: '/' },
    { label: 'Campañas', to: '/campaigns' },
    { label: 'Cómo funciona', to: '/#como-funciona' },
  ],
  ROLE_DONANTE: [
    { label: 'Campañas', to: '/campaigns' },
    { label: 'Mis Donaciones', to: '/donor/history' },
    { label: 'Soporte', to: '/support/delivery-issue' },
  ],
  ROLE_BENEFICIARIO: [
    { label: 'Inicio', to: '/beneficiary/dashboard' },
    { label: 'Mi Campaña', to: '/beneficiary/campaign' },
    { label: 'Soporte', to: '/support/delivery-issue' },
  ],
  ROLE_ADMIN: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Soporte', to: '/admin/backoffice' },
    { label: 'Entregas', to: '/admin/deliveries' },
    { label: 'Rutas', to: '/admin/routes' },
    { label: 'Validaciones', to: '/admin/beneficiaries' },
    { label: 'Usuarios', to: '/admin/users' },
    { label: 'Catálogo', to: '/admin/catalog' },
    { label: 'Medio de Pago', to: '/admin/transfer-config' },
    { label: 'Documentos', to: '/admin/documents' },
  ],
  ROLE_VOLUNTARIO: [
    { label: 'Catálogo', to: '/campaigns' },
    { label: 'Soporte', to: '/support/delivery-issue' },
    { label: 'Entregas', to: '/admin/deliveries' },
  ],
  ROLE_ORGANIZACION: [
    { label: 'Campañas', to: '/campaigns' },
    { label: 'Mis Donaciones', to: '/donor/history' },
    { label: 'Soporte', to: '/support/delivery-issue' },
  ],
};

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin, isDonante, isBeneficiario, isValidador, isOrganizacion } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Donaciones pendientes de acción del donante (INGRESADA = sin comprobante subido)
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['donations-pending', user?.email],
    queryFn: () => ordersApi.getDonationsByDonor(user.email),
    select: (r) => (r.data ?? []).filter((d) => (d.estado ?? d.status) === 'INGRESADA').length,
    enabled: (isDonante || isOrganizacion) && !!user?.email,
    refetchOnWindowFocus: true,
  });

  // Nombre + apellido para el navbar (correo solo en /profile)
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => usersApi.getMyProfile(),
    select: (r) => r.data,
    enabled: isAuthenticated,
  });
  const displayName = [profile?.name, profile?.apellido].filter(Boolean).join(' ') || user?.email;

  const pendingBadge = (to) =>
    to === '/donor/history' && pendingCount > 0 ? (
      <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-danger-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {pendingCount}
      </span>
    ) : null;

  const getLinks = () => {
    if (!isAuthenticated) return navLinks.public;
    if (isAdmin) return navLinks.ROLE_ADMIN;
    if (isDonante) return navLinks.ROLE_DONANTE;
    if (isBeneficiario) return navLinks.ROLE_BENEFICIARIO;
    if (isValidador) return navLinks.ROLE_VOLUNTARIO;
    return navLinks.ROLE_ORGANIZACION;
  };

  const links = getLinks();

  const scrollToHash = (hash) => {
    const el = document.getElementById(hash.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Para enlaces ancla ("/#seccion") hace scroll suave en la landing en vez de navegar a una ruta inexistente
  const handleNavClick = (e, to) => {
    if (to.startsWith('/#')) {
      e.preventDefault();
      const hash = to.slice(1);
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToHash(hash), 120);
      } else {
        scrollToHash(hash);
      }
      setOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center shadow-md">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">
              <span className="text-primary-800">Dona</span>
              <span className="text-danger-600">tech</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={(e) => handleNavClick(e, l.to)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  location.pathname === l.to
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
                }`}
              >
                {l.label}
                {pendingBadge(l.to)}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {(isDonante || isOrganizacion) && (
              <Link
                to="/donor/cart"
                className="relative p-2 rounded-lg text-gray-600 hover:text-primary-700 hover:bg-gray-50 transition-colors"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="font-medium max-w-[160px] truncate">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-danger-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              {open ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={(e) => { handleNavClick(e, l.to); setOpen(false); }}
                className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {l.label}
                {l.to === '/donor/history' && pendingCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-danger-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 border-t border-gray-100 mt-1 pt-3"
                >
                  <UserCircleIcon className="w-5 h-5 text-primary-600" />
                  <span className="truncate">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-danger-600 rounded-lg hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2 px-4">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline text-sm text-center">
                  Iniciar sesión
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm text-center">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
