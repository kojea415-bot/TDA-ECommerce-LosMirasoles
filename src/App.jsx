import { Route, Routes, useLocation } from 'react-router-dom'
import Carrito from './pages/Carrito'
import Catalogo from './pages/Catalogo'
import Confirmacion from './pages/Confirmacion'
import Ficha from './pages/Ficha'
import Ingreso from './pages/Ingreso'
import Pago from './pages/Pago'
import PedidosAdmin from './pages/admin/Pedidos'
import ProductosAdmin from './pages/admin/Productos'

import Header from './components/Header'

// Qué pantalla se muestra en cada dirección
function App() {
  const admin = useLocation().pathname.startsWith('/admin')

  return (
    <div>
      {!admin && <Header />}
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<Ficha />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/ingreso" element={<Ingreso />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/admin/pedidos" element={<PedidosAdmin />} />
        <Route path="/admin/productos" element={<ProductosAdmin />} />
      </Routes>
    </div>
  )
}

export default App
