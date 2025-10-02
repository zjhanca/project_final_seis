// src/components/ListPrestamos.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../pages/Modal';

const ListPrestamos = () => {
  const [prestamos, setPrestamos] = useState([]);
  const [libros, setLibros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para los modals
  const [modalRegistrar, setModalRegistrar] = useState({ isOpen: false });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, prestamo: null });
  const [modalEditar, setModalEditar] = useState({ isOpen: false, prestamo: null });
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
  const [formEditData, setFormEditData] = useState({});

  const API_URL = 'http://localhost:5000/api';

  const estados = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_prestamo', label: 'En préstamo' },
    { value: 'devuelto', label: 'Devuelto' },
    { value: 'retrasado', label: 'Retrasado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prestamosRes, librosRes, usuariosRes] = await Promise.all([
        axios.get(`${API_URL}/prestamos`),
        axios.get(`${API_URL}/libros`),
        axios.get(`${API_URL}/users`)
      ]);
      
      setPrestamos(prestamosRes.data);
      
      // Filtrar solo libros disponibles para el formulario de registro
      const librosDisponibles = librosRes.data.filter(libro => libro.disponibilidad === 'disponible');
      setLibros(librosDisponibles);
      
      setUsuarios(usuariosRes.data);
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Registrar nuevo préstamo
  const registrarPrestamo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.terminosAceptados) {
      setError("Debe confirmar que el usuario ha aceptado los términos del préstamo");
      return;
    }

    try {
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

      const response = await axios.post(`${API_URL}/prestamos`, prestamoData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess('Préstamo registrado exitosamente');
        await cargarDatos();
        
        setTimeout(() => {
          cerrarModalRegistrar();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar préstamo';
      setError(errorMsg);
      console.error('Error:', err);
    }
  };

  // Abrir modal de eliminar
  const abrirModalEliminar = (prestamo) => {
    setModalEliminar({ isOpen: true, prestamo });
  };

  const cerrarModalEliminar = () => {
    setModalEliminar({ isOpen: false, prestamo: null });
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!modalEliminar.prestamo) return;

    try {
      await axios.delete(`${API_URL}/prestamos/${modalEliminar.prestamo._id}`);
      setSuccess('Préstamo eliminado exitosamente');
      await cargarDatos();
      cerrarModalEliminar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar préstamo: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Abrir modal de editar
  const abrirModalEditar = (prestamo) => {
    setFormEditData({
      estado: prestamo.estado || '',
      fechaPrestamo: prestamo.fechaPrestamo ? new Date(prestamo.fechaPrestamo).toISOString().split('T')[0] : '',
      fechaDevolucion: prestamo.fechaDevolucion ? new Date(prestamo.fechaDevolucion).toISOString().split('T')[0] : '',
      observaciones: prestamo.observaciones || '',
      renovaciones: prestamo.renovaciones || 0,
      multa: prestamo.multa || 0
    });
    setModalEditar({ isOpen: true, prestamo });
  };

  const cerrarModalEditar = () => {
    setModalEditar({ isOpen: false, prestamo: null });
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
    if (!modalEditar.prestamo) return;

    try {
      await axios.put(`${API_URL}/prestamos/${modalEditar.prestamo._id}`, formEditData);
      
      setSuccess('Préstamo actualizado exitosamente');
      await cargarDatos();
      cerrarModalEditar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar préstamo: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Filtrar préstamos
  const prestamosFiltrados = prestamos.filter(prestamo => {
    const coincideBusqueda = 
      prestamo.libro?.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (prestamo.usuario?.nombre + ' ' + prestamo.usuario?.apellido)?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prestamo.usuario?.email?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEstado = filtroEstado === '' || prestamo.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  // Obtener label del estado
  const getLabelEstado = (estado) => {
    const estadoObj = estados.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Calcular días de retraso
  const calcularDiasRetraso = (fechaDevolucion, estado) => {
    if (estado === 'devuelto') return 0;
    const hoy = new Date();
    const fechaLimite = new Date(fechaDevolucion);
    const diferencia = Math.floor((hoy - fechaLimite) / (1000 * 60 * 60 * 24));
    return diferencia > 0 ? diferencia : 0;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Cargando préstamos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container listprestamos-container">
      <div className="listprestamos-header">
        <h1>Gestión de Préstamos</h1>
        <button onClick={abrirModalRegistrar} className="btn btn-primary">
          Registrar Préstamo
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
            placeholder="Buscar por libro, usuario o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filtro-estado">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="prestamos-stats">
        <div className="stat-card">
          <span className="stat-number">{prestamos.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {prestamos.filter(p => p.estado === 'en_prestamo').length}
          </span>
          <span className="stat-label">En préstamo</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {prestamos.filter(p => p.estado === 'retrasado').length}
          </span>
          <span className="stat-label">Retrasados</span>
        </div>
      </div>

      <div className="prestamos-table-container">
        <table className="prestamos-table">
          <thead>
            <tr>
              <th>Libro</th>
              <th>Usuario</th>
              <th>Fecha Préstamo</th>
              <th>Fecha Devolución</th>
              <th>Estado</th>
              <th>Días Retraso</th>
              <th>Multa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamosFiltrados.map(prestamo => (
              <tr key={prestamo._id} className="prestamo-row">
                <td>
                  <div className="libro-info">
                    <strong>{prestamo.libro?.titulo || 'N/A'}</strong>
                    <br />
                    <small>{prestamo.libro?.autor?.nombre} {prestamo.libro?.autor?.apellido}</small>
                  </div>
                </td>
                <td>
                  <div className="usuario-info">
                    <strong>{prestamo.usuario?.nombre || 'N/A'} {prestamo.usuario?.apellido}</strong>
                    <br />
                    <small>{prestamo.usuario?.email || ''}</small>
                  </div>
                </td>
                <td>{formatearFecha(prestamo.fechaPrestamo)}</td>
                <td>{formatearFecha(prestamo.fechaDevolucion)}</td>
                <td>
                  <span className={`estado-badge estado-${prestamo.estado}`}>
                    {getLabelEstado(prestamo.estado)}
                  </span>
                </td>
                <td>
                  {calcularDiasRetraso(prestamo.fechaDevolucion, prestamo.estado) > 0 && (
                    <span className="dias-retraso">
                      {calcularDiasRetraso(prestamo.fechaDevolucion, prestamo.estado)} días
                    </span>
                  )}
                </td>
                <td>
                  {prestamo.multa > 0 && (
                    <span className="multa">
                      ${prestamo.multa}
                    </span>
                  )}
                </td>
                <td>
                  <div className="acciones">
                    <button 
                      className="btn-editar"
                      onClick={() => abrirModalEditar(prestamo)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => abrirModalEliminar(prestamo)}
                    >
                      Eliminar
</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {prestamosFiltrados.length === 0 && (
          <div className="no-results">
            <p>No se encontraron préstamos que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {/* Modal de Registrar */}
      <Modal
        isOpen={modalRegistrar.isOpen}
        onClose={cerrarModalRegistrar}
        title="Registrar Préstamo"
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

        <form className="devolucion-form" onSubmit={registrarPrestamo}>
          <div className="form-group">
            <label htmlFor="libro">Libro a prestar *</label>
            <select
              id="libro"
              name="libro"
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
              name="usuario"
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
              name="fechaPrestamo"
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
              name="fechaDevolucion"
              required
              value={formData.fechaDevolucion}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado del préstamo *</label>
            <select
              id="estado"
              name="estado"
              required
              value={formData.estado}
              onChange={handleChange}
            >
              {estados.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
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
              name="renovaciones"
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
              name="multa"
              min="0"
              step="100"
              placeholder="0"
              value={formData.multa}
              onChange={handleChange}
            />
            <small>Ingrese el valor de la multa si aplica</small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="terminosAceptados"
                checked={formData.terminosAceptados}
                onChange={handleChange}
              />
              Confirmo que el usuario ha aceptado los términos del préstamo *
            </label>
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModalRegistrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Préstamo
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
        <p>¿Estás seguro de que deseas eliminar este préstamo?</p>
        {modalEliminar.prestamo && (
          <div className="prestamo-info">
            <strong>Libro:</strong> {modalEliminar.prestamo.libro?.titulo}
            <br />
            <strong>Usuario:</strong> {modalEliminar.prestamo.usuario?.nombre} {modalEliminar.prestamo.usuario?.apellido}
            <br />
            <small>Esta acción no se puede deshacer.</small>
          </div>
        )}
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={modalEditar.isOpen}
        onClose={cerrarModalEditar}
        title="Editar Préstamo"
        showConfirmButton={false}
      >
        <form className="edit-form" onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }}>
          <div className="form-group">
            <label htmlFor="edit-estado">Estado del préstamo *</label>
            <select
              id="edit-estado"
              name="estado"
              value={formEditData.estado || ''}
              onChange={handleEditChange}
              required
            >
              {estados.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-fechaPrestamo">Fecha de préstamo *</label>
            <input
              type="date"
              id="edit-fechaPrestamo"
              name="fechaPrestamo"
              value={formEditData.fechaPrestamo || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-fechaDevolucion">Fecha de devolución esperada *</label>
            <input
              type="date"
              id="edit-fechaDevolucion"
              name="fechaDevolucion"
              value={formEditData.fechaDevolucion || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-observaciones">Observaciones</label>
            <textarea
              id="edit-observaciones"
              name="observaciones"
              value={formEditData.observaciones || ''}
              onChange={handleEditChange}
              placeholder="Notas adicionales sobre el préstamo"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-renovaciones">Número de renovaciones</label>
            <input
              type="number"
              id="edit-renovaciones"
              name="renovaciones"
              value={formEditData.renovaciones || ''}
              onChange={handleEditChange}
              min="0"
              max="3"
            />
            <small>Máximo 3 renovaciones permitidas</small>
          </div>

          <div className="form-group">
            <label htmlFor="edit-multa">Multa aplicada ($)</label>
            <input
              type="number"
              id="edit-multa"
              name="multa"
              value={formEditData.multa || ''}
              onChange={handleEditChange}
              min="0"
              step="100"
              placeholder="0"
            />
            <small>Ingrese el valor de la multa si aplica</small>
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

export default ListPrestamos;