import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { CrownIcon } from '@phosphor-icons/react'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const FriosPage = lazy(() => import('./pages/FriosPage'))
const TabuasPage = lazy(() => import('./pages/TabuasPage'))
const DocesPage = lazy(() => import('./pages/DocesPage'))
const GraosCastanhasPage = lazy(() => import('./pages/GraosCastanhasPage'))
const BebidasPage = lazy(() => import('./pages/BebidasPage'))
const VinhosBebidasPage = lazy(() => import('./pages/bebidas/VinhosPage'))
const CervejaPage = lazy(() => import('./pages/bebidas/CervejaPage'))
const CachacaPage = lazy(() => import('./pages/bebidas/CachacaPage'))
const NaoAlcoolicosPage = lazy(() => import('./pages/bebidas/NaoAlcoolicosPage'))
const ProdutoPage = lazy(() => import('./pages/ProdutoPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const PerfilPage = lazy(() => import('./pages/PerfilPage'))
const PedidosPage = lazy(() => import('./pages/PedidosPage'))
const AdminPage = lazy(() => import('./pages/admin/AdminPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const CardapioPage = lazy(() => import('./pages/CardapioPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-warm flex items-center justify-center">
      <CrownIcon size={32} className="text-gold-primary/30 animate-pulse" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/frios" element={<FriosPage />} />
                  <Route path="/tabuas" element={<TabuasPage />} />
                  <Route path="/doces" element={<DocesPage />} />
                  <Route path="/graos-castanhas" element={<GraosCastanhasPage />} />
                  <Route path="/bebidas" element={<BebidasPage />} />
                  <Route path="/bebidas/vinhos" element={<VinhosBebidasPage />} />
                  <Route path="/bebidas/cerveja" element={<CervejaPage />} />
                  <Route path="/bebidas/cachaca" element={<CachacaPage />} />
                  <Route path="/bebidas/nao-alcoolicos" element={<NaoAlcoolicosPage />} />
                  <Route path="/produtos/:id" element={<ProdutoPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/perfil" element={<PerfilPage />} />
                    <Route path="/pedidos" element={<PedidosPage />} />
                  </Route>
                  <Route element={<ProtectedRoute requiredRole="Admin" />}>
                    <Route path="/admin" element={<AdminPage />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
                <Route path="/cardapio" element={<CardapioPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
