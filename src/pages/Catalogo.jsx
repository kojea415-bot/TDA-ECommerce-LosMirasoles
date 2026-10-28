import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

// Pantalla de inicio: trae los productos publicados de Supabase
function Catalogo() {
  const { agregarProducto } = useCart()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState('')

  // Una sola vez al abrir la pantalla: pide los productos
  useEffect(() => {
    async function traerProductos() {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('publicado', true)

      if (error) {
        setMensajeError('No se pudieron cargar los productos')
      } else {
        setProductos(data)
      }
      setCargando(false)
    }

    traerProductos()
  }, [])

  if (cargando) {
    return <p>Cargando...</p>
  }

  if (mensajeError) {
    return <p role="alert">{mensajeError}</p>
  }

  return (
    <main className="catalogo">
      <h2>Catálogo</h2>

      <ul className="catalogo-lista">
        {productos.map((producto) => (
          <li key={producto.id} className="catalogo-tarjeta">
            <h3>{producto.nombre}</h3>
            <p>{producto.unidad_venta}</p>
            <p>${producto.precio}</p>

            {producto.stock > 0 ? (
              <button type="button" onClick={() => agregarProducto(producto)}>
                Agregar
              </button>
            ) : (
              <p>Sin stock</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Catalogo
