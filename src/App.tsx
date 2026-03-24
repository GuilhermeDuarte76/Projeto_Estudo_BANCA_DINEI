import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Pilares from './components/Pilares'
import TabuasDestaque from './components/TabuasDestaque'
import CartaVinhos from './components/CartaVinhos'
import Harmonizacoes from './components/Harmonizacoes'
import MonteSuaTabua from './components/MonteSuaTabua'
import CervejariaLouvada from './components/CervejariaLouvada'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Pilares />
        <TabuasDestaque />
        <CartaVinhos />
        <Harmonizacoes />
        <MonteSuaTabua />
        <CervejariaLouvada />
      </main>
      <Footer />
    </>
  )
}

export default App
