import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Icono from './Icono'

function Header() {
  // Total de unidades del carrito (no de productos distintos)
  const { items } = useCart()
  const total = items.reduce((suma, i) => suma + i.cantidad, 0)

  // Sesión: si hay usuario se muestra "Salir", si no "Cuenta"
  const { usuario, cerrarSesion } = useAuth()

  return (
    <header className="header">
      <Link to="/" className="header-marca">
        <Icono nombre="hoja" />
        Dietética Los Mirasoles
      </Link>
      <nav className="header-nav">
        {usuario ? (
          <button type="button" onClick={cerrarSesion}>
            <Icono nombre="salir" />
            Salir
          </button>
        ) : (
          <Link to="/ingreso">
            <Icono nombre="usuario" />
            Cuenta
          </Link>
        )}
        <Link to="/carrito" className="header-carrito">
          <Icono nombre="carrito" />
          Carrito
          <span className="cuenta">{total}</span>
        </Link>
      </nav>
    </header>
  )
}

export default Header
