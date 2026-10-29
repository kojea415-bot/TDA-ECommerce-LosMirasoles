import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Carrito from './pages/Carrito'
import Catalogo from './pages/Catalogo'
import Confirmacion from './pages/Confirmacion'
import Ficha from './pages/Ficha'
import Ingreso from './pages/Ingreso'
import Pago from './pages/Pago'
import PedidosAdmin from './pages/admin/Pedidos'
import ProductosAdmin from './pages/admin/Productos'

import Header from './components/Header'
import { useAuth } from './context/AuthContext'

// The store header and the customer screens. An administrator never sees them.
function Tienda() {
  const { usuario, perfil, perfilListo, cargando } = useAuth()

  if (cargando || (usuario && !perfilListo)) {
    return (
      <main className="pagina">
        <p>Cargando...</p>
      </main>
    )
  }

  if (perfil?.rol === 'administrador') {
    return <Navigate to="/admin/pedidos" replace />
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Catalogo />} />
        <Route path="/producto/:id" element={<Ficha />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/ingreso" element={<Ingreso />} />
        <Route path="/pago" element={<Pago />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
      </Routes>
    </>
  )
}

function App() {
  const enPanel = useLocation().pathname.startsWith('/admin')

  if (enPanel) {
    return (
      <Routes>
        <Route path="/admin/pedidos" element={<PedidosAdmin />} />
        <Route path="/admin/productos" element={<ProductosAdmin />} />
      </Routes>
    )
  }

  return <Tienda />
}

export default App
