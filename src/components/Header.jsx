import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Header() {
  // Total de unidades del carrito (no de productos distintos)
  const { items } = useCart()
  const total = items.reduce((suma, i) => suma + i.cantidad, 0)

  return (
    <header className="header">
      <Link to="/" className="header-marca">Dietética Los Mirasoles</Link>
      <nav className="header-nav">
        <Link to="/ingreso">Cuenta</Link>
        <Link to="/carrito">Carrito ({total})</Link>
      </nav>
    </header>
  )
}

export default Header
