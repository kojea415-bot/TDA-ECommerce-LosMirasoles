import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// Pantalla del carrito: lista de productos y botón para quitar cada uno
function Carrito() {
  const { items, subtotal, quitarProducto, cambiarCantidad, vaciarCarrito } = useCart()

  if (items.length === 0) {
    return (
      <main className="carrito">
        <h2>Carrito</h2>
        <p>Tu carrito está vacío.</p>
        <Link to="/">Ver productos</Link>
      </main>
    )
  }

  return (
    <main className="carrito">
      <h2>Carrito</h2>

      <ul className="carrito-lista">
        {items.map((item) => (
          <li key={item.id} className="carrito-item">
            <span>{item.nombre}</span>
            <span>
              <button type="button" onClick={() => cambiarCantidad(item, -1)}>
                −
              </button>{' '}
              {item.cantidad}{' '}
              <button
                type="button"
                onClick={() => cambiarCantidad(item, 1)}
                disabled={item.cantidad >= item.stock}
              >
                +
              </button>
            </span>
            <span>${item.precio * item.cantidad}</span>
            <button type="button" onClick={() => quitarProducto(item)}>
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <p className="carrito-subtotal">Subtotal: ${subtotal}</p>

      <button type="button" onClick={vaciarCarrito}>
        Vaciar carrito
      </button>
    </main>
  )
}

export default Carrito
