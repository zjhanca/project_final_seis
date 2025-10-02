import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const User = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoIdentificacion: "",
    identificacion: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    email: "",
  });

  const handleViewListado = () => {
    navigate("/listusers");
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users",
        formData
      );
      console.log("Usuario creado:", response.data);
      alert("Usuario registrado exitosamente");
      
      // Limpiar el formulario
      setFormData({
        tipoIdentificacion: "",
        identificacion: "",
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        email: "",
      });
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      alert("Hubo un error al registrar el usuario: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container libros-container">
      <h1>Gestión de Usuarios</h1>
      
      <div className="libros-layout">
        {/* Sidebar con botones */}
        <div className="libros-sidebar">
          <div className="sidebar-buttons">
            <button className="btn btn-primary">
              Registrar Usuario
            </button>
            <button 
              onClick={handleViewListado} 
              className="btn btn-secondary"
            >
              Ver Listado de Usuarios
            </button>
          </div>
          
          {/* Imagen decorativa */}
          <div className="sidebar-image">
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
              alt="Gestión de Usuarios" 
              className="sidebar-img"
            />
          </div>
        </div>

        {/* Contenido principal - Solo formulario de registro */}
        <div className="libros-main-content">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tipoIdentificacion">Tipo de identificación *</label>
              <select 
                id="tipoIdentificacion" 
                required
                value={formData.tipoIdentificacion}
                onChange={handleChange}
              >
                <option value="">Seleccione un tipo</option>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="tarjeta_identidad">Tarjeta de Identidad</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="identificacion">Identificación *</label>
              <input 
                type="text" 
                id="identificacion" 
                placeholder="Número de identificación" 
                required 
                value={formData.identificacion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input 
                type="text" 
                id="nombre" 
                placeholder="Nombres completos" 
                required 
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido *</label>
              <input 
                type="text" 
                id="apellido" 
                placeholder="Apellidos completos" 
                required 
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input 
                type="tel" 
                id="telefono" 
                placeholder="Número de teléfono" 
                required 
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input 
                type="text" 
                id="direccion" 
                placeholder="Dirección completa" 
                required 
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                placeholder="correo@ejemplo.com" 
                required 
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <br />
            <button type="submit" className="btn btn-primary">
              Registrar Usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default User;