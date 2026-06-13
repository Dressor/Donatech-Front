import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { getErrorMessage } from './utils/errorHandler';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Public — carga eager para primer paint rápido
import HomePage from './pages/public/HomePage';
import CampaignsPage from './pages/public/CampaignsPage';
import CampaignDetailPage from './pages/public/CampaignDetailPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Donor — lazy (code splitting)
const CartPage = lazy(() => import('./pages/donor/CartPage'));
const CheckoutPage = lazy(() => import('./pages/donor/CheckoutPage'));
const DonationHistoryPage = lazy(() => import('./pages/donor/DonationHistoryPage'));

// Shared — detalle de donación visible por donante/admin/beneficiario
const DonationDetailPage = lazy(() => import('./pages/shared/DonationDetailPage'));

// Beneficiary — lazy
const BeneficiaryDashboard = lazy(() => import('./pages/beneficiary/BeneficiaryDashboard'));
const MyCampaignPage = lazy(() => import('./pages/beneficiary/MyCampaignPage'));
const BeneficiaryCampaignPage = lazy(() => import('./pages/beneficiary/BeneficiaryCampaignPage'));

// Admin — lazy
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const BackofficePage = lazy(() => import('./pages/admin/BackofficePage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminCatalogPage = lazy(() => import('./pages/admin/AdminCatalogPage'));
const AdminBeneficiariesPage = lazy(() => import('./pages/admin/AdminBeneficiariesPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminTransferConfigPage = lazy(() => import('./pages/admin/AdminTransferConfigPage'));
const AdminCampaignKitsPage = lazy(() => import('./pages/admin/AdminCampaignKitsPage'));
const DeliveryManagementPage = lazy(() => import('./pages/admin/DeliveryManagementPage'));

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => toast.error(getErrorMessage(err)),
  }),
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner text="Cargando..." />}>
            <Routes>
              <Route element={<MainLayout />}>
                {/* Public routes */}
                <Route index element={<HomePage />} />
                <Route path="campaigns" element={<CampaignsPage />} />
                <Route path="campaigns/:id" element={<CampaignDetailPage />} />

                {/* Auth routes */}
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />

                {/* Donor routes */}
                <Route
                  path="donor"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_ORGANIZACION']}>
                      <Navigate to="/donor/history" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/cart"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_ORGANIZACION']}>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_ORGANIZACION']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/history"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_ORGANIZACION']}>
                      <DonationHistoryPage />
                    </ProtectedRoute>
                  }
                />
                {/* Detalle de donación compartido (donante/admin/voluntario/beneficiario) */}
                <Route
                  path="donation/:id"
                  element={
                    <ProtectedRoute>
                      <DonationDetailPage />
                    </ProtectedRoute>
                  }
                />
                {/* Alias histórico */}
                <Route
                  path="donor/order/:id"
                  element={
                    <ProtectedRoute>
                      <DonationDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Beneficiary routes */}
                <Route
                  path="beneficiary/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_BENEFICIARIO', 'ROLE_ORGANIZACION']}>
                      <BeneficiaryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="beneficiary/campaign"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_BENEFICIARIO', 'ROLE_ORGANIZACION']}>
                      <MyCampaignPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="beneficiary/campaign/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_BENEFICIARIO', 'ROLE_ORGANIZACION', 'ROLE_ADMIN']}>
                      <BeneficiaryCampaignPage />
                    </ProtectedRoute>
                  }
                />
                {/* Alias histórico */}
                <Route
                  path="beneficiary/donation/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_BENEFICIARIO', 'ROLE_ORGANIZACION']}>
                      <DonationDetailPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/backoffice"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_VOLUNTARIO']}>
                      <BackofficePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/deliveries"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_VOLUNTARIO']}>
                      <DeliveryManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/catalog"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminCatalogPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/campaigns"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminCatalogPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/beneficiaries"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminBeneficiariesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/products"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/transfer-config"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminTransferConfigPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/campaigns/:id"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminCampaignKitsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/campaigns/:id/kits"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminCampaignKitsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Validator */}
                <Route
                  path="validator/pending"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_VOLUNTARIO', 'ROLE_ADMIN']}>
                      <BackofficePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="validator/tickets"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_VOLUNTARIO', 'ROLE_ADMIN']}>
                      <BackofficePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallbacks */}
                <Route
                  path="unauthorized"
                  element={
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                      <div className="text-6xl mb-4">🔒</div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso no autorizado</h2>
                      <p className="text-gray-500">No tienes permisos para ver esta página.</p>
                    </div>
                  }
                />
                <Route
                  path="*"
                  element={
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                      <div className="text-6xl mb-4">404</div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">Página no encontrada</h2>
                    </div>
                  }
                />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
