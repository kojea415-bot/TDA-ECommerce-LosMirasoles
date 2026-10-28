import { Link } from 'react-router-dom'

// The card matches the wireframe. A real order number arrives when checkout writes one.
function Confirmacion() {
  return (
    <main className="pagina">
      <p className="ceja">Confirmación</p>
      <article className="confirmacion">
        <h1 className="titulo titulo-centro">Todavía no hay un pedido confirmado</h1>
        <p className="estado">En preparación</p>
        <ul className="confirmacion-lineas">
          <li><span>Productos del pedido</span><span /></li>
          <li><span>Envío o retiro</span><span /></li>
        </ul>
        <p className="resumen-total"><span>Total</span><span>—</span></p>
        <p className="nota">Retiro: se muestra la dirección del local.</p>
        <p className="nota">Se envía el comprobante al correo del pedido.</p>
        <Link to="/" className="boton">Volver al catálogo</Link>
      </article>
    </main>
  )
}

export default Confirmacion
