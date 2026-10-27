import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// Pantalla del carrito: lista de productos y botón para quitar cada uno
function Carrito() {
  const { items, quitarProducto } = useCart()

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
            <span>Cantidad: {item.cantidad}</span>
            <span>${item.precio * item.cantidad}</span>
            <button type="button" onClick={() => quitarProducto(item)}>
              Quitar
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Carrito
