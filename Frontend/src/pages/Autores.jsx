import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Autores = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nacionalidad: "",
    generos: [],
    biografia: "",
    fotografia: "",
    obras: "",
    premios: "",
    idioma: "",
    redes: "",
  });

  const handleViewListado = () => {
    navigate("/listautores");
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        generos: checked
          ? [...prevData.generos, value]
          : prevData.generos.filter((genero) => genero !== value),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authorData = {
      ...formData,
      obras: formData.obras.split(",").map((obra) => obra.trim()),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/authors",
        authorData
      );
      console.log("Autor creado:", response.data);
      alert("Autor registrado exitosamente");
      // Limpiar el formulario o redirigir
      setFormData({
        nombre: "",
        apellido: "",
        nacionalidad: "",
        generos: [],
        biografia: "",
        fotografia: "",
        obras: "",
        premios: "",
        idioma: "",
        redes: "",
      });
    } catch (error) {
      console.error("Error al registrar el autor:", error);
      alert("Hubo un error al registrar el autor.");
    }
  };

  return (
    <div className="container autores-container">
      <h1>Gestión de Autores</h1>

      <div className="autores-layout">
        {/* Sidebar con botones */}
        <div className="autores-sidebar">
          <div className="sidebar-buttons">
            <button className="btn btn-success">Registrar Autor</button>
            <button onClick={handleViewListado} className="btn btn-secondary">
              Ver Listado de Autores
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

        {/* Contenido principal - Formulario de registro */}
        <div className="autores-main-content">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
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
                required
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nacionalidad">Nacionalidad *</label>
              <select
                id="nacionalidad"
                required
                value={formData.nacionalidad}
                onChange={handleChange}
              >
                <option value="">Seleccione una nacionalidad</option>
                {/* Aquí puedes agregar más opciones dinámicamente si lo necesitas */}
                <option value="argentina">Argentina</option>
                <option value="colombiana">Colombiana</option>
                <option value="española">Española</option>
                <option value="mexicana">Mexicana</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="generos">Género(s) literario(s) *</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    value="ficcion"
                    onChange={handleChange}
                    checked={formData.generos.includes("ficcion")}
                  />{" "}
                  Ficción
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="no-ficcion"
                    onChange={handleChange}
                    checked={formData.generos.includes("no-ficcion")}
                  />{" "}
                  No-ficción
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="ciencia"
                    onChange={handleChange}
                    checked={formData.generos.includes("ciencia")}
                  />{" "}
                  Ciencia
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="tecnologia"
                    onChange={handleChange}
                    checked={formData.generos.includes("tecnologia")}
                  />{" "}
                  Tecnología
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="fantasia"
                    onChange={handleChange}
                    checked={formData.generos.includes("fantasia")}
                  />{" "}
                  Fantasía
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="biografia">Biografía *</label>
              <textarea
                id="biografia"
                placeholder="Escribe una biografía del autor (mínimo 50 caracteres)"
                minLength="50"
                required
                value={formData.biografia}
                onChange={handleChange}
              />
              <small>{formData.biografia.length}/50 caracteres min.</small>
            </div>

            <div className="form-group">
              <label htmlFor="fotografia">Fotografía (URL) *</label>
              <input
                type="url"
                id="fotografia"
                placeholder="https://..."
                required
                value={formData.fotografia}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="obras">Obras destacadas</label>
              <input
                type="text"
                id="obras"
                placeholder="Lista breve de obras (separadas por coma)"
                value={formData.obras}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="premios">Premios o reconocimientos</label>
              <input
                type="text"
                id="premios"
                placeholder="Ejemplo: Premio Nacional de Literatura 2020"
                value={formData.premios}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="idioma">Idioma principal *</label>
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
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="redes">Redes sociales / Portafolio</label>
              <input
                type="url"
                id="redes"
                placeholder="https://perfil.com"
                value={formData.redes}
                onChange={handleChange}
              />
            </div>
            <br />
            <button type="submit" className="btn btn-success">
              Registrar Autor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Autores;