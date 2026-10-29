import { useEffect, useState } from 'react'
import AdminBar from '../../components/AdminBar'
import PuertaAdmin from '../../components/PuertaAdmin'
import { pesos } from '../../lib/presentacion'
import { supabase } from '../../lib/supabase'

const ESTADOS = [
  ['', 'Todos'],
  ['pendiente_confirmacion', 'Pendiente de confirmación'],
  ['recibido', 'Recibido'],
  ['en_preparacion', 'En preparación'],
  ['listo_retiro', 'Listo para retiro'],
  ['despachado', 'Despachado'],
  ['entregado', 'Entregado'],
  ['cancelado', 'Cancelado'],
]

const CON_STOCK = new Set(['en_preparacion', 'listo_retiro', 'despachado', 'entregado'])

function etiquetaEstado(valor) {
  return ESTADOS.find(([clave]) => clave === valor)?.[1] ?? valor
}

function fechaLocal(valor) {
  if (!valor) return ''
  return new Date(valor).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
}

function ultimaMarca(pedido) {
  const marcas = pedido.pedido_cambios ?? []
  return marcas.reduce((max, marca) => (marca.en > max ? marca.en : max), '')
}

// Retiro and shipping share one cycle step, with a different label.
function opcionesDe(pedido) {
  return ESTADOS.filter(([valor]) => {
    if (!valor) return false
    if (valor === 'listo_retiro') return pedido.modalidad === 'retiro' || pedido.estado === valor
    if (valor === 'despachado') return pedido.modalidad === 'envio' || pedido.estado === valor
    return true
  })
}

function textoDeCambio(anterior, siguiente) {
  const tenia = CON_STOCK.has(anterior)
  const pide = CON_STOCK.has(siguiente)
  if (!tenia && pide) return 'Estado actualizado. Se descontó el stock.'
  if (tenia && !pide) return 'Estado actualizado. El stock volvió al catálogo.'
  return 'Estado actualizado.'
}

function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([])
  const [estado, setEstado] = useState('')
  const [entrega, setEntrega] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [buscar, setBuscar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, pedido_cambios(en)')
      .order('id', { ascending: false })
    if (error) {
      setMensaje('No se pudieron cargar los pedidos.')
      return
    }
    setPedidos(data ?? [])
  }

  async function cambiarEstado(pedido, siguiente) {
    if (siguiente === pedido.estado) return
    setGuardando(pedido.id)
    setMensaje('')
    const { error } = await supabase.from('pedidos').update({ estado: siguiente }).eq('id', pedido.id)
    setGuardando(null)
    if (error) {
      const texto = error.message || ''
      if (error.code === 'P0001' && texto) {
        setMensaje(texto.endsWith('.') ? texto : `${texto}.`)
      } else {
        setMensaje('No se pudo cambiar el estado.')
      }
      return
    }
    setMensaje(textoDeCambio(pedido.estado, siguiente))
    await cargar()
  }

  const texto = buscar.trim().toLowerCase()
  const visibles = pedidos.filter((pedido) => {
    const fecha = (pedido.creado_en ?? '').slice(0, 10)
    const coincideTexto = !texto
      || String(pedido.id).includes(texto)
      || (pedido.nombre ?? '').toLowerCase().includes(texto)
    return (
      coincideTexto &&
      (!estado || pedido.estado === estado) &&
      (!entrega || pedido.modalidad === entrega) &&
      (!desde || fecha >= desde) &&
      (!hasta || fecha <= hasta)
    )
  })

  return (
    <>
      <AdminBar titulo="Pedidos" />
      <main className="pagina">
        {mensaje && <p className="nota" role="alert">{mensaje}</p>}
        <div className="admin-filtros">
          <label>
            <span className="etiqueta">Estado</span>
            <select className="campo" value={estado} onChange={(e) => setEstado(e.target.value)}>
              {ESTADOS.map(([valor, nombre]) => (
                <option key={valor || 'todos'} value={valor}>{nombre}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="etiqueta">Entrega</span>
            <select className="campo" value={entrega} onChange={(e) => setEntrega(e.target.value)}>
              <option value="">Todas</option>
              <option value="retiro">Retiro</option>
              <option value="envio">Envío</option>
            </select>
          </label>
          <label>
            <span className="etiqueta">Desde</span>
            <input className="campo" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <label>
            <span className="etiqueta">Hasta</span>
            <input className="campo" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </label>
          <label className="admin-buscar">
            <span className="etiqueta">Buscar</span>
            <input
              className="campo"
              value={buscar}
              placeholder="Nº de pedido o cliente"
              onChange={(e) => setBuscar(e.target.value)}
            />
          </label>
        </div>

        <div className="tabla">
          <div className="tabla-cabeza tabla-pedidos">
            <span>#</span>
            <span>Fecha</span>
            <span>Cliente</span>
            <span>Entrega</span>
            <span>Total</span>
            <span>Estado</span>
          </div>
          {visibles.length === 0 && <p className="nota">No hay pedidos para ese filtro.</p>}
          {visibles.map((pedido) => (
            <div key={pedido.id} className="tabla-fila tabla-pedidos">
              <span>{pedido.id}</span>
              <span>{pedido.creado_en ? new Date(pedido.creado_en).toLocaleDateString('es-AR') : ''}</span>
              <span>{pedido.nombre}</span>
              <span>{pedido.modalidad === 'envio' ? 'Envío' : 'Retiro'}</span>
              <span>{pesos(pedido.total)}</span>
              <div className="tabla-estado">
                <select
                  className="campo"
                  value={pedido.estado}
                  aria-label={`Estado del pedido ${pedido.id}`}
                  disabled={guardando === pedido.id}
                  onChange={(e) => cambiarEstado(pedido, e.target.value)}
                >
                  {opcionesDe(pedido).map(([valor, nombre]) => (
                    <option key={valor} value={valor}>{nombre}</option>
                  ))}
                  {!ESTADOS.some(([valor]) => valor === pedido.estado) && (
                    <option value={pedido.estado}>{etiquetaEstado(pedido.estado)}</option>
                  )}
                </select>
                <p className="nota">Desde {fechaLocal(ultimaMarca(pedido) || pedido.creado_en)}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="nota">
          Mismo paso del ciclo: «Listo para retiro» si retira, «Despachado» si es envío.
        </p>
      </main>
    </>
  )
}

function PedidosAdminPuerta() {
  return (
    <PuertaAdmin>
      <PedidosAdmin />
    </PuertaAdmin>
  )
}

export default PedidosAdminPuerta
