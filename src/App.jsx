import { Route, Routes } from 'react-router-dom'
import Carrito from './pages/Carrito'
import Catalogo from './pages/Catalogo'
import Confirmacion from './pages/Confirmacion'
import Ficha from './pages/Ficha'
import Ingreso from './pages/Ingreso'
import Pago from './pages/Pago'

// Qué pantalla se muestra en cada dirección
function App() {
  return (
    <div>
      <h1>Taller de Aplicaciones</h1>
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<Ficha />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/ingreso" element={<Ingreso />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
      </Routes>
    </div>
  )
}

export default App
