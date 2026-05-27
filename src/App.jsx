import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public
import HomePage from './pages/public/HomePage';
import CampaignsPage from './pages/public/CampaignsPage';
import CampaignDetailPage from './pages/public/CampaignDetailPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Donor
import CartPage from './pages/donor/CartPage';
import CheckoutPage from './pages/donor/CheckoutPage';
import DonationHistoryPage from './pages/donor/DonationHistoryPage';
import OrderTrackingPage from './pages/donor/OrderTrackingPage';

// Beneficiary
import BeneficiaryDashboard from './pages/beneficiary/BeneficiaryDashboard';
import CreateCampaignPage from './pages/beneficiary/CreateCampaignPage';
import BeneficiaryCampaignPage from './pages/beneficiary/BeneficiaryCampaignPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import BackofficePage from './pages/admin/BackofficePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCatalogPage from './pages/admin/AdminCatalogPage';
import AdminBeneficiariesPage from './pages/admin/AdminBeneficiariesPage';

const queryClient = new QueryClient({
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
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_EMPRESA', 'ROLE_ORGANIZACION']}>
                      <Navigate to="/donor/history" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/cart"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_EMPRESA', 'ROLE_ORGANIZACION']}>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/checkout"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_EMPRESA', 'ROLE_ORGANIZACION']}>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/history"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DONANTE', 'ROLE_EMPRESA', 'ROLE_ORGANIZACION']}>
                      <DonationHistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="donor/order/:id"
                  element={
                    <ProtectedRoute>
                      <OrderTrackingPage />
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
                      <CreateCampaignPage />
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
                <Route
                  path="beneficiary/tracking"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_BENEFICIARIO']}>
                      <BeneficiaryDashboard />
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
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
