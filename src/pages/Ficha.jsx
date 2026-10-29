import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, urlImagenProducto } from '../lib/supabase'
import { etiquetasDe, pesos } from '../lib/presentacion'
import { useCart } from '../context/CartContext'
import MarcoImagen from '../components/MarcoImagen'
import Icono from '../components/Icono'
import ControlCantidad from '../components/ControlCantidad'

function Ficha() {
  const { id } = useParams()
  const { items } = useCart()
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vigente = true
    supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('publicado', true)
      .maybeSingle()
      .then(({ data }) => {
        if (vigente) {
          setProducto(data)
          setCargando(false)
        }
      })
    return () => {
      vigente = false
    }
  }, [id])

  if (cargando) {
    return <main className="pagina"><p>Cargando...</p></main>
  }

  if (!producto) {
    return (
      <main className="pagina">
        <p className="ceja">Ficha de producto</p>
        <p>Ese producto no está publicado.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    )
  }

  const enCarrito = items.find((item) => item.id === producto.id)?.cantidad ?? 0
  const sinStock = producto.stock <= 0
  const etiquetas = etiquetasDe(producto)

  return (
    <main className="pagina">
      <p className="ceja">Ficha de producto</p>
      <p><Link to="/">← Volver al catálogo</Link></p>
      <article className="ficha">
        <MarcoImagen
          variante="alta"
          src={urlImagenProducto(producto.imagen_path)}
          alt={producto.nombre}
        />
        <div className="ficha-info">
          <h1 className="titulo">{producto.nombre}</h1>
          {etiquetas.length > 0 && (
            <p className="chips">
              {etiquetas.map((etiqueta) => (
                <span key={etiqueta} className="chip chip-fijo">{etiqueta}</span>
              ))}
            </p>
          )}
          <p className="ficha-precio">
            <span className="precio precio-grande">{pesos(producto.precio)}</span>
            <span className="nota">unidad: {producto.unidad_venta}</span>
          </p>
          {producto.descripcion && (
            <>
              <p className="etiqueta">Descripción</p>
              <p>{producto.descripcion}</p>
            </>
          )}
          {producto.info_nutricional && (
            <>
              <p className="etiqueta">Información nutricional</p>
              <p className="caja">{producto.info_nutricional}</p>
            </>
          )}
          <p className={sinStock ? 'disponible disponible-no' : 'disponible'}>
            <Icono nombre={sinStock ? 'menos' : 'check'} />
            {sinStock ? 'No disponible' : 'Disponible'}
          </p>
          {!sinStock && (
            <ControlCantidad
              producto={producto}
              cantidad={enCarrito}
              etiqueta="Agregar al carrito"
              icono="carrito"
            />
          )}
        </div>
      </article>
    </main>
  )
}

export default Ficha
