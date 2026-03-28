import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import MobileCart from './components/cart/MobileCart'
import CartFAB from './components/cart/CartFAB'
import AuthModal from './components/auth/AuthModal'
import HomePage from './pages/HomePage'
import AdminPage from './pages/admin/AdminPage'
import FriosPage from './pages/FriosPage'
import TabuasPage from './pages/TabuasPage'
import DocesPage from './pages/DocesPage'
import GraosCastanhasPage from './pages/GraosCastanhasPage'
import BebidasPage from './pages/BebidasPage'
import VinhosBebidasPage from './pages/bebidas/VinhosPage'
import CervejaPage from './pages/bebidas/CervejaPage'
import CachacaPage from './pages/bebidas/CachacaPage'
import NaoAlcoolicosPage from './pages/bebidas/NaoAlcoolicosPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/frios" element={<FriosPage />} />
              <Route path="/tabuas" element={<TabuasPage />} />
              <Route path="/doces" element={<DocesPage />} />
              <Route path="/graos-castanhas" element={<GraosCastanhasPage />} />
              <Route path="/bebidas" element={<BebidasPage />} />
              <Route path="/bebidas/vinhos" element={<VinhosBebidasPage />} />
              <Route path="/bebidas/cerveja" element={<CervejaPage />} />
              <Route path="/bebidas/cachaca" element={<CachacaPage />} />
              <Route path="/bebidas/nao-alcoolicos" element={<NaoAlcoolicosPage />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <MobileCart />
          <CartFAB />
          <AuthModal />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
