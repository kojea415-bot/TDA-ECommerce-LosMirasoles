import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Ingreso() {
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [creandoCuenta, setCreandoCuenta] = useState(false)
  
  // Al enviar el formulario: verifica correo y contraseña en Supabase
  async function entrar(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasenia,
    })
    if (error) {
      setMensajeError('Correo o contraseña incorrectos')
    } else {
      setMensajeError('')
    }
  }

  return (
    <main className="ingreso">
      <h2>Ingresar o crear cuenta</h2>

      <form className="ingreso-form" onSubmit={entrar}>
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
