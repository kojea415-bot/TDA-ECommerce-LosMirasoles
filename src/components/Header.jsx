import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Header() {
  // Total de unidades del carrito (no de productos distintos)
  const { items } = useCart()
  const total = items.reduce((suma, i) => suma + i.cantidad, 0)

  // Sesión: si hay usuario se muestra "Salir", si no "Cuenta"
  const { usuario, perfil, cerrarSesion } = useAuth()

  return (
    <header className="header">
      <Link to="/" className="header-marca">Dietética Los Mirasoles</Link>
      <nav className="header-nav">
        {perfil?.rol === 'administrador' && (
          <Link to="/admin/pedidos">Panel</Link>
        )}
        {usuario ? (
          <button type="button" onClick={cerrarSesion}>Salir</button>
        ) : (
          <Link to="/ingreso">Cuenta</Link>
        )}
        <Link to="/carrito" className="header-carrito">Carrito ({total})</Link>
      </nav>
    </header>
  )
}

export default Header
