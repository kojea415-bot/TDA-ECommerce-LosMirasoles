import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

// Same lookup the checkout function uses. An unknown postal code stays at zero.
async function costoDeZona(codigo) {
  const { data, error } = await supabase
    .from('zonas_cobertura')
    .select('costo_envio')
    .eq('codigo_postal', codigo.trim())
    .maybeSingle()
  if (error) return null
  return data ? Number(data.costo_envio) : 0
}

// Reads the function error body. Stock conflicts name the product; other failures use the server text.
async function mensajeDeConfirmacion(error) {
  const respuesta = error?.context
  if (!respuesta || typeof respuesta.json !== 'function') {
    return 'No se pudo confirmar el pedido.'
  }
  try {
    const cuerpo = await respuesta.json()
    if (cuerpo?.producto) return `No alcanza el stock de ${cuerpo.producto}.`
    if (typeof cuerpo?.error === 'string' && cuerpo.error) return cuerpo.error
  } catch {
    // The function did not return JSON.
  }
  return 'No se pudo confirmar el pedido.'
}

// Two checkout steps. Confirm sends the cart to confirmar-pedido; prices and stock are decided there.
function Pago() {
  const { items, subtotal, vaciarCarrito } = useCart()
  const { usuario, perfil } = useAuth()
  const navegar = useNavigate()
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
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const envio = modalidad === 'envio' ? costoEnvio : 0

  // Auth can arrive after the first render. Fill only fields the user has not typed.
  useEffect(() => {
    if (!nombre && perfil?.nombre) setNombre(perfil.nombre)
    if (!correo && usuario?.email) setCorreo(usuario.email)
  }, [nombre, correo, perfil, usuario])

  async function confirmarPedido(evento) {
    evento.preventDefault()
    if (!usuario || items.length === 0 || enviando) return
    setEnviando(true)
    setMensaje('')

    const { data, error } = await supabase.functions.invoke('confirmar-pedido', {
      body: {
        items: items.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
        entrega: {
          modalidad,
          domicilio: modalidad === 'envio' ? domicilio.trim() : null,
          codigoPostal: modalidad === 'envio' ? codigoPostal.trim() : null,
        },
        contacto: {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          correo: correo.trim(),
        },
        resultadoCobro: resultado,
      },
    })

    setEnviando(false)
    if (error) {
      setMensaje(await mensajeDeConfirmacion(error))
      return
    }
    // A rejected charge is a 200 with no order. The cart stays as it is.
    if (!data?.id) {
      setMensaje('El cobro fue rechazado. El pedido no se registró.')
      return
    }
    vaciarCarrito()
    navegar('/confirmacion', { state: data })
  }

  async function verificarZona() {
    const costo = await costoDeZona(codigoPostal)
    if (costo === null) return
    setCostoEnvio(costo)
    setZonaConsultada(true)
  }

  // Refresh the zone before step 2 so the summary matches the total that will be stored.
  async function continuar(evento) {
    evento.preventDefault()
    if (modalidad === 'envio') {
      const costo = await costoDeZona(codigoPostal)
      if (costo !== null) {
        setCostoEnvio(costo)
        setZonaConsultada(true)
      }
    }
    setPaso(2)
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
              <form className="formulario" onSubmit={continuar}>
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
                          setCostoEnvio(0)
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
                <button className="boton" type="submit" disabled={!usuario || items.length === 0}>
                  Continuar
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="titulo">Cobro simulado</h1>
              <form className="formulario" onSubmit={confirmarPedido}>
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
                {mensaje && <p role="alert">{mensaje}</p>}
                <button className="boton" type="submit" disabled={!usuario || items.length === 0 || enviando}>
                  {enviando ? 'Confirmando…' : 'Confirmar pedido'}
                </button>
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
