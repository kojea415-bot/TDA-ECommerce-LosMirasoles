import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function mensajeDeAlta(error, data) {
  const correoRepetido = /already registered/i.test(error?.message ?? '')
    || error?.code === 'user_already_exists'
  const altaDeshabilitada = error?.code === 'email_provider_disabled'
    || /signups are disabled/i.test(error?.message ?? '')
  const yaExiste = correoRepetido || (!error && data?.user && (data.user.identities?.length ?? 0) === 0)
  if (!error && !yaExiste) return ''
  if (yaExiste) return 'Ese correo ya está registrado.'
  if (altaDeshabilitada) return 'El alta por correo está deshabilitada en el proyecto.'
  return 'No se pudo crear la cuenta'
}

function Ingreso() {
  const navegar = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correoAlta, setCorreoAlta] = useState('')
  const [contraseniaAlta, setContraseniaAlta] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [errorAlta, setErrorAlta] = useState('')
  const [errorIngreso, setErrorIngreso] = useState('')

  async function entrar(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasenia,
    })
    setErrorIngreso(error ? 'Correo o contraseña incorrectos' : '')
    if (!error) navegar('/')
  }

  async function crearCuenta(e) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email: correoAlta,
      password: contraseniaAlta,
      options: { data: { nombre: nombre.trim() } },
    })
    const mensaje = mensajeDeAlta(error, data)
    setErrorAlta(mensaje)
    if (!mensaje) navegar('/')
  }

  return (
    <main className="pagina">
      <p className="ceja">Cuenta</p>
      <div className="ingreso-paneles">
        <form className="panel" onSubmit={entrar}>
          <h1 className="titulo">Ingresar</h1>
          <label className="etiqueta" htmlFor="correo">Correo</label>
          <input
            className="campo"
            id="correo"
            type="email"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <label className="etiqueta" htmlFor="contrasenia">Contraseña</label>
          <input
            className="campo"
            id="contrasenia"
            type="password"
            placeholder="••••••••"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            required
          />
          {errorIngreso && <p role="alert">{errorIngreso}</p>}
          <button className="boton" type="submit">Entrar</button>
          <p className="nota">¿No tenés cuenta? Usá el panel de al lado.</p>
        </form>

        <form className="panel" onSubmit={crearCuenta}>
          <h1 className="titulo">Crear cuenta</h1>
          <label className="etiqueta" htmlFor="nombre">Nombre</label>
          <input
            className="campo"
            id="nombre"
            type="text"
            placeholder="Nombre y apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <label className="etiqueta" htmlFor="correo-alta">Correo</label>
          <input
            className="campo"
            id="correo-alta"
            type="email"
            placeholder="correo@ejemplo.com"
            value={correoAlta}
            onChange={(e) => setCorreoAlta(e.target.value)}
            required
          />
          <label className="etiqueta" htmlFor="contrasenia-alta">Contraseña</label>
          <input
            className="campo"
            id="contrasenia-alta"
            type="password"
            placeholder="••••••••"
            value={contraseniaAlta}
            onChange={(e) => setContraseniaAlta(e.target.value)}
            required
          />
          {errorAlta && <p role="alert">{errorAlta}</p>}
          <button className="boton" type="submit">Registrarme</button>
          <p className="nota">Un correo ya registrado no crea la cuenta.</p>
        </form>
      </div>
    </main>
  )
}

export default Ingreso
