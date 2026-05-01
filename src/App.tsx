import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OnboardingPage from './pages/OnboardingPage'
import FidelizacionPage from './pages/FidelizacionPage'
import ReactivacionPage from './pages/ReactivacionPage'
import AprobacionPage from './pages/AprobacionPage'
import MetricasPage from './pages/MetricasPage'
import DatosPage from './pages/DatosPage'
import AudienciasPage from './pages/AudienciasPage'
import ImportarAudienciaPage from './pages/ImportarAudienciaPage'
import AdminDatasetPage from './pages/AdminDatasetPage'
import EsquemasPage from './pages/EsquemasPage'

function GlobalFetchInterceptor({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        logout();
        navigate('/login');
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate, logout]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalFetchInterceptor>
        <Routes>
        {/* Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegidas — todos los roles autenticados */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/metricas"
          element={
            <ProtectedRoute>
              <Layout>
                <MetricasPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/datos"
          element={
            <ProtectedRoute>
              <Layout>
                <DatosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audiencias"
          element={
            <ProtectedRoute>
              <Layout>
                <AudienciasPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audiencias/importar"
          element={
            <ProtectedRoute>
              <Layout>
                <ImportarAudienciaPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dataset"
          element={
            <ProtectedRoute rolRequerido="coordinador">
              <Layout>
                <AdminDatasetPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/datos/esquemas"
          element={
            <ProtectedRoute>
              <Layout>
                <EsquemasPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Módulos Operativos — Accesibles por analistas y coordinadores */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Layout>
                <OnboardingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fidelizacion"
          element={
            <ProtectedRoute>
              <Layout>
                <FidelizacionPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reactivacion"
          element={
            <ProtectedRoute>
              <Layout>
                <ReactivacionPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protegida — solo coordinador */}
        <Route
          path="/aprobacion"
          element={
            <ProtectedRoute rolRequerido="coordinador">
              <Layout>
                <AprobacionPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Raíz → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Cualquier ruta no encontrada → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </GlobalFetchInterceptor>
    </BrowserRouter>
  )
}
