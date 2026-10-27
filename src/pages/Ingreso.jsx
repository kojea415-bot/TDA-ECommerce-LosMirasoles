import { useState } from 'react'

function Ingreso() {
  const [correo, setCorreo] = useState('')
  const [contrasenia, setContrasenia] = useState('')

  return (
    <main className="ingreso">
      <h2>Ingresar o crear cuenta</h2>

      <form className="ingreso-form">
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

        <button type="submit">Entrar</button>
      </form>

      <button type="button">¿No tenés cuenta? Creá una</button>
    </main>
  )
}

export default Ingreso
