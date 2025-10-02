// src/components/Navbar.jsx
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span></span> 
          <img src="https://media.discordapp.net/attachments/1197599611397877822/1420857670554091600/logo.png?ex=68df7e12&is=68de2c92&hm=07db7a4860086ec547f302055c0d52c8757e12fd500a7a91c09510a6ffcafbf2&=&format=webp&quality=lossless&width=694&height=694" />
        </Link>
        
        <div className="navbar-nav">
          <ThemeToggle />
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/libros" className="nav-link">Libros</Link>
              <Link to="/listautores" className="nav-link">Autores</Link>
              <Link to="/listdevoluciones" className="nav-link">Devoluciones</Link>
              <Link to="/listprestamos" className="nav-link">Prestamos</Link>
              <Link to="/listusers" className="nav-link">Usuarios</Link>
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link btn-nav">
                Iniciar sesión
              </Link>
              <Link to="/register" className="nav-link btn-nav-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;