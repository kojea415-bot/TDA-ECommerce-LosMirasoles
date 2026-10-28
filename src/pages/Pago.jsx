import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { pesos } from '../lib/presentacion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Resumen({ items, envio, total }) {
  return (
    <aside className="resumen">
      <h2>Resumen</h2>
      {items.length === 0 && <p className="nota">El carrito está vacío.</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.nombre} × {item.cantidad}</span>
            <span>{pesos(item.precio * item.cantidad)}</span>
          </li>
        ))}
      </ul>
      <p className="resumen-linea">
        <span className="nota">Envío</span>
        <span>{pesos(envio)}</span>
      </p>
      <p className="resumen-total">
        <span>Total</span>
        <span>{pesos(total)}</span>
      </p>
    </aside>
  )
}

// Layout of the two checkout steps. Confirming the order is still the backlog story.
function Pago() {
  const { items, subtotal } = useCart()
  const { usuario, perfil } = useAuth()
  const [paso, setPaso] = useState(1)
  const [modalidad, setModalidad] = useState('envio')
  const [domicilio, setDomicilio] = useState('')
  const [codigoPostal, setCodigoPostal] = useState('')
  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState(usuario?.email ?? '')
  const [costoEnvio, setCostoEnvio] = useState(0)
  const [zonaConsultada, setZonaConsultada] = useState(false)
  const [resultado, setResultado] = useState('aprobado')

  const envio = modalidad === 'envio' ? costoEnvio : 0

  async function verificarZona() {
    const { data } = await supabase
      .from('zonas_cobertura')
      .select('costo_envio')
      .eq('codigo_postal', codigoPostal.trim())
      .maybeSingle()
    // Unknown postal codes keep shipping and cost 0. They do not block the step.
    setCostoEnvio(data ? Number(data.costo_envio) : 0)
    setZonaConsultada(true)
  }

  return (
    <main className="pagina">
      <p className="ceja">
        Pago · paso {paso} de 2 · {paso === 1 ? 'Entrega' : 'Cobro simulado'}
      </p>
      <div className="pago">
        <section>
          {paso === 1 ? (
            <>
              <h1 className="titulo">Entrega y datos</h1>
              <form className="formulario" onSubmit={(e) => { e.preventDefault(); setPaso(2) }}>
                <label className="opcion">
                  <input
                    type="radio"
                    name="modalidad"
                    checked={modalidad === 'retiro'}
                    onChange={() => setModalidad('retiro')}
                  />
                  Retiro en el local · envío {pesos(0)}
                </label>
                <label className="opcion">
                  <input
                    type="radio"
                    name="modalidad"
                    checked={modalidad === 'envio'}
                    onChange={() => setModalidad('envio')}
                  />
                  Envío a domicilio
                </label>

                {modalidad === 'envio' && (
                  <>
                    <label className="etiqueta" htmlFor="domicilio">Calle, altura y localidad</label>
                    <input
                      className="campo"
                      id="domicilio"
                      value={domicilio}
                      placeholder="San Justo"
                      onChange={(e) => setDomicilio(e.target.value)}
                      required
                    />
                    <label className="etiqueta" htmlFor="cp">Código postal</label>
                    <div className="linea-cp">
                      <input
                        className="campo"
                        id="cp"
                        value={codigoPostal}
                        placeholder="1754"
                        onChange={(e) => {
                          setCodigoPostal(e.target.value)
                          setZonaConsultada(false)
                        }}
                        required
                      />
                      <button className="boton" type="button" onClick={verificarZona}>
                        Verificar zona
                      </button>
                      {zonaConsultada && <span>Costo de envío {pesos(costoEnvio)}</span>}
                    </div>
                  </>
                )}

                <div className="dos">
                  <div>
                    <label className="etiqueta" htmlFor="nombre-pedido">Nombre</label>
                    <input
                      className="campo"
                      id="nombre-pedido"
                      value={nombre}
                      placeholder="Nombre y apellido"
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="etiqueta" htmlFor="telefono">Teléfono</label>
                    <input
                      className="campo"
                      id="telefono"
                      value={telefono}
                      placeholder="11 0000 0000"
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <label className="etiqueta" htmlFor="correo-pedido">Correo</label>
                <input
                  className="campo"
                  id="correo-pedido"
                  type="email"
                  value={correo}
                  placeholder="correo@ejemplo.com"
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
                <button className="boton" type="submit" disabled={items.length === 0}>
                  Continuar
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="titulo">Cobro simulado</h1>
              <form className="formulario" onSubmit={(e) => e.preventDefault()}>
                <p className="nota">Resultado a simular</p>
                {['aprobado', 'rechazado', 'pendiente'].map((valor) => (
                  <label key={valor} className="opcion">
                    <input
                      type="radio"
                      name="resultado"
                      checked={resultado === valor}
                      onChange={() => setResultado(valor)}
                    />
                    {valor === 'aprobado' ? 'Aprobado' : valor === 'rechazado' ? 'Rechazado' : 'Pendiente'}
                  </label>
                ))}
                <button className="boton" type="submit">Confirmar pedido</button>
                <button className="enlace" type="button" onClick={() => setPaso(1)}>
                  Volver a la entrega
                </button>
              </form>
            </>
          )}
          {!usuario && (
            <p className="nota">Para continuar hace falta una sesión. <Link to="/ingreso">Ingresar</Link></p>
          )}
        </section>
        <Resumen items={items} envio={envio} total={subtotal + envio} />
      </div>
    </main>
  )
}

export default Pago
