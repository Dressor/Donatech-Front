import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../../api';
import CampaignCard from '../../components/shared/CampaignCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  HeartIcon,
  ShieldCheckIcon,
  TruckIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const stats = [
  { label: 'Familias Ayudadas', value: '1,240+', icon: UsersIcon },
  { label: 'Donaciones Realizadas', value: '$48M+', icon: CurrencyDollarIcon },
  { label: 'Campañas Activas', value: '85', icon: HeartIcon },
  { label: 'Kits Entregados', value: '3,800+', icon: ClipboardDocumentCheckIcon },
];

const steps = [
  {
    step: '01',
    title: 'Donante se registra',
    description: 'Crea tu cuenta como donante persona natural o empresa para acceder a las campañas activas.',
    icon: UsersIcon,
  },
  {
    step: '02',
    title: 'Elige una campaña',
    description: 'Navega por las campañas verificadas, conoce la historia de cada familia y selecciona los kits que deseas donar.',
    icon: HeartIcon,
  },
  {
    step: '03',
    title: 'Realiza la donación',
    description: 'Haz tu transferencia bancaria y sube el comprobante. Un validador verificará el pago.',
    icon: DocumentCheckIcon,
  },
  {
    step: '04',
    title: 'Seguimiento completo',
    description: 'Recibe notificaciones en cada etapa: Pago Validado → En Camino → Entregado, con evidencia fotográfica.',
    icon: TruckIcon,
  },
];

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['active-campaigns'],
    queryFn: () => catalogApi.getActiveCampaigns(),
    select: (res) => res.data?.slice(0, 3) ?? [],
  });

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden hero-gradient text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-danger-600/20 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-white/20">
              <ShieldCheckIcon className="w-4 h-4 text-green-400" />
              Plataforma verificada y transparente
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Dona con{' '}
              <span className="text-yellow-300">certeza</span>,<br />
              ayuda con{' '}
              <span className="text-red-300">corazón</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-xl">
              Conectamos donantes comprometidos con familias vulnerables en Chile mediante un
              sistema de acreditación transparente que garantiza que tu apoyo llegue a quien
              más lo necesita.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/campaigns" className="bg-white text-primary-800 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                Ver campañas activas
              </Link>
              <Link to="/register" className="bg-danger-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-danger-700 transition-colors shadow-lg">
                Quiero ayudar →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-3">
                  <s.icon className="w-6 h-6 text-primary-700" />
                </div>
                <div className="text-2xl font-extrabold text-primary-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <h2 className="section-title mb-3">¿Cómo funciona Donatech?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Un proceso simple, seguro y completamente trazable en 4 pasos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative card text-center group hover:shadow-md transition-shadow">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 z-10">
                  <ArrowRightIcon className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div className="text-5xl font-black text-primary-100 leading-none mb-3 select-none">
                {s.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-blue flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVE CAMPAIGNS */}
      <section id="campanas" className="bg-gray-50/80 py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-title mb-1">Campañas activas</h2>
              <p className="text-gray-500 text-sm">Familias verificadas que necesitan tu apoyo hoy</p>
            </div>
            <Link to="/campaigns" className="btn-outline text-sm hidden md:flex items-center gap-1.5">
              Ver todas <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Cargando campañas..." />
          ) : data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.map((c) => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No hay campañas activas en este momento.
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/campaigns" className="btn-outline">
              Ver todas las campañas
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HeartIcon className="w-14 h-14 mx-auto mb-6 text-white/70" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            ¿Eres una familia que necesita ayuda?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Regístrate como beneficiario, crea tu campaña y nuestros validadores acreditarán
            tu situación para conectarte con donantes que quieren ayudar.
          </p>
          <Link to="/register?role=beneficiary" className="bg-white text-primary-800 font-bold py-3 px-8 rounded-xl hover:bg-blue-50 transition-colors shadow-lg inline-block">
            Solicitar ayuda
          </Link>
        </div>
      </section>
    </div>
  );
}
