// src/components/ListUsers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../pages/Modal';

const ListUsers = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para los modals
  const [modalRegistrar, setModalRegistrar] = useState({ isOpen: false });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, usuario: null });
  const [modalEditar, setModalEditar] = useState({ isOpen: false, usuario: null });
  const [formData, setFormData] = useState({
    tipoIdentificacion: "",
    identificacion: "",
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    email: "",
  });
  const [formEditData, setFormEditData] = useState({});

  const API_URL = '/api';

  const tiposIdentificacion = [
    { value: 'cedula', label: 'Cédula' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'tarjeta_identidad', label: 'Tarjeta de Identidad' }
  ];

  // Cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`);
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Abrir modal de registrar
  const abrirModalRegistrar = () => {
    setFormData({
      tipoIdentificacion: "",
      identificacion: "",
      nombre: "",
      apellido: "",
      telefono: "",
      direccion: "",
      email: "",
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

  // Registrar nuevo usuario
  const registrarUsuario = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/users`, formData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess('Usuario registrado exitosamente');
        await cargarUsuarios();
        
        setTimeout(() => {
          cerrarModalRegistrar();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar usuario';
      setError(errorMsg);
      console.error('Error:', err);
    }
  };

  // Abrir modal de eliminar
  const abrirModalEliminar = (usuario) => {
    setModalEliminar({ isOpen: true, usuario });
  };

  const cerrarModalEliminar = () => {
    setModalEliminar({ isOpen: false, usuario: null });
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!modalEliminar.usuario) return;

    try {
      await axios.delete(`${API_URL}/users/${modalEliminar.usuario._id}`);
      setSuccess('Usuario eliminado exitosamente');
      await cargarUsuarios();
      cerrarModalEliminar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar usuario: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Abrir modal de editar
  const abrirModalEditar = (usuario) => {
    setFormEditData({
      tipoIdentificacion: usuario.tipoIdentificacion || '',
      identificacion: usuario.identificacion || '',
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      email: usuario.email || ''
    });
    setModalEditar({ isOpen: true, usuario });
  };

  const cerrarModalEditar = () => {
    setModalEditar({ isOpen: false, usuario: null });
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
    if (!modalEditar.usuario) return;

    try {
      await axios.put(`${API_URL}/users/${modalEditar.usuario._id}`, formEditData);
      
      setSuccess('Usuario actualizado exitosamente');
      await cargarUsuarios();
      cerrarModalEditar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar usuario: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.identificacion?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideTipo = filtroTipo === '' || usuario.tipoIdentificacion === filtroTipo;
    
    return coincideBusqueda && coincideTipo;
  });

  // Obtener label del tipo de identificación
  const getLabelTipoIdentificacion = (tipo) => {
    const tipoObj = tiposIdentificacion.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container listusers-container">
      <div className="listusers-header">
        <h1>Gestión de Usuarios</h1>
        <button onClick={abrirModalRegistrar} className="btn btn-primary">
          Registrar Usuario
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
            placeholder="Buscar por nombre, apellido, email o identificación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filtro-tipo">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            {tiposIdentificacion.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="usuarios-stats">
        <div className="stat-card">
          <span className="stat-number">{usuarios.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {usuarios.filter(u => u.tipoIdentificacion === 'cedula').length}
          </span>
          <span className="stat-label">Cédulas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {usuarios.filter(u => u.tipoIdentificacion === 'pasaporte').length}
          </span>
          <span className="stat-label">Pasaportes</span>
        </div>
      </div>

      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Tipo ID</th>
              <th>Identificación</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario._id} className="usuario-row">
                <td>
                  <div className="usuario-info">
                    <strong>{usuario.nombre || 'N/A'}</strong>
                  </div>
                </td>
                <td>{usuario.apellido || 'N/A'}</td>
                <td>{getLabelTipoIdentificacion(usuario.tipoIdentificacion)}</td>
                <td>{usuario.identificacion || 'N/A'}</td>
                <td>{usuario.telefono || 'N/A'}</td>
                <td>{usuario.email || 'N/A'}</td>
                <td>
                  <div className="acciones">
                    <button 
                      className="btn-editar"
                      onClick={() => abrirModalEditar(usuario)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-eliminar"
                      onClick={() => abrirModalEliminar(usuario)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <div className="no-results">
            <p>No se encontraron usuarios que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {/* Modal de Registrar */}
      <Modal
        isOpen={modalRegistrar.isOpen}
        onClose={cerrarModalRegistrar}
        title="Registrar Usuario"
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

        <form className="devolucion-form" onSubmit={registrarUsuario}>
          <div className="form-group">
            <label htmlFor="tipoIdentificacion">Tipo de identificación *</label>
            <select
              id="tipoIdentificacion"
              name="tipoIdentificacion"
              required
              value={formData.tipoIdentificacion}
              onChange={handleChange}
            >
              <option value="">Seleccione un tipo</option>
              {tiposIdentificacion.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="identificacion">Identificación *</label>
            <input
              type="text"
              id="identificacion"
              name="identificacion"
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
              name="nombre"
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
              name="apellido"
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
              name="telefono"
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
              name="direccion"
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
              name="email"
              placeholder="correo@ejemplo.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModalRegistrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Registrar Usuario
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
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        {modalEliminar.usuario && (
          <div className="usuario-info">
            <strong>{modalEliminar.usuario.nombre} {modalEliminar.usuario.apellido}</strong>
            <br />
            <small>{modalEliminar.usuario.email}</small>
            <br />
            <small>Esta acción no se puede deshacer.</small>
          </div>
        )}
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={modalEditar.isOpen}
        onClose={cerrarModalEditar}
        title="Editar Usuario"
        showConfirmButton={false}
      >
        <form className="edit-form" onSubmit={(e) => { e.preventDefault(); confirmarEditar(); }}>
          <div className="form-group">
            <label htmlFor="edit-tipoIdentificacion">Tipo de identificación *</label>
            <select
              id="edit-tipoIdentificacion"
              name="tipoIdentificacion"
              value={formEditData.tipoIdentificacion || ''}
              onChange={handleEditChange}
              required
            >
              <option value="">Seleccione un tipo</option>
              {tiposIdentificacion.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-identificacion">Identificación *</label>
            <input
              type="text"
              id="edit-identificacion"
              name="identificacion"
              value={formEditData.identificacion || ''}
              onChange={handleEditChange}
              required
            />
          </div>

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
            <label htmlFor="edit-telefono">Teléfono *</label>
            <input
              type="tel"
              id="edit-telefono"
              name="telefono"
              value={formEditData.telefono || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-direccion">Dirección *</label>
            <input
              type="text"
              id="edit-direccion"
              name="direccion"
              value={formEditData.direccion || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-email">Email *</label>
            <input
              type="email"
              id="edit-email"
              name="email"
              value={formEditData.email || ''}
              onChange={handleEditChange}
              required
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

export default ListUsers;