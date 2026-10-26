import { Link } from 'react-router-dom'

function Header() {
    return(
    
    <header className="header">
      <Link to="/" className="header-marca">Dietética Los Mirasoles</Link>
      <nav className="header-nav">
        <Link to="/ingreso">Cuenta</Link>
        {/* El número es fijo por ahora: pasa a ser el real cuando exista el carrito */}
        <Link to="/carrito">Carrito (0)</Link>
      </nav>
    </header>
    )
   
}

export default Header