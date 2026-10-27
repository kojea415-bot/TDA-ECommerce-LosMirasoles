import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Ingreso() {
  const navegar = useNavigate()
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [creandoCuenta, setCreandoCuenta] = useState(false)

  // Al enviar el formulario: crea la cuenta o verifica los datos, según el modo
  async function enviar(e) {
    e.preventDefault()
    const datos = { email: correo, password: contrasenia }

    if (creandoCuenta) {
      const { error } = await supabase.auth.signUp(datos)
      setMensajeError(error ? 'No se pudo crear la cuenta' : '')
      if (!error) navegar('/')
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
