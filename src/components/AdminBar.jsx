import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminBar({ titulo, accion }) {
  const { cerrarSesion } = useAuth()
  return (
    <header className="admin-bar">
      <h1>{titulo}</h1>
      <nav>
        <Link to="/admin/productos">Productos</Link>
        <Link to="/admin/pedidos">Pedidos</Link>
        {accion}
        <button type="button" onClick={cerrarSesion}>Salir</button>
      </nav>
    </header>
  )
}

export default AdminBar
