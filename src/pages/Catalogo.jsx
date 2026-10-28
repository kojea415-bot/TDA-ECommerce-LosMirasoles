import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

// Pasa a minúsculas y saca espacios y tildes, para que "organica" encuentre "Orgánica"
function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

// Pantalla de inicio: trae los productos publicados de Supabase
function Catalogo() {
  const { items, agregarProducto } = useCart()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaElegida, setCategoriaElegida] = useState('')

  // Una sola vez al abrir la pantalla: pide los productos y las categorías
  useEffect(() => {
    async function traerDatos() {
      const resProductos = await supabase
        .from('productos')
        .select('*')
        .eq('publicado', true)
      const resCategorias = await supabase
        .from('categorias')
        .select('*')
        .order('nombre')

      if (resProductos.error || resCategorias.error) {
        setMensajeError('No se pudieron cargar los productos')
      } else {
        setProductos(resProductos.data)
        setCategorias(resCategorias.data)
      }
      setCargando(false)
    }

    traerDatos()
  }, [])

  if (cargando) {
    return <p>Cargando...</p>
  }

  if (mensajeError) {
    return <p role="alert">{mensajeError}</p>
  }

  // Cuántas unidades de ese producto ya hay en el carrito
  function cantidadEnCarrito(id) {
    const item = items.find((i) => i.id === id)
    return item ? item.cantidad : 0
  }

  // La lista original no se toca: se arma una copia con los que cumplen
  // el buscador Y la categoría (sin categoría elegida, pasan todos)
  const productosFiltrados = productos.filter(
    (p) =>
      normalizar(p.nombre).includes(normalizar(busqueda)) &&
      (categoriaElegida === '' || p.categoria_id === categoriaElegida)
  )

  return (
    <main className="catalogo">
      <h2>Catálogo</h2>

      <input
        type="search"
        placeholder="Buscar producto"
        aria-label="Buscar producto"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="catalogo-categorias">
        <button
          type="button"
          aria-pressed={categoriaElegida === ''}
          onClick={() => setCategoriaElegida('')}
        >
          Todas
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            type="button"
            aria-pressed={categoriaElegida === categoria.id}
            onClick={() => setCategoriaElegida(categoria.id)}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <p>No hay productos que coincidan con tu búsqueda.</p>
      )}

      <ul className="catalogo-lista">
        {productosFiltrados.map((producto) => (
          <li key={producto.id} className="catalogo-tarjeta">
            <h3>{producto.nombre}</h3>
            <p>{producto.unidad_venta}</p>
            <p>${producto.precio}</p>

            {producto.stock > 0 ? (
              <button
                type="button"
                onClick={() => agregarProducto(producto)}
                disabled={cantidadEnCarrito(producto.id) >= producto.stock}
              >
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
