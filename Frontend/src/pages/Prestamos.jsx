import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Prestamos = () => {
  const navigate = useNavigate();
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    libro: "",
    usuario: "",
    fechaPrestamo: "",
    fechaDevolucion: "",
    estado: "pendiente",
    observaciones: "",
    renovaciones: 0,
    multa: 0,
    terminosAceptados: false,
  });

  // Cargar libros disponibles y usuarios al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar libros disponibles
        const responseLibros = await axios.get("http://localhost:5000/api/libros");
        const librosDisponibles = responseLibros.data.filter(libro => libro.disponibilidad === 'disponible');
        setLibros(librosDisponibles);

        // Cargar usuarios
        const responseUsuarios = await axios.get("http://localhost:5000/api/users");
        setUsuarios(responseUsuarios.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, []);

  const handleLimpiarFormulario = () => {
    setFormData({
      libro: "",
      usuario: "",
      fechaPrestamo: "",
      fechaDevolucion: "",
      estado: "pendiente",
      observaciones: "",
      renovaciones: 0,
      multa: 0,
      terminosAceptados: false,
    });
  };

  const handleViewListado = () => {
    navigate("/listprestamos");
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que los términos estén aceptados
    if (!formData.terminosAceptados) {
      alert("Debe confirmar que el usuario ha aceptado los términos del préstamo");
      return;
    }

    // Preparar datos para enviar
    const prestamoData = {
      libro: formData.libro,
      usuario: formData.usuario,
      fechaPrestamo: formData.fechaPrestamo,
      fechaDevolucion: formData.fechaDevolucion,
      estado: formData.estado,
      observaciones: formData.observaciones,
      renovaciones: parseInt(formData.renovaciones),
      multa: parseFloat(formData.multa) || 0,
      terminosAceptados: formData.terminosAceptados,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/prestamos",
        prestamoData
      );
      console.log("Préstamo creado:", response.data);
      alert("Préstamo registrado exitosamente");
      
      // Limpiar formulario
      handleLimpiarFormulario();
      
      // Recargar libros disponibles
      const responseLibros = await axios.get("http://localhost:5000/api/libros");
      const librosDisponibles = responseLibros.data.filter(libro => libro.disponibilidad === 'disponible');
      setLibros(librosDisponibles);
      
    } catch (error) {
      console.error("Error al registrar el préstamo:", error);
      alert("Hubo un error al registrar el préstamo: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container prestamos-container">
      <h1>Gestión de Préstamos</h1>
      
      <div className="prestamos-layout">
        {/* Sidebar con botones */}
        <div className="prestamos-sidebar">
          <div className="sidebar-buttons">
            <button className="btn btn-primary">
              Registrar Préstamo
            </button>
            <button 
              onClick={handleViewListado} 
              className="btn btn-secondary"
            >
              Listado de Préstamos
            </button>
          </div>
          
          {/* Imagen decorativa */}
          <div className="sidebar-image">
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80" 
              alt="Biblioteca" 
              className="sidebar-img"
            />
          </div>
        </div>

        {/* Contenido principal - Solo formulario de registro */}
        <div className="prestamos-main-content">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="libro">Libro a prestar *</label>
              <select 
                id="libro" 
                required
                value={formData.libro}
                onChange={handleChange}
              >
                <option value="">Seleccione un libro</option>
                {libros.map(libro => (
                  <option key={libro._id} value={libro._id}>
                    {libro.titulo} - {libro.autor?.nombre} {libro.autor?.apellido}
                  </option>
                ))}
              </select>
              {libros.length === 0 && (
                <small style={{color: 'red'}}>No hay libros disponibles para préstamo</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="usuario">Usuario *</label>
              <select 
                id="usuario" 
                required
                value={formData.usuario}
                onChange={handleChange}
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map(usuario => (
                  <option key={usuario._id} value={usuario._id}>
                    {usuario.nombre} {usuario.apellido} - {usuario.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaPrestamo">Fecha de préstamo *</label>
              <input 
                type="date" 
                id="fechaPrestamo" 
                required 
                value={formData.fechaPrestamo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaDevolucion">Fecha de devolución esperada *</label>
              <input 
                type="date" 
                id="fechaDevolucion" 
                required 
                value={formData.fechaDevolucion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado del préstamo *</label>
              <select 
                id="estado" 
                required 
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_prestamo">En préstamo</option>
                <option value="devuelto">Devuelto</option>
                <option value="retrasado">Retrasado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea 
                id="observaciones" 
                placeholder="Notas adicionales sobre el préstamo" 
                rows="3"
                value={formData.observaciones}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="renovaciones">Número de renovaciones</label>
              <input 
                type="number" 
                id="renovaciones" 
                min="0" 
                max="3" 
                value={formData.renovaciones}
                onChange={handleChange}
              />
              <small>Máximo 3 renovaciones permitidas</small>
            </div>

            <div className="form-group">
              <label htmlFor="multa">Multa aplicada ($)</label>
              <input 
                type="number" 
                id="multa" 
                min="0" 
                step="100" 
                placeholder="0" 
                value={formData.multa}
                onChange={handleChange}
              />
              <small>Ingrese el valor de la multa si aplica</small>
            </div>

            <div className="form-group">
              <label>
                <input 
                  type="checkbox" 
                  id="terminosAceptados" 
                  required 
                  checked={formData.terminosAceptados}
                  onChange={handleChange}
                />
                Confirmo que el usuario ha aceptado los términos del préstamo *
              </label>
            </div>
            <br />
            <div style={{display: 'flex', gap: '10px'}}>
              <button type="submit" className="btn btn-primary">
                Registrar Préstamo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Prestamos;