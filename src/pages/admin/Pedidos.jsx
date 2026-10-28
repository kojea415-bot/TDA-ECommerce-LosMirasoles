import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminBar from '../../components/AdminBar'
import { useAuth } from '../../context/AuthContext'
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

function etiquetaEstado(valor) {
  return ESTADOS.find(([clave]) => clave === valor)?.[1] ?? valor
}

function PedidosAdmin() {
  const { perfil, cargando } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [estado, setEstado] = useState('')
  const [entrega, setEntrega] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [buscar, setBuscar] = useState('')

  const esAdmin = perfil?.rol === 'administrador'

  useEffect(() => {
    if (!esAdmin) return
    supabase.from('pedidos').select('*').order('id', { ascending: false }).then(({ data }) => {
      setPedidos(data ?? [])
    })
  }, [esAdmin])

  if (cargando) return <main className="pagina"><p>Cargando...</p></main>
  if (!esAdmin) {
    return (
      <main className="pagina">
        <p>Esta pantalla es del administrador.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    )
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
              <select
                className="campo"
                value={pedido.estado}
                aria-label={`Estado del pedido ${pedido.id}`}
                onChange={() => {}}
              >
                {ESTADOS.filter(([valor]) => valor).map(([valor, nombre]) => (
                  <option key={valor} value={valor}>{nombre}</option>
                ))}
                {!ESTADOS.some(([valor]) => valor === pedido.estado) && (
                  <option value={pedido.estado}>{etiquetaEstado(pedido.estado)}</option>
                )}
              </select>
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

export default PedidosAdmin
