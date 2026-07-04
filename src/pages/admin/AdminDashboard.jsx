import { useQuery } from '@tanstack/react-query';
import { ordersApi, supportsApi, catalogApi, usersApi } from '../../api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  HeartIcon,
  ShieldCheckIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => ordersApi.getDashboard(),
    select: (r) => r.data,
  });

  const { data: pendingTickets = [] } = useQuery({
    queryKey: ['pending-tickets'],
    queryFn: () => supportsApi.getByStatus('PENDIENTE'),
    select: (r) => r.data ?? [],
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => catalogApi.getCampaigns(),
    select: (r) => r.data ?? [],
  });

  const { data: pendingBeneficiaries = [] } = useQuery({
    queryKey: ['pending-beneficiaries'],
    queryFn: () => usersApi.getBeneficiariesByStatus('PENDIENTE'),
    select: (r) => r.data ?? [],
  });

  const { data: pendingCompanies = [] } = useQuery({
    queryKey: ['pending-companies'],
    queryFn: () => usersApi.getCompaniesByStatus('PENDIENTE'),
    select: (r) => r.data ?? [],
  });

  const byStatus = summary?.donationsByStatus ?? {};
  const ordenesEnProceso =
    (byStatus.EN_PREPARACION ?? 0) + (byStatus.ASIGNADA_ENVIO ?? 0) + (byStatus.EN_CAMINO ?? 0);
  // Validaciones automáticas (campaña/transferencia) vs soporte humano.
  const VALIDATION_TYPES = ['VALIDACION_TRANSFERENCIA', 'VALIDACION_CAMPAÑA'];
  const validationTickets = pendingTickets.filter((t) => VALIDATION_TYPES.includes(t.tipo));
  const supportTickets = pendingTickets.filter((t) => !VALIDATION_TYPES.includes(t.tipo));
  // Pendientes de validación = tickets de validación abiertos (campañas + transferencias)
  // + entregas por confirmar. Las cuentas se autogestionan (verificación por correo) y se
  // muestran aparte en "Cuentas pendientes"; no se suman aquí para no inflar el número.
  const pendientesValidacion =
    validationTickets.length + (byStatus.PENDIENTE_CONFIRMACION ?? 0);

  const stats = [
    {
      label: 'Órdenes en proceso',
      value: ordenesEnProceso,
      icon: TruckIcon,
      color: 'text-blue-600 bg-blue-50',
      link: '/admin/deliveries',
    },
    {
      label: 'Pendientes de validación',
      value: pendientesValidacion,
      icon: ClipboardDocumentCheckIcon,
      color: 'text-purple-600 bg-purple-50',
      link: '/admin/beneficiaries',
    },
    {
      label: 'Tickets abiertos',
      value: supportTickets.length,
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600 bg-orange-50',
      link: '/admin/backoffice',
    },
    {
      label: 'Campañas totales',
      value: campaigns.length,
      icon: HeartIcon,
      color: 'text-primary-600 bg-primary-50',
      link: '/admin/catalog',
    },
    {
      label: 'Cuentas pendientes',
      value: pendingBeneficiaries.length + pendingCompanies.length,
      icon: UserGroupIcon,
      color: 'text-yellow-600 bg-yellow-50',
      link: '/admin/beneficiaries',
    },
    {
      label: 'Campañas activas',
      value: campaigns.filter((c) => c.estado === 'ACTIVA').length,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600 bg-green-50',
      link: '/campaigns',
    },
  ];

  const chartData = Object.entries(byStatus).map(([status, count]) => ({ status, count }));

  if (isLoading) return <LoadingSpinner text="Cargando dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title mb-1">Panel de Administración</h1>
        <p className="text-gray-500">Resumen del sistema Donatech</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.link} className="card-hover">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Órdenes por estado</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick actions */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Acciones rápidas</h3>
          <div className="space-y-2">
            {[
              { label: 'Validar cuentas pendientes (beneficiarios y empresas)', to: '/admin/beneficiaries', icon: UserGroupIcon },
              { label: 'Validar transferencias pendientes', to: '/admin/beneficiaries', icon: ShieldCheckIcon },
              { label: 'Gestionar catálogo de kits', to: '/admin/catalog', icon: CubeIcon },
              { label: 'Gestionar usuarios', to: '/admin/users', icon: UsersIcon },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <a.icon className="w-4 h-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
