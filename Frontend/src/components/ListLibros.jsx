// src/components/ListLibros.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../pages/Modal';

const ListLibros = () => {
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para los modals
  const [modalRegistrar, setModalRegistrar] = useState({ isOpen: false });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, libro: null });
  const [modalEditar, setModalEditar] = useState({ isOpen: false, libro: null });
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
  const [formEditData, setFormEditData] = useState({});

  const API_URL = '/api';

  const disponibilidades = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'prestado', label: 'Prestado' },
    { value: 'reservado', label: 'Reservado' },
    { value: 'mantenimiento', label: 'En mantenimiento' }
  ];

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

  // Cargar libros y autores
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [librosResponse, autoresResponse] = await Promise.all([
        axios.get(`${API_URL}/libros`),
        axios.get(`${API_URL}/authors`)
      ]);
      setLibros(librosResponse.data);
      setAutores(autoresResponse.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir modal de registrar
  const abrirModalRegistrar = () => {
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
    setModalRegistrar({ isOpen: true });
  };

  const cerrarModalRegistrar = () => {
    setModalRegistrar({ isOpen: false });
    setError('');
    setSuccess('');
  };

  // Manejar cambios en el formulario de registro
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Registrar nuevo libro
  const registrarLibro = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const libroData = {
        titulo: formData.titulo,
        autor: formData.autor,
        isbn: formData.isbn,
        editorial: formData.editorial,
        año_publicacion: parseInt(formData.fechaPublicacion.split('-')[0]),
        genero: formData.genero,
        paginas: parseInt(formData.paginas),
        idioma: formData.idioma,
        sinopsis: formData.sinopsis,
        portada: formData.portada,
        disponibilidad: formData.disponibilidad,
      };

      const response = await axios.post(`${API_URL}/libros`, libroData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess('Libro registrado exitosamente');
        await cargarDatos();
        
        setTimeout(() => {
          cerrarModalRegistrar();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar libro';
      setError(errorMsg);
      console.error('Error:', err);
    }
  };

  // Abrir modal de eliminar
  const abrirModalEliminar = (libro) => {
    setModalEliminar({ isOpen: true, libro });
  };

  const cerrarModalEliminar = () => {
    setModalEliminar({ isOpen: false, libro: null });
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!modalEliminar.libro) return;

    try {
      await axios.delete(`${API_URL}/libros/${modalEliminar.libro._id}`);
      setSuccess('Libro eliminado exitosamente');
      await cargarDatos();
      cerrarModalEliminar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar libro: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Abrir modal de editar
  const abrirModalEditar = (libro) => {
    setFormEditData({
      titulo: libro.titulo || '',
      autor: libro.autor?._id || '',
      isbn: libro.isbn || '',
      editorial: libro.editorial || '',
      año_publicacion: libro.año_publicacion || '',
      genero: libro.genero || '',
      paginas: libro.paginas || '',
      idioma: libro.idioma || '',
      sinopsis: libro.sinopsis || '',
      portada: libro.portada || '',
      disponibilidad: libro.disponibilidad || 'disponible'
    });
    setModalEditar({ isOpen: true, libro });
  };

  const cerrarModalEditar = () => {
    setModalEditar({ isOpen: false, libro: null });
    setFormEditData({});
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormEditData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Confirmar edición
  const confirmarEditar = async () => {
    if (!modalEditar.libro) return;

    try {
      await axios.put(`${API_URL}/libros/${modalEditar.libro._id}`, formEditData);
      
      setSuccess('Libro actualizado exitosamente');
      await cargarDatos();
      cerrarModalEditar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar libro: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Filtrar libros
  const librosFiltrados = libros.filter(libro => {
    const coincideBusqueda = 
      libro.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (libro.autor?.nombre + ' ' + libro.autor?.apellido)?.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.isbn?.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.editorial?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideDisponibilidad = filtroDisponibilidad === '' || libro.disponibilidad === filtroDisponibilidad;
    
    return coincideBusqueda && coincideDisponibilidad;
  });

  // Obtener label de disponibilidad
  const getLabelDisponibilidad = (disponibilidad) => {
    const dispObj = disponibilidades.find(d => d.value === disponibilidad);
    return dispObj ? dispObj.label : disponibilidad;
  };

  // Obtener label de género
  const getLabelGenero = (genero) => {
    const generoObj = generos.find(g => g.value === genero);
    return generoObj ? generoObj.label : genero;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Cargando libros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container listlibros-container">
      <div className="listlibros-header">
        <h1>Gestión de Libros</h1>
        <button onClick={abrirModalRegistrar} className="btn btn-primary">
          Registrar Libro
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
            placeholder="Buscar por título, autor, ISBN o editorial..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filtro-disponibilidad">
          <select
            value={filtroDisponibilidad}
            onChange={(e) => setFiltroDisponibilidad(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las disponibilidades</option>
            {disponibilidades.map(disp => (
              <option key={disp.value} value={disp.value}>
                {disp.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="libros-stats">
        <div className="stat-card">
          <span className="stat-number">{libros.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {libros.filter(l => l.disponibilidad === 'disponible').length}
          </span>
          <span className="stat-label">Disponibles</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {libros.filter(l => l.disponibilidad === 'prestado').length}
          </span>
          <span className="stat-label">Prestados</span>
        </div>
      </div>

      <div className="libros-grid">
        {librosFiltrados.map(libro => (
          <div key={libro._id} className="libro-card">
            <div className="card-inner">
              <div className="card-front">
                <div className="libro-image-container">
                  <img 
                    src={libro.portada || '/default-book.jpg'} 
                    alt={libro.titulo}
                    className="libro-image"
                    onError={(e) => {
                      e.target.src = '/default-book.jpg';
                    }}
                  />
                  <div className={`availability-indicator availability-${libro.disponibilidad}`}></div>
                  <div className="image-overlay">
                    <span className="overlay-text">Ver más</span>
                  </div>
                </div>
                <div className="libro-basic-info">
                  <h3 className="libro-title">{libro.titulo}</h3>
                  <p className="libro-author">
                    {libro.autor ? 
                      `${libro.autor.nombre} ${libro.autor.apellido}` : 
                      'Autor no especificado'
                    }
                  </p>
                  <div className="libro-genre">
                    {getLabelGenero(libro.genero)}
                  </div>
                </div>
              </div>

              <div className="card-back">
                <div className="libro-detailed-info">
                  <h3 className="libro-title">{libro.titulo}</h3>
                  <div className="info-section">
                    <span className="info-label">ISBN:</span>
                    <span className="info-value">{libro.isbn || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Editorial:</span>
                    <span className="info-value">{libro.editorial || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Año:</span>
                    <span className="info-value">{libro.año_publicacion || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Páginas:</span>
                    <span className="info-value">{libro.paginas || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Idioma:</span>
                    <span className="info-value">{libro.idioma || 'N/A'}</span>
                  </div>
                  <div className="info-section">
                    <span className="info-label">Estado:</span>
                    <span className={`info-value disponibilidad-badge disponibilidad-${libro.disponibilidad}`}>
                      {getLabelDisponibilidad(libro.disponibilidad)}
                    </span>
                  </div>
                  {libro.sinopsis && (
                    <div className="sinopsis-preview">
                      <span className="info-label">Sinopsis:</span>
                      <p className="sinopsis-text">
                        {libro.sinopsis.length > 120 
                          ? `${libro.sinopsis.substring(0, 120)}...` 
                          : libro.sinopsis}
                      </p>
                    </div>
                  )}
                  <div className="card-actions">
                    <button 
                      className="btn-editar"
                      onClick={() => abrirModalEditar(libro)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => abrirModalEliminar(libro)}
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

      {librosFiltrados.length === 0 && (
        <div className="no-results">
          <p>No se encontraron libros que coincidan con los filtros.</p>
        </div>
      )}

      {/* Modal de Registrar */}
      <Modal
        isOpen={modalRegistrar.isOpen}
        onClose={cerrarModalRegistrar}
        title="Registrar Libro"
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

        <form className="devolucion-form" onSubmit={registrarLibro}>
          <div className="form-group">
            <label htmlFor="titulo">Título del libro *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
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
              name="autor"
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
              name="isbn"
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
              name="editorial"
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
              name="fechaPublicacion"
              required
              value={formData.fechaPublicacion}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="genero">Género literario *</label>
            <select
              id="genero"
              name="genero"
              required
              value={formData.genero}
              onChange={handleChange}
            >
              <option value="">Seleccione un género</option>
              {generos.map(genero => (
                <option key={genero.value} value={genero.value}>
                  {genero.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="paginas">Número de páginas *</label>
            <input
              type="number"
              id="paginas"
              name="paginas"
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
              name="idioma"
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
              name="sinopsis"
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
              name="portada"
              placeholder="https://ejemplo.com/portada.jpg"
              value={formData.portada}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="disponibilidad">Disponibilidad *</label>
            <select
              id="disponibilidad"
              name="disponibilidad"
              required
              value={formData.disponibilidad}
              onChange={handleChange}
            >
              {disponibilidades.map(disp => (
                <option key={disp.value} value={disp.value}>
                  {disp.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModalRegistrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Libro
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
        <p>¿Estás seguro de que deseas eliminar este libro?</p>
        {modalEliminar.libro && (
          <div className="libro-info">
            <strong>{modalEliminar.libro.titulo}</strong>
            <br />
            <small>Esta acción no se puede deshacer.</small>
          </div>
        )}
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={modalEditar.isOpen}
        onClose={cerrarModalEditar}
        title="Editar Libro"
        showConfirmButton={false}
      >
        <form className="edit-form" onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }}>
          <div className="form-group">
            <label htmlFor="edit-titulo">Título del libro *</label>
            <input
              type="text"
              id="edit-titulo"
              name="titulo"
              value={formEditData.titulo || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-autor">Autor *</label>
            <select
              id="edit-autor"
              name="autor"
              value={formEditData.autor || ''}
              onChange={handleEditChange}
              required
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
            <label htmlFor="edit-isbn">ISBN *</label>
            <input
              type="text"
              id="edit-isbn"
              name="isbn"
              value={formEditData.isbn || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-editorial">Editorial *</label>
            <input
              type="text"
              id="edit-editorial"
              name="editorial"
              value={formEditData.editorial || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-año">Año de publicación *</label>
            <input
              type="number"
              id="edit-año"
              name="año_publicacion"
              value={formEditData.año_publicacion || ''}
              onChange={handleEditChange}
              required
              min="1000"
              max="2024"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-genero">Género literario *</label>
            <select
              id="edit-genero"
              name="genero"
              value={formEditData.genero || ''}
              onChange={handleEditChange}
              required
            >
              <option value="">Seleccione un género</option>
              {generos.map(genero => (
                <option key={genero.value} value={genero.value}>
                  {genero.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-paginas">Número de páginas *</label>
            <input
              type="number"
              id="edit-paginas"
              name="paginas"
              value={formEditData.paginas || ''}
              onChange={handleEditChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-idioma">Idioma *</label>
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
              <option value="italiano">Italiano</option>
              <option value="portugues">Portugués</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-sinopsis">Sinopsis *</label>
            <textarea
              id="edit-sinopsis"
              name="sinopsis"
              value={formEditData.sinopsis || ''}
              onChange={handleEditChange}
              required
              placeholder="Breve descripción del libro"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-portada">Portada (URL)</label>
            <input
              type="url"
              id="edit-portada"
              name="portada"
              value={formEditData.portada || ''}
              onChange={handleEditChange}
              placeholder="https://ejemplo.com/portada.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-disponibilidad">Disponibilidad *</label>
            <select
              id="edit-disponibilidad"
              name="disponibilidad"
              value={formEditData.disponibilidad || ''}
              onChange={handleEditChange}
              required
            >
              {disponibilidades.map(disp => (
                <option key={disp.value} value={disp.value}>
                  {disp.label}
                </option>
              ))}
            </select>
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

export default ListLibros;