import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Ingreso() {
  const navegar = useNavigate()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [creandoCuenta, setCreandoCuenta] = useState(false)

  // Al enviar el formulario: crea la cuenta o verifica los datos, según el modo
  async function enviar(e) {
    e.preventDefault()
    const datos = { email: correo, password: contrasenia }

    if (creandoCuenta) {
      const { data, error } = await supabase.auth.signUp({
        ...datos,
        options: { data: { nombre: nombre.trim() } },
      })
      // Supabase hides duplicates: no error, and the user comes back with no identities.
      const correoRepetido = /already registered/i.test(error?.message ?? '')
        || error?.code === 'user_already_exists'
      const altaDeshabilitada = error?.code === 'email_provider_disabled'
        || /signups are disabled/i.test(error?.message ?? '')
      const yaExiste = correoRepetido || (!error && data.user && (data.user.identities?.length ?? 0) === 0)
      if (error || yaExiste) {
        setMensajeError(
          yaExiste
            ? 'Ese correo ya está registrado.'
            : altaDeshabilitada
              ? 'El alta por correo está deshabilitada en el proyecto.'
              : 'No se pudo crear la cuenta'
        )
        return
      }
      navegar('/')
    } else {
      const { error } = await supabase.auth.signInWithPassword(datos)
      setMensajeError(error ? 'Correo o contraseña incorrectos' : '')
      if (!error) navegar('/')
    }
  }

  return (
    <main className="ingreso">
      <h2>Ingresar o crear cuenta</h2>

      <form className="ingreso-form" onSubmit={enviar}>
        {creandoCuenta && (
          <>
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </>
        )}

        <label htmlFor="correo">Correo</label>
        <input
          id="correo"
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label htmlFor="contrasenia">Contraseña</label>
        <input
          id="contrasenia"
          type="password"
          value={contrasenia}
          onChange={(e) => setContrasenia(e.target.value)}
          required
        />

        {mensajeError && <p role="alert">{mensajeError}</p>}

        <button type="submit">{creandoCuenta ? 'Crear cuenta' : 'Entrar'}</button>
      </form>

      <button type="button" onClick={() => setCreandoCuenta(!creandoCuenta)}>
        {creandoCuenta ? '¿Ya tenés cuenta? Entrá' : '¿No tenés cuenta? Creá una'}
      </button>
    </main>
  )
}

export default Ingreso
