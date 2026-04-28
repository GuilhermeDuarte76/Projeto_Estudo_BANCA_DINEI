import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import MobileCart from '../cart/MobileCart'
import CartFAB from '../cart/CartFAB'
import AuthModal from '../auth/AuthModal'

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <MobileCart />
      <CartFAB />
      <AuthModal />
    </>
  )
}
