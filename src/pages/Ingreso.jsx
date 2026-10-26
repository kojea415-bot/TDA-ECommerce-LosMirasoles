// Pantalla de ingreso: formulario de correo y contraseña (la lógica se agrega después)
function Ingreso() {
  return (
    <main className="ingreso">
      <h2>Ingresar o crear cuenta</h2>

      <form className="ingreso-form">
        <label htmlFor="correo">Correo</label>
        <input id="correo" type="email" required />

        <label htmlFor="contrasenia">Contraseña</label>
        <input id="contrasenia" type="password" required />

        <button type="submit">Entrar</button>
      </form>

      <button type="button">¿No tenés cuenta? Creá una</button>
    </main>
  )
}

export default Ingreso
