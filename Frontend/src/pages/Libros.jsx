import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Libros = () => {
  const navigate = useNavigate();
  const [autores, setAutores] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    isbn: "",
    editorial: "",
    fechaPublicacion: "",
    genero: "",
    paginas: "",
    idioma: "",
    sinopsis: "",
    portada: "",
    disponibilidad: "disponible",
  });

  // Cargar autores para el select
  useEffect(() => {
    const cargarAutores = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/authors");
        setAutores(response.data);
      } catch (error) {
        console.error("Error al cargar autores:", error);
      }
    };
    cargarAutores();
  }, []);

  const handleViewListado = () => {
    navigate("/listlibros");
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
    
    // Formatear los datos para el backend
    const libroData = {
      titulo: formData.titulo,
      autor: formData.autor, // ID del autor
      isbn: formData.isbn,
      editorial: formData.editorial,
      año_publicacion: parseInt(formData.fechaPublicacion.split('-')[0]), // Extraer solo el año
      genero: formData.genero,
      paginas: parseInt(formData.paginas),
      idioma: formData.idioma,
      sinopsis: formData.sinopsis,
      portada: formData.portada,
      disponibilidad: formData.disponibilidad,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/libros",
        libroData
      );
      console.log("Libro creado:", response.data);
      alert("Libro registrado exitosamente");
      
      // Limpiar el formulario
      setFormData({
        titulo: "",
        autor: "",
        isbn: "",
        editorial: "",
        fechaPublicacion: "",
        genero: "",
        paginas: "",
        idioma: "",
        sinopsis: "",
        portada: "",
        disponibilidad: "disponible",
      });
    } catch (error) {
      console.error("Error al registrar el libro:", error);
      alert("Hubo un error al registrar el libro: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container libros-container">
      <h1>Gestión de Libros</h1>
      
      <div className="libros-layout">
        {/* Sidebar con botones */}
        <div className="libros-sidebar">
          <div className="sidebar-buttons">
            <button className="btn btn-primary">
              Registrar Libro
            </button>
            <button 
              onClick={handleViewListado} 
              className="btn btn-secondary"
            >
              Ver Listado de Libros
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
        <div className="libros-main-content">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="titulo">Título del libro *</label>
              <input 
                type="text" 
                id="titulo" 
                placeholder="Título completo del libro" 
                required 
                value={formData.titulo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="autor">Autor *</label>
              <select 
                id="autor" 
                required
                value={formData.autor}
                onChange={handleChange}
              >
                <option value="">Seleccione un autor</option>
                {autores.map(autor => (
                  <option key={autor._id} value={autor._id}>
                    {autor.nombre} {autor.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="isbn">ISBN *</label>
              <input 
                type="text" 
                id="isbn" 
                placeholder="ISBN del libro" 
                required 
                value={formData.isbn}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="editorial">Editorial *</label>
              <input 
                type="text" 
                id="editorial" 
                placeholder="Nombre de la editorial" 
                required 
                value={formData.editorial}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fechaPublicacion">Fecha de publicación *</label>
              <input 
                type="date" 
                id="fechaPublicacion" 
                required 
                value={formData.fechaPublicacion}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género literario *</label>
              <select 
                id="genero" 
                required
                value={formData.genero}
                onChange={handleChange}
              >
                <option value="">Seleccione un género</option>
                <option value="ficcion">Ficción</option>
                <option value="no-ficcion">No-ficción</option>
                <option value="ciencia">Ciencia</option>
                <option value="tecnologia">Tecnología</option>
                <option value="fantasia">Fantasía</option>
                <option value="romance">Romance</option>
                <option value="misterio">Misterio</option>
                <option value="biografia">Biografía</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="paginas">Número de páginas *</label>
              <input 
                type="number" 
                id="paginas" 
                min="1" 
                required 
                value={formData.paginas}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="idioma">Idioma *</label>
              <select 
                id="idioma" 
                required
                value={formData.idioma}
                onChange={handleChange}
              >
                <option value="">Seleccione un idioma</option>
                <option value="español">Español</option>
                <option value="ingles">Inglés</option>
                <option value="frances">Francés</option>
                <option value="italiano">Italiano</option>
                <option value="portugues">Portugués</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="sinopsis">Sinopsis *</label>
              <textarea 
                id="sinopsis" 
                placeholder="Breve descripción del libro" 
                required 
                value={formData.sinopsis}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="portada">Portada (URL)</label>
              <input 
                type="url" 
                id="portada" 
                placeholder="https://ejemplo.com/portada.jpg" 
                value={formData.portada}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="disponibilidad">Disponibilidad *</label>
              <select 
                id="disponibilidad" 
                required
                value={formData.disponibilidad}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="prestado">Prestado</option>
                <option value="reservado">Reservado</option>
              </select>
            </div>
            <br />
            <button type="submit" className="btn btn-primary">
              Registrar Libro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Libros;