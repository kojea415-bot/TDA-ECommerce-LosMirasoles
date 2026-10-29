import { useCart } from '../context/CartContext'
import Icono from './Icono'

// Add button until the product is in the cart; then the same − / + stepper as the cart.
function ControlCantidad({ producto, cantidad, etiqueta = 'Agregar', icono = 'mas' }) {
  const { agregarProducto, cambiarCantidad } = useCart()

  if (cantidad > 0) {
    return (
      <div className="cantidad">
        <button
          type="button"
          className="boton boton-suave"
          aria-label={`Quitar una unidad de ${producto.nombre}`}
          onClick={() => cambiarCantidad(producto, -1)}
        >
          <Icono nombre="menos" />
        </button>
        <span>{cantidad}</span>
        <button
          type="button"
          className="boton boton-suave"
          aria-label={`Sumar una unidad de ${producto.nombre}`}
          onClick={() => cambiarCantidad(producto, 1)}
          disabled={cantidad >= producto.stock}
        >
          <Icono nombre="mas" />
        </button>
      </div>
    )
  }

  return (
    <button type="button" className="boton" onClick={() => agregarProducto(producto)}>
      <Icono nombre={icono} />
      {etiqueta}
    </button>
  )
}

export default ControlCantidad
