import { useEffect, useRef, useState } from 'react'
import AdminBar from '../../components/AdminBar'
import Icono from '../../components/Icono'
import MarcoImagen from '../../components/MarcoImagen'
import PuertaAdmin from '../../components/PuertaAdmin'
import { supabase, urlImagenProducto } from '../../lib/supabase'

const VACIO = {
  id: null,
  categoria_id: '',
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

// Shop-counter wording. The database errors stay off this screen.
function validarProducto(formulario) {
  const errores = {}
  if (!formulario.nombre.trim()) errores.nombre = 'Indicá el nombre.'

  const precioTexto = String(formulario.precio).trim().replace(',', '.')
  const precio = Number(precioTexto)
  if (!precioTexto || Number.isNaN(precio)) errores.precio = 'Indicá el precio.'
  else if (precio <= 0) errores.precio = 'El precio tiene que ser mayor a cero.'

  const stockTexto = String(formulario.stock).trim()
  const stock = Number(stockTexto)
  if (!stockTexto || !Number.isInteger(stock) || stock < 0) {
    errores.stock = 'Indicá el stock en unidades enteras, desde cero.'
  }

  if (!formulario.categoria_id) errores.categoria_id = 'Elegí una categoría.'

  return { errores, precio, stock }
}

function mensajeDeBase(error, fallback) {
  if (!error) return ''
  if (error.code === '23503') return 'No se puede eliminar: figura en un pedido.'
  return fallback
}

function ProductosAdmin() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [formulario, setFormulario] = useState(VACIO)
  const [archivo, setArchivo] = useState(null)
  const imagenRef = useRef(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [fila, setFila] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  useEffect(() => {
    if (!archivo) {
      setVistaPrevia(null)
      return undefined
    }
    const url = URL.createObjectURL(archivo)
    setVistaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  async function cargar() {
    const [resProductos, resCategorias] = await Promise.all([
      supabase.from('productos').select('*').order('nombre'),
      supabase.from('categorias').select('id, nombre').order('nombre'),
    ])
    if (resProductos.error || resCategorias.error) {
      setMensaje('No se pudo cargar el panel.')
      return
    }
    setProductos(resProductos.data ?? [])
    setCategorias(resCategorias.data ?? [])
  }

  function editar(producto) {
    setErrores({})
    setMensaje('')
    limpiarArchivo()
    setFormulario({
      id: producto.id,
      categoria_id: producto.categoria_id ?? '',
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

  function limpiarArchivo() {
    setArchivo(null)
    if (imagenRef.current) imagenRef.current.value = ''
  }

  function nuevo() {
    setFormulario(VACIO)
    limpiarArchivo()
    setErrores({})
    setMensaje('')
  }

  function cambiar(campo, valor) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }))
  }

  async function subirImagen(id) {
    const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${id}-${Date.now()}.${extension}`
    const { error } = await supabase.storage.from('productos').upload(path, archivo, {
      contentType: archivo.type || 'image/jpeg',
      upsert: false,
    })
    if (error) return { error }
    const { error: errorRuta } = await supabase.from('productos').update({ imagen_path: path }).eq('id', id)
    return { error: errorRuta, path }
  }

  async function guardar(e) {
    e.preventDefault()
    const { errores: hallados, precio, stock } = validarProducto(formulario)
    setErrores(hallados)
    if (Object.keys(hallados).length > 0) {
      setMensaje('Revisá los datos antes de guardar.')
      return
    }

    setGuardando(true)
    setMensaje('')
    const cuerpo = {
      categoria_id: formulario.categoria_id,
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      precio,
      unidad_venta: formulario.unidad_venta.trim() || 'unidad',
      stock,
      info_nutricional: formulario.info_nutricional.trim() || null,
      sin_tacc: formulario.sin_tacc,
      vegano: formulario.vegano,
      sin_lactosa: formulario.sin_lactosa,
    }

    // A new row stays unpublished until the row action publishes it.
    const consulta = formulario.id
      ? supabase.from('productos').update(cuerpo).eq('id', formulario.id).select('id').single()
      : supabase.from('productos').insert({ ...cuerpo, publicado: false }).select('id').single()

    const { data, error } = await consulta
    if (error || !data?.id) {
      setGuardando(false)
      setMensaje('No se pudo guardar el producto.')
      return
    }

    if (archivo) {
      const subida = await subirImagen(data.id)
      if (subida.error) {
        setGuardando(false)
        setFormulario((actual) => ({ ...actual, id: data.id }))
        setMensaje('El producto se guardó, pero la imagen no se subió.')
        await cargar()
        return
      }
      setFormulario((actual) => ({ ...actual, id: data.id, imagen_path: subida.path }))
      limpiarArchivo()
    } else {
      setFormulario((actual) => ({ ...actual, id: data.id }))
    }

    await cargar()
    setGuardando(false)
    setMensaje('Producto guardado.')
  }

  async function publicar(producto) {
    setFila(producto.id)
    setMensaje('')
    const { error } = await supabase
      .from('productos')
      .update({ publicado: !producto.publicado })
      .eq('id', producto.id)
    setFila(null)
    if (error) {
      setMensaje('No se pudo cambiar la publicación.')
      return
    }
    await cargar()
  }

  async function guardarFila(producto) {
    const precioTexto = String(producto.precioFila).trim().replace(',', '.')
    const stockTexto = String(producto.stockFila).trim()
    const precio = Number(precioTexto)
    const stock = Number(stockTexto)
    if (!precioTexto || Number.isNaN(precio) || precio <= 0) {
      setMensaje(`Indicá un precio mayor a cero para ${producto.nombre}.`)
      return
    }
    if (!stockTexto || !Number.isInteger(stock) || stock < 0) {
      setMensaje(`Indicá un stock entero, desde cero, para ${producto.nombre}.`)
      return
    }
    if (Number(producto.precio) === precio && Number(producto.stock) === stock) return

    setFila(producto.id)
    setMensaje('')
    const { error } = await supabase.from('productos').update({ precio, stock }).eq('id', producto.id)
    setFila(null)
    if (error) {
      setMensaje('No se pudo guardar el precio o el stock.')
      return
    }
    if (formulario.id === producto.id) {
      setFormulario((actual) => ({ ...actual, precio, stock }))
    }
    await cargar()
    setMensaje('Precio y stock actualizados.')
  }

  async function eliminar() {
    if (!formulario.id) return
    if (!window.confirm('¿Eliminar este producto?')) return
    setGuardando(true)
    setMensaje('')
    const { error } = await supabase.from('productos').delete().eq('id', formulario.id)
    setGuardando(false)
    const texto = mensajeDeBase(error, 'No se pudo eliminar el producto.')
    if (error) {
      setMensaje(texto)
      return
    }
    nuevo()
    await cargar()
    setMensaje('Producto eliminado.')
  }

  return (
    <>
      <AdminBar
        titulo="Productos"
        accion={
          <button type="button" className="boton" onClick={nuevo}>
            <Icono nombre="mas" />
            Nuevo
          </button>
        }
      />
      <main className="pagina">
        {mensaje && <p className="nota" role="alert">{mensaje}</p>}
        <div className="tabla tabla-productos">
          <div className="tabla-cabeza">
            <span>Nombre</span>
            <span>Precio</span>
            <span>Stock</span>
            <span />
          </div>
          {productos.map((producto) => (
            <FilaProducto
              key={producto.id}
              producto={producto}
              ocupada={fila === producto.id || guardando}
              onEditar={() => editar(producto)}
              onPublicar={() => publicar(producto)}
              onGuardar={guardarFila}
            />
          ))}
        </div>

        <h2 className="subtitulo">Alta y edición · un solo formulario</h2>
        <form className="panel formulario" noValidate onSubmit={guardar}>
          <div className="form-grid">
            <Campo
              id="nombre-producto"
              etiqueta="Nombre"
              valor={formulario.nombre}
              error={errores.nombre}
              onChange={(valor) => cambiar('nombre', valor)}
            />
            <Campo
              id="descripcion-producto"
              etiqueta="Descripción"
              valor={formulario.descripcion}
              onChange={(valor) => cambiar('descripcion', valor)}
            />
            <Campo
              id="precio-producto"
              etiqueta="Precio"
              valor={formulario.precio}
              error={errores.precio}
              onChange={(valor) => cambiar('precio', valor)}
            />
            <Campo
              id="unidad-producto"
              etiqueta="Unidad de venta"
              valor={formulario.unidad_venta}
              onChange={(valor) => cambiar('unidad_venta', valor)}
            />
            <Campo
              id="stock-producto"
              etiqueta="Stock"
              valor={formulario.stock}
              error={errores.stock}
              onChange={(valor) => cambiar('stock', valor)}
            />
            <div>
              <label className="etiqueta" htmlFor="categoria-producto">Categoría</label>
              <select
                className={errores.categoria_id ? 'campo campo-invalido' : 'campo'}
                id="categoria-producto"
                value={formulario.categoria_id}
                aria-invalid={Boolean(errores.categoria_id)}
                onChange={(e) => cambiar('categoria_id', e.target.value)}
              >
                <option value="">Elegí una categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                ))}
              </select>
              {errores.categoria_id && <p className="nota" role="alert">{errores.categoria_id}</p>}
            </div>
            <Campo
              id="nutricion-producto"
              etiqueta="Información nutricional"
              valor={formulario.info_nutricional}
              onChange={(valor) => cambiar('info_nutricional', valor)}
            />
          </div>
          <div className="form-pie">
            <div>
              <label className="etiqueta" htmlFor="imagen-producto">Imagen</label>
              <input
                id="imagen-producto"
                ref={imagenRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
              <MarcoImagen
                variante="mini-ancha"
                src={vistaPrevia || urlImagenProducto(formulario.imagen_path)}
                alt=""
              />
            </div>
            <div className="filtros">
              <label className="check">
                <input type="checkbox" checked={formulario.sin_tacc} onChange={(e) => cambiar('sin_tacc', e.target.checked)} />
                Sin TACC
              </label>
              <label className="check">
                <input type="checkbox" checked={formulario.vegano} onChange={(e) => cambiar('vegano', e.target.checked)} />
                Vegano
              </label>
              <label className="check">
                <input type="checkbox" checked={formulario.sin_lactosa} onChange={(e) => cambiar('sin_lactosa', e.target.checked)} />
                Sin lactosa
              </label>
            </div>
            <button className="boton" type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
            {formulario.id && (
              <button className="boton boton-suave" type="button" disabled={guardando} onClick={eliminar}>
                Eliminar
              </button>
            )}
          </div>
        </form>
      </main>
    </>
  )
}

function Campo({ id, etiqueta, valor, error, onChange }) {
  return (
    <div>
      <label className="etiqueta" htmlFor={id}>{etiqueta}</label>
      <input
        className={error ? 'campo campo-invalido' : 'campo'}
        id={id}
        value={valor ?? ''}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="nota" role="alert">{error}</p>}
    </div>
  )
}

// Price and stock stay on the row so a restock does not open the full form.
function FilaProducto({ producto, ocupada, onEditar, onPublicar, onGuardar }) {
  const [precio, setPrecio] = useState(String(producto.precio ?? ''))
  const [stock, setStock] = useState(String(producto.stock ?? ''))

  useEffect(() => {
    setPrecio(String(producto.precio ?? ''))
    setStock(String(producto.stock ?? ''))
  }, [producto.precio, producto.stock])

  return (
    <div className="tabla-fila">
      <span>
        {producto.nombre}
        {!producto.publicado && <span className="nota"> · No publicado</span>}
      </span>
      <input
        className="campo"
        value={precio}
        aria-label={`Precio de ${producto.nombre}`}
        disabled={ocupada}
        onChange={(e) => setPrecio(e.target.value)}
      />
      <input
        className="campo"
        value={stock}
        aria-label={`Stock de ${producto.nombre}`}
        disabled={ocupada}
        onChange={(e) => setStock(e.target.value)}
      />
      <span className="tabla-acciones">
        <button
          type="button"
          className="boton boton-suave"
          disabled={ocupada}
          onClick={() => onGuardar({ ...producto, precioFila: precio, stockFila: stock })}
        >
          Guardar
        </button>
        <button type="button" className="boton boton-suave" disabled={ocupada} onClick={onEditar}>
          Editar
        </button>
        <button type="button" className="boton boton-suave" disabled={ocupada} onClick={onPublicar}>
          {producto.publicado ? 'Despublicar' : 'Publicar'}
        </button>
      </span>
    </div>
  )
}

function ProductosAdminPuerta() {
  return (
    <PuertaAdmin>
      <ProductosAdmin />
    </PuertaAdmin>
  )
}

export default ProductosAdminPuerta
