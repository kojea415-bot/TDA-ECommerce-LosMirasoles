import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Server role checks live in RLS. This gate only decides which screen to show.
function PuertaAdmin({ children }) {
  const { usuario, perfil, perfilListo, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando || (usuario && !perfilListo)) {
    return <main className="pagina"><p>Cargando...</p></main>
  }

  if (!usuario) {
    return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname }} />
  }

  if (perfil?.rol !== 'administrador') {
    return (
      <main className="pagina">
        <p>Esta pantalla es del administrador.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    )
  }

  return children
}

export default PuertaAdmin
