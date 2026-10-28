import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { pesos } from '../lib/presentacion'
import { urlImagenProducto } from '../lib/supabase'
import MarcoImagen from '../components/MarcoImagen'

// Pantalla del carrito: lista de productos y botón para quitar cada uno
function Carrito() {
  const { items, subtotal, quitarProducto, cambiarCantidad, vaciarCarrito } = useCart()
  const { usuario } = useAuth()
  const navegar = useNavigate()

  // Checkout stays on this page until there is a session and at least one item.
  function irAPagar() {
    if (!usuario || items.length === 0) return
    navegar('/pago')
  }

  return (
    <main className="pagina carrito">
      <p className="ceja">Carrito</p>
      <h1 className="titulo">Carrito</h1>

      {items.length === 0 ? (
        <p>
          Tu carrito está vacío. <Link to="/">Ver productos</Link>
        </p>
      ) : (
        <>
          <div className="carrito-tabla">
            <p className="carrito-encabezado">Producto</p>
            <p className="carrito-encabezado">Cantidad</p>
            <p className="carrito-encabezado">Subtotal</p>
            {items.map((item) => (
              <div key={item.id} className="carrito-fila">
                <MarcoImagen
                  variante="mini"
                  src={urlImagenProducto(item.imagen_path)}
                  alt=""
                />
                <div>
                  <p className="tarjeta-nombre">{item.nombre}</p>
                  <button type="button" className="enlace" onClick={() => quitarProducto(item)}>
                    Quitar
                  </button>
                </div>
                <div className="cantidad">
                  <button type="button" className="boton boton-suave" onClick={() => cambiarCantidad(item, -1)}>
                    −
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    type="button"
                    className="boton boton-suave"
                    onClick={() => cambiarCantidad(item, 1)}
                    disabled={item.cantidad >= item.stock}
                  >
                    +
                  </button>
                </div>
                <p>{pesos(item.precio * item.cantidad)}</p>
              </div>
            ))}
          </div>

          <div className="carrito-cierre">
            <button type="button" className="enlace" onClick={vaciarCarrito}>
              Vaciar carrito
            </button>
            <p>
              <span className="nota">Subtotal</span>{' '}
              <strong className="precio">{pesos(subtotal)}</strong>
            </p>
            <div className="carrito-acciones">
              <Link to="/" className="boton boton-suave">Seguir comprando</Link>
              {usuario && (
                <button type="button" className="boton" onClick={irAPagar}>
                  Ir a pagar
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}

export default Carrito
