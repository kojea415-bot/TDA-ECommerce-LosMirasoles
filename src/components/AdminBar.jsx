import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icono from './Icono'

function AdminBar({ titulo, accion }) {
  const { cerrarSesion } = useAuth()
  return (
    <header className="admin-bar">
      <h1>
        <Icono nombre="hoja" />
        {titulo}
      </h1>
      <nav>
        <Link to="/admin/productos">Productos</Link>
        <Link to="/admin/pedidos">Pedidos</Link>
        {accion}
        <button type="button" onClick={cerrarSesion}>
          <Icono nombre="salir" />
          Salir
        </button>
      </nav>
    </header>
  )
}

export default AdminBar
