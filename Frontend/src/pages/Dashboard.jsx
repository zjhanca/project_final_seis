// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleSettings = () => {
    navigate("/configuracion");
  };

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1 className="auth-title">Dashboard</h1>
        <p className="auth-subtitle">Panel principal de la aplicación</p>
      </div>
      
      <div className="dashboard-card">
        <h2>Información del usuario</h2>
        <p>Bienvenido, <strong>{user?.username}</strong>!</p>
        <p>Email: {user?.email}</p>
        <p>Te registraste el: {new Date(user?.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="dashboard-card">
        <h2>Opciones</h2>
        <div className="dashboard-buttons">
          <button onClick={handleProfile} className="btn btn-primary">
            Ver Perfil
          </button>
          <button onClick={handleSettings} className="btn btn-primary">
            Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;