import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminBar from '../../components/AdminBar'
import MarcoImagen from '../../components/MarcoImagen'
import { useAuth } from '../../context/AuthContext'
import { supabase, urlImagenProducto } from '../../lib/supabase'

const VACIO = {
  id: null,
  nombre: '',
  descripcion: '',
  precio: '',
  unidad_venta: '',
  stock: '',
  info_nutricional: '',
  sin_tacc: false,
  vegano: false,
  sin_lactosa: false,
  imagen_path: null,
}

function ProductosAdmin() {
  const { perfil, cargando } = useAuth()
  const [productos, setProductos] = useState([])
  const [formulario, setFormulario] = useState(VACIO)

  const esAdmin = perfil?.rol === 'administrador'

  useEffect(() => {
    if (!esAdmin) return
    supabase.from('productos').select('*').order('nombre').then(({ data }) => {
      setProductos(data ?? [])
    })
  }, [esAdmin])

  function editar(producto) {
    setFormulario({
      id: producto.id,
      nombre: producto.nombre ?? '',
      descripcion: producto.descripcion ?? '',
      precio: producto.precio ?? '',
      unidad_venta: producto.unidad_venta ?? '',
      stock: producto.stock ?? '',
      info_nutricional: producto.info_nutricional ?? '',
      sin_tacc: Boolean(producto.sin_tacc),
      vegano: Boolean(producto.vegano),
      sin_lactosa: Boolean(producto.sin_lactosa),
      imagen_path: producto.imagen_path,
    })
  }

  if (cargando) return <main className="pagina"><p>Cargando...</p></main>
  if (!esAdmin) {
    return (
      <main className="pagina">
        <p>Esta pantalla es del administrador.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    )
  }

  return (
    <>
      <AdminBar
        titulo="Productos"
        accion={
          <button type="button" className="boton" onClick={() => setFormulario(VACIO)}>
            Nuevo
          </button>
        }
      />
      <main className="pagina">
        <div className="tabla">
          <div className="tabla-cabeza">
            <span>Nombre</span>
            <span>Precio</span>
            <span>Stock</span>
            <span />
          </div>
          {productos.map((producto) => (
            <div key={producto.id} className="tabla-fila">
              <span>{producto.nombre}</span>
              <input className="campo" readOnly value={producto.precio} aria-label={`Precio de ${producto.nombre}`} />
              <input className="campo" readOnly value={producto.stock} aria-label={`Stock de ${producto.nombre}`} />
              <span className="tabla-acciones">
                <button type="button" className="boton boton-suave" onClick={() => editar(producto)}>
                  Editar
                </button>
                <button type="button" className="boton boton-suave">
                  {producto.publicado ? 'Despublicar' : 'Publicar'}
                </button>
              </span>
            </div>
          ))}
        </div>

        <h2 className="subtitulo">Alta y edición · un solo formulario</h2>
        <form className="panel formulario" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div>
              <label className="etiqueta" htmlFor="nombre-producto">Nombre</label>
              <input className="campo" id="nombre-producto" value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="descripcion-producto">Descripción</label>
              <input className="campo" id="descripcion-producto" value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="precio-producto">Precio</label>
              <input className="campo" id="precio-producto" value={formulario.precio} onChange={(e) => setFormulario({ ...formulario, precio: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="unidad-producto">Unidad de venta</label>
              <input className="campo" id="unidad-producto" value={formulario.unidad_venta} onChange={(e) => setFormulario({ ...formulario, unidad_venta: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="stock-producto">Stock</label>
              <input className="campo" id="stock-producto" value={formulario.stock} onChange={(e) => setFormulario({ ...formulario, stock: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="nutricion-producto">Información nutricional</label>
              <input className="campo" id="nutricion-producto" value={formulario.info_nutricional} onChange={(e) => setFormulario({ ...formulario, info_nutricional: e.target.value })} />
            </div>
          </div>
          <div className="form-pie">
            <div>
              <p className="etiqueta">Imagen</p>
              <MarcoImagen variante="mini-ancha" src={urlImagenProducto(formulario.imagen_path)} alt="" />
            </div>
            <div className="filtros">
              <label className="check">
                <input type="checkbox" checked={formulario.sin_tacc} onChange={(e) => setFormulario({ ...formulario, sin_tacc: e.target.checked })} />
                Sin TACC
              </label>
              <label className="check">
                <input type="checkbox" checked={formulario.vegano} onChange={(e) => setFormulario({ ...formulario, vegano: e.target.checked })} />
                Vegano
              </label>
              <label className="check">
                <input type="checkbox" checked={formulario.sin_lactosa} onChange={(e) => setFormulario({ ...formulario, sin_lactosa: e.target.checked })} />
                Sin lactosa
              </label>
            </div>
            <button className="boton" type="submit">Guardar</button>
          </div>
        </form>
      </main>
    </>
  )
}

export default ProductosAdmin
