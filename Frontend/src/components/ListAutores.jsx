// src/components/ListAutores.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../pages/Modal';

const ListAutores = () => {
  const [autores, setAutores] = useState([]);
  const [filtroGenero, setFiltroGenero] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para los modals
  const [modalRegistrar, setModalRegistrar] = useState({ isOpen: false });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, autor: null });
  const [modalEditar, setModalEditar] = useState({ isOpen: false, autor: null });
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
  const [formEditData, setFormEditData] = useState({});

  const API_URL = '/api';

  // Géneros literarios
  const generos = [
    { value: 'ficcion', label: 'Ficción' },
    { value: 'no-ficcion', label: 'No-ficción' },
    { value: 'ciencia', label: 'Ciencia' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'fantasia', label: 'Fantasía' },
    { value: 'romance', label: 'Romance' },
    { value: 'misterio', label: 'Misterio' },
    { value: 'biografia', label: 'Biografía' },
    { value: 'historia', label: 'Historia' },
    { value: 'poesia', label: 'Poesía' }
  ];

  // Cargar autores desde el backend
  const cargarAutores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/authors`);
      setAutores(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los autores: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAutores();
  }, []);

  // Abrir modal de registrar
  const abrirModalRegistrar = () => {
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
    setModalRegistrar({ isOpen: true });
  };

  const cerrarModalRegistrar = () => {
    setModalRegistrar({ isOpen: false });
    setError('');
    setSuccess('');
  };

  // Manejar cambios en el formulario de registro
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        [name]: value,
      }));
    }
  };

  // Registrar nuevo autor
  const registrarAutor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const authorData = {
        ...formData,
        obras: formData.obras.split(",").map((obra) => obra.trim()).filter(obra => obra),
      };

      const response = await axios.post(`${API_URL}/authors`, authorData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess('Autor registrado exitosamente');
        await cargarAutores();
        
        setTimeout(() => {
          cerrarModalRegistrar();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar autor';
      setError(errorMsg);
      console.error('Error:', err);
    }
  };

  // Abrir modal de eliminar
  const abrirModalEliminar = (autor) => {
    setModalEliminar({ isOpen: true, autor });
  };

  const cerrarModalEliminar = () => {
    setModalEliminar({ isOpen: false, autor: null });
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!modalEliminar.autor) return;

    try {
      await axios.delete(`${API_URL}/authors/${modalEliminar.autor._id}`);
      setSuccess('Autor eliminado exitosamente');
      await cargarAutores();
      cerrarModalEliminar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar autor: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Abrir modal de editar
  const abrirModalEditar = (autor) => {
    setFormEditData({
      nombre: autor.nombre || '',
      apellido: autor.apellido || '',
      nacionalidad: autor.nacionalidad || '',
      generos: autor.generos || [],
      biografia: autor.biografia || '',
      fotografia: autor.fotografia || '',
      obras: autor.obras ? autor.obras.join(', ') : '',
      premios: autor.premios || '',
      idioma: autor.idioma || '',
      redes: autor.redes || ''
    });
    setModalEditar({ isOpen: true, autor });
  };

  const cerrarModalEditar = () => {
    setModalEditar({ isOpen: false, autor: null });
    setFormEditData({});
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      setFormEditData(prevData => ({
        ...prevData,
        generos: checked
          ? [...prevData.generos, value]
          : prevData.generos.filter(genero => genero !== value)
      }));
    } else {
      setFormEditData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Confirmar edición
  const confirmarEditar = async () => {
    if (!modalEditar.autor) return;

    try {
      const dataToSend = {
        ...formEditData,
        obras: formEditData.obras ? formEditData.obras.split(',').map(obra => obra.trim()).filter(obra => obra) : []
      };

      await axios.put(`${API_URL}/authors/${modalEditar.autor._id}`, dataToSend);
      
      setSuccess('Autor actualizado exitosamente');
      await cargarAutores();
      cerrarModalEditar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar autor: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Filtrar autores
  const autoresFiltrados = autores.filter(autor => {
    const coincideBusqueda = 
      autor.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      autor.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      autor.nacionalidad?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideGenero = filtroGenero === '' || 
      (autor.generos && autor.generos.includes(filtroGenero));
    
    return coincideBusqueda && coincideGenero;
  });

  // Formatear lista de géneros
  const formatearGeneros = (generosLista) => {
    if (!generosLista || generosLista.length === 0) return 'N/A';
    
    return generosLista.map(genero => {
      const generoObj = generos.find(g => g.value === genero);
      return generoObj ? generoObj.label : genero;
    }).join(', ');
  };

  // Contar autores con obras publicadas
  const contarAutoresConObras = () => {
    return autores.filter(autor => autor.obras && autor.obras.length > 0).length;
  };

  // Contar autores premiados
  const contarAutoresPremiados = () => {
    return autores.filter(autor => autor.premios && autor.premios.trim().length > 0).length;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Cargando autores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container listautores-container">
      <div className="listautores-header">
        <h1>Gestión de Autores</h1>
        <button onClick={abrirModalRegistrar} className="btn btn-success">
          Registrar Autor
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      <div className="filtros">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o nacionalidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filtro-genero">
          <select
            value={filtroGenero}
            onChange={(e) => setFiltroGenero(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los géneros</option>
            {generos.map(genero => (
              <option key={genero.value} value={genero.value}>
                {genero.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="autores-stats">
        <div className="stat-card">
          <span className="stat-number">{autores.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{contarAutoresConObras()}</span>
          <span className="stat-label">Con obras publicadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{contarAutoresPremiados()}</span>
          <span className="stat-label">Premiados</span>
        </div>
      </div>

      <div className="autores-grid">
        {autoresFiltrados.map(autor => (
          <div key={autor._id} className="autor-card">
            <div className="card-inner">
              {/* Frente de la tarjeta */}
              <div className="card-front">
                <div className="autor-image-container">
                  <img 
                    src={autor.fotografia || '/default-author.jpg'} 
                    alt={`${autor.nombre} ${autor.apellido}`}
                    className="autor-image"
                    onError={(e) => {
                      e.target.src = '/default-author.jpg';
                    }}
                  />
                  <div className="image-overlay">
                    <span className="overlay-text">Ver más</span>
                  </div>
                </div>
                <div className="autor-basic-info">
                  <h3 className="autor-name">{autor.nombre} {autor.apellido}</h3>
                  <p className="autor-nationality">{autor.nacionalidad}</p>
                  <div className="autor-genres">
                    {formatearGeneros(autor.generos)}
                  </div>
                </div>
              </div>

              {/* Reverso de la tarjeta */}
              <div className="card-back">
                <div className="autor-detailed-info">
                  <h3 className="autor-name">{autor.nombre} {autor.apellido}</h3>
                  <div className="info-section">
                    <span className="info-label">Nacionalidad:</span>
                    <span className="info-value">{autor.nacionalidad || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Idioma:</span>
                    <span className="info-value">{autor.idioma || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Obras:</span>
                    <span className="info-value">{autor.obras ? autor.obras.length : 0}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Premios:</span>
                    <span className="info-value">{autor.premios ? '✓' : 'N/A'}</span>
                  </div>
                  {autor.biografia && (
                    <div className="biografia-preview">
                      <span className="info-label">Biografía:</span>
                      <p className="biografia-text">
                        {autor.biografia.length > 100 
                          ? `${autor.biografia.substring(0, 100)}...` 
                          : autor.biografia}
                      </p>
                    </div>
                  )}
                  <div className="card-actions">
                    <button 
                      className="btn-editar"
                      onClick={() => abrirModalEditar(autor)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => abrirModalEliminar(autor)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {autoresFiltrados.length === 0 && (
        <div className="no-results">
          <p>No se encontraron autores que coincidan con los filtros.</p>
        </div>
      )}

      {/* Modal de Registrar */}
      <Modal
        isOpen={modalRegistrar.isOpen}
        onClose={cerrarModalRegistrar}
        title="Registrar Autor"
        showConfirmButton={false}
      >
        {error && (
          <div className="alert alert-error mb-3">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success mb-3">
            {success}
          </div>
        )}

        <form className="devolucion-form" onSubmit={registrarAutor}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
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
              name="apellido"
              required
              value={formData.apellido}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nacionalidad">Nacionalidad *</label>
            <select
              id="nacionalidad"
              name="nacionalidad"
              required
              value={formData.nacionalidad}
              onChange={handleChange}
            >
              <option value="">Seleccione una nacionalidad</option>
              <option value="argentina">Argentina</option>
              <option value="colombiana">Colombiana</option>
              <option value="española">Española</option>
              <option value="mexicana">Mexicana</option>
            </select>
          </div>

          <div className="form-group">
            <label>Género(s) literario(s) *</label>
            <div className="checkbox-group">
              {generos.map(genero => (
                <label key={genero.value}>
                  <input
                    type="checkbox"
                    name="generos"
                    value={genero.value}
                    onChange={handleChange}
                    checked={formData.generos.includes(genero.value)}
                  />
                  {genero.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="biografia">Biografía *</label>
            <textarea
              id="biografia"
              name="biografia"
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
              name="fotografia"
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
              name="obras"
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
              name="premios"
              placeholder="Ejemplo: Premio Nacional de Literatura 2020"
              value={formData.premios}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="idioma">Idioma principal *</label>
            <select
              id="idioma"
              name="idioma"
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
              name="redes"
              placeholder="https://perfil.com"
              value={formData.redes}
              onChange={handleChange}
            />
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModalRegistrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-success">
              Registrar Autor
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Eliminar */}
      <Modal
        isOpen={modalEliminar.isOpen}
        onClose={cerrarModalEliminar}
        title="Confirmar Eliminación"
        confirmText="Eliminar"
        confirmButtonClass="btn-danger"
        onConfirm={confirmarEliminar}
      >
        <p>¿Estás seguro de que deseas eliminar este autor?</p>
        {modalEliminar.autor && (
          <div className="author-info">
            <strong>{modalEliminar.autor.nombre} {modalEliminar.autor.apellido}</strong>
            <br />
            <small>Esta acción no se puede deshacer.</small>
          </div>
        )}
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={modalEditar.isOpen}
        onClose={cerrarModalEditar}
        title="Editar Autor"
        showConfirmButton={false}
      >
        <form className="edit-form" onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }}>
          <div className="form-group">
            <label htmlFor="edit-nombre">Nombre *</label>
            <input
              type="text"
              id="edit-nombre"
              name="nombre"
              value={formEditData.nombre || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-apellido">Apellido *</label>
            <input
              type="text"
              id="edit-apellido"
              name="apellido"
              value={formEditData.apellido || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-nacionalidad">Nacionalidad *</label>
            <select
              id="edit-nacionalidad"
              name="nacionalidad"
              value={formEditData.nacionalidad || ''}
              onChange={handleEditChange}
              required
            >
              <option value="">Seleccione una nacionalidad</option>
              <option value="argentina">Argentina</option>
              <option value="colombiana">Colombiana</option>
              <option value="española">Española</option>
              <option value="mexicana">Mexicana</option>
            </select>
          </div>

          <div className="form-group">
            <label>Género(s) literario(s) *</label>
            <div className="checkbox-group">
              {generos.map(genero => (
                <label key={genero.value}>
                  <input
                    type="checkbox"
                    name="generos"
                    value={genero.value}
                    checked={formEditData.generos?.includes(genero.value) || false}
                    onChange={handleEditChange}
                  />
                  {genero.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-biografia">Biografía *</label>
            <textarea
              id="edit-biografia"
              name="biografia"
              value={formEditData.biografia || ''}
              onChange={handleEditChange}
              required
              minLength="50"
              placeholder="Escribe una biografía del autor (mínimo 50 caracteres)"
            />
            <small>{(formEditData.biografia || '').length}/50 caracteres min.</small>
          </div>

          <div className="form-group">
            <label htmlFor="edit-fotografia">Fotografía (URL) *</label>
            <input
              type="url"
              id="edit-fotografia"
              name="fotografia"
              value={formEditData.fotografia || ''}
              onChange={handleEditChange}
              required
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-obras">Obras destacadas</label>
            <input
              type="text"
              id="edit-obras"
              name="obras"
              value={formEditData.obras || ''}
              onChange={handleEditChange}
              placeholder="Lista breve de obras (separadas por coma)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-premios">Premios o reconocimientos</label>
            <input
              type="text"
              id="edit-premios"
              name="premios"
              value={formEditData.premios || ''}
              onChange={handleEditChange}
              placeholder="Ejemplo: Premio Nacional de Literatura 2020"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-idioma">Idioma principal *</label>
            <select
              id="edit-idioma"
              name="idioma"
              value={formEditData.idioma || ''}
              onChange={handleEditChange}
              required
            >
              <option value="">Seleccione un idioma</option>
              <option value="español">Español</option>
              <option value="ingles">Inglés</option>
              <option value="frances">Francés</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-redes">Redes sociales / Portafolio</label>
            <input
              type="url"
              id="edit-redes"
              name="redes"
              value={formEditData.redes || ''}
              onChange={handleEditChange}
              placeholder="https://perfil.com"
            />
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModalEditar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ListAutores;