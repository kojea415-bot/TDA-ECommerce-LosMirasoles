import { Link, useLocation } from 'react-router-dom'
import Icono from '../components/Icono'
import { pesos } from '../lib/presentacion'

const ESTADOS = {
  en_preparacion: 'En preparación',
  pendiente_confirmacion: 'Pendiente de confirmación',
}

// Shows the order returned by confirmar-pedido. A reload has no order in memory.
function Confirmacion() {
  const pedido = useLocation().state

  if (!pedido?.id) {
    return (
      <main className="pagina">
        <p className="ceja">Confirmación</p>
        <article className="confirmacion">
          <span className="sello"><Icono nombre="sobre" tamano={22} /></span>
          <h1 className="titulo titulo-centro">Todavía no hay un pedido confirmado</h1>
          <Link to="/" className="boton">Volver al catálogo</Link>
        </article>
      </main>
    )
  }

  const confirmado = pedido.estado === 'en_preparacion'
  const envio = Number(pedido.costoEnvio) || 0

  return (
    <main className="pagina">
      <p className="ceja">Confirmación</p>
      <article className="confirmacion">
        <span className="sello">
          <Icono nombre="check" tamano={22} />
        </span>
        <h1 className="titulo titulo-centro">
          {confirmado ? `Pedido #${pedido.id} confirmado` : `Pedido #${pedido.id} registrado`}
        </h1>
        <p className="estado">{ESTADOS[pedido.estado] ?? pedido.estado}</p>
        <ul className="confirmacion-lineas">
          {(pedido.items ?? []).map((item) => (
            <li key={item.productoId}>
              <span>{item.nombre} × {item.cantidad}</span>
              <span>{pesos(Number(item.precioUnitario) * item.cantidad)}</span>
            </li>
          ))}
          <li>
            <span>{pedido.modalidad === 'retiro' ? 'Retiro en el local' : 'Envío'}</span>
            <span>{pesos(envio)}</span>
          </li>
        </ul>
        <p className="resumen-total">
          <span>Total</span>
          <span>{pesos(pedido.total)}</span>
        </p>
        {pedido.modalidad === 'retiro' && pedido.direccionLocal && (
          <p className="nota">Retiro: {pedido.direccionLocal}.</p>
        )}
        <p className="nota">
          {pedido.mail_ok
            ? 'Se envió el comprobante al correo del pedido.'
            : 'El pedido quedó registrado. El comprobante por correo no salió.'}
        </p>
        <Link to="/" className="boton">Volver al catálogo</Link>
      </article>
    </main>
  )
}

export default Confirmacion
