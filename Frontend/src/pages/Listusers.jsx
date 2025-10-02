import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Modal from './Modal';

const ListUsers = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para los modals
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, usuario: null });
  const [modalEditar, setModalEditar] = useState({ isOpen: false, usuario: null });
  const [formEditData, setFormEditData] = useState({});

  const tiposIdentificacion = [
    { value: 'cedula', label: 'Cédula' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'tarjeta_identidad', label: 'Tarjeta de Identidad' }
  ];

  // Cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users');
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los usuarios: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de eliminar
  const abrirModalEliminar = (usuario) => {
    setModalEliminar({ isOpen: true, usuario });
  };

  // Cerrar modal de eliminar
  const cerrarModalEliminar = () => {
    setModalEliminar({ isOpen: false, usuario: null });
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!modalEliminar.usuario) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${modalEliminar.usuario._id}`);
      setUsuarios(prevUsuarios => prevUsuarios.filter(usuario => usuario._id !== modalEliminar.usuario._id));
      cerrarModalEliminar();
      alert('Usuario eliminado exitosamente');
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

  // Cerrar modal de editar
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
      const response = await axios.put(`http://localhost:5000/api/users/${modalEditar.usuario._id}`, formEditData);
      
      // Actualizar la lista local
      setUsuarios(prevUsuarios =>
        prevUsuarios.map(usuario =>
          usuario._id === modalEditar.usuario._id ? response.data.user : usuario
        )
      );
      
      cerrarModalEditar();
      alert('Usuario actualizado exitosamente');
    } catch (err) {
      setError('Error al actualizar usuario: ' + (err.response?.data?.message || err.message));
      console.error('Error:', err);
    }
  };

  const handleNuevoUsuario = () => {
    navigate("/user");
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

  useEffect(() => {
    cargarUsuarios();
  }, []);

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
        <h1>Listado de Usuarios</h1>
        <button onClick={handleNuevoUsuario} className="btn btn-primary">
          Registrar Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
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
            <label htmlFor="tipoIdentificacion">Tipo de identificación *</label>
            <select
              id="tipoIdentificacion"
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
            <label htmlFor="identificacion">Identificación *</label>
            <input
              type="text"
              id="identificacion"
              name="identificacion"
              value={formEditData.identificacion || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formEditData.nombre || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formEditData.apellido || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formEditData.telefono || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección *</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formEditData.direccion || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
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