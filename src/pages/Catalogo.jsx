import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, urlImagenProducto } from '../lib/supabase'
import { etiquetasDe, pesos } from '../lib/presentacion'
import { useCart } from '../context/CartContext'
import MarcoImagen from '../components/MarcoImagen'
import Icono from '../components/Icono'
import ControlCantidad from '../components/ControlCantidad'

// Pasa a minúsculas y saca espacios y tildes, para que "organica" encuentre "Orgánica"
function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const APTITUDES = [
  { clave: 'sin_tacc', etiqueta: 'Sin TACC' },
  { clave: 'vegano', etiqueta: 'Vegano' },
  { clave: 'sin_lactosa', etiqueta: 'Sin lactosa' },
]

// Pantalla de inicio: trae los productos publicados de Supabase
function Catalogo() {
  const { items } = useCart()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaElegida, setCategoriaElegida] = useState('')
  const [aptitudes, setAptitudes] = useState({
    sin_tacc: false,
    vegano: false,
    sin_lactosa: false,
  })

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
    return <main className="pagina"><p>Cargando...</p></main>
  }

  if (mensajeError) {
    return <main className="pagina"><p role="alert">{mensajeError}</p></main>
  }

  // Cuántas unidades de ese producto ya hay en el carrito
  function cantidadEnCarrito(id) {
    const item = items.find((i) => i.id === id)
    return item ? item.cantidad : 0
  }

  // Checked dietary flags all have to match. None checked means no extra filter.
  const productosFiltrados = productos.filter(
    (p) =>
      normalizar(p.nombre).includes(normalizar(busqueda)) &&
      (categoriaElegida === '' || p.categoria_id === categoriaElegida) &&
      (!aptitudes.sin_tacc || p.sin_tacc) &&
      (!aptitudes.vegano || p.vegano) &&
      (!aptitudes.sin_lactosa || p.sin_lactosa)
  )

  return (
    <main className="pagina catalogo">
      <p className="ceja">Catálogo</p>
      <div className="catalogo-tope">
        <div className="chips">
          <button
            type="button"
            className="chip"
            aria-pressed={categoriaElegida === ''}
            onClick={() => setCategoriaElegida('')}
          >
            Todas
          </button>
          {categorias.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              className="chip"
              aria-pressed={categoriaElegida === categoria.id}
              onClick={() => setCategoriaElegida(categoria.id)}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
        <label className="buscar">
          <Icono nombre="buscar" />
          <input
            className="campo campo-buscar"
            type="search"
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
      </div>

      <div className="filtros">
        {APTITUDES.map((aptitud) => (
          <label key={aptitud.clave} className="check">
            <input
              type="checkbox"
              checked={aptitudes[aptitud.clave]}
              onChange={() =>
                setAptitudes((prev) => ({ ...prev, [aptitud.clave]: !prev[aptitud.clave] }))
              }
            />
            {aptitud.etiqueta}
          </label>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <p>No hay productos que coincidan con tu búsqueda.</p>
      )}

      <ul className="grilla">
        {productosFiltrados.map((producto) => {
          const etiquetas = etiquetasDe(producto)
          const sinStock = producto.stock <= 0
          return (
            <li key={producto.id} className="tarjeta">
              <Link to={`/producto/${producto.id}`} aria-label={producto.nombre}>
                <MarcoImagen src={urlImagenProducto(producto.imagen_path)} alt="" />
              </Link>
              <h2 className="tarjeta-nombre">
                <Link to={`/producto/${producto.id}`}>{producto.nombre}</Link>
              </h2>
              {etiquetas.length > 0 && (
                <p className="chips chips-chicos">
                  {etiquetas.map((etiqueta) => (
                    <span key={etiqueta} className="chip chip-fijo">{etiqueta}</span>
                  ))}
                </p>
              )}
              <p className="precio">{pesos(producto.precio)}</p>
              {sinStock ? (
                <span className="chip chip-aviso">Sin stock</span>
              ) : (
                <ControlCantidad producto={producto} cantidad={cantidadEnCarrito(producto.id)} />
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}

export default Catalogo
