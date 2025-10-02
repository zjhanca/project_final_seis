// src/components/ListDevoluciones.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Modal from '../pages/Modal';

const ListDevoluciones = () => {
  const navigate = useNavigate();
  const [devoluciones, setDevoluciones] = useState([]);
  const [prestamosActivos, setPrestamosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalRegistrar, setModalRegistrar] = useState({ isOpen: false });
  const [modalDetalle, setModalDetalle] = useState({ isOpen: false, devolucion: null });
  const [formData, setFormData] = useState({
    prestamoId: '',
    estadoLibro: 'bueno',
    observaciones: '',
    multaPagada: false
  });

  const API_URL = '/api';

  const estadosLibro = [
    { value: 'bueno', label: 'Buen estado' },
    { value: 'danado_leve', label: 'Daño leve' },
    { value: 'danado_grave', label: 'Daño grave' },
    { value: 'perdido', label: 'Perdido' }
  ];

  const cargarDevoluciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/devoluciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDevoluciones(response.data.devoluciones || []);
    } catch (err) {
      console.error('Error al cargar devoluciones:', err);
      setError('Error al cargar devoluciones');
    }
  };

  const cargarPrestamosActivos = async () => {
    try {
      const response = await axios.get(`${API_URL}/prestamos`);
      const activos = response.data.filter(p => 
        p.estado === 'en_prestamo' || p.estado === 'retrasado'
      );
      setPrestamosActivos(activos);
    } catch (err) {
      console.error('Error al cargar préstamos:', err);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    await Promise.all([cargarDevoluciones(), cargarPrestamosActivos()]);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalRegistrar = () => {
    setFormData({
      prestamoId: '',
      estadoLibro: 'bueno',
      observaciones: '',
      multaPagada: false
    });
    setModalRegistrar({ isOpen: true });
  };

  const cerrarModalRegistrar = () => {
    setModalRegistrar({ isOpen: false });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const registrarDevolucion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/devoluciones`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSuccess('Devolución registrada exitosamente. El libro ahora está disponible.');
        await cargarDatos();
        
        setTimeout(() => {
          cerrarModalRegistrar();
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al registrar devolución';
      setError(errorMsg);
      console.error('Error:', err);
    }
  };

  const actualizarMulta = async (devolucionId, pagada) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/devoluciones/${devolucionId}/multa`, 
        { multaPagada: pagada },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('Estado de multa actualizado');
      await cargarDevoluciones();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al actualizar multa');
      setTimeout(() => setError(''), 3000);
    }
  };

  const verDetalle = (devolucion) => {
    setModalDetalle({ isOpen: true, devolucion });
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLabelEstadoLibro = (estado) => {
    const estadoObj = estadosLibro.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  };

  const getPrestamoInfo = () => {
    if (!formData.prestamoId) return null;
    return prestamosActivos.find(p => p._id === formData.prestamoId);
  };

  const prestamoSeleccionado = getPrestamoInfo();

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <p>Cargando devoluciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container listdevoluciones-container">
      <div className="listdevoluciones-header">
        <h1>Gestión de Devoluciones</h1>
        <button onClick={abrirModalRegistrar} className="btn btn-primary">
          Registrar Devolución
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

      <div className="devoluciones-stats">
        <div className="stat-card">
          <span className="stat-number">{devoluciones.length}</span>
          <span className="stat-label">Total Devoluciones</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            ${devoluciones.reduce((total, dev) => total + (dev.multaCalculada || 0), 0).toLocaleString()}
          </span>
          <span className="stat-label">Multas Totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            ${devoluciones.filter(dev => dev.multaPagada).reduce((total, dev) => total + dev.multaCalculada, 0).toLocaleString()}
          </span>
          <span className="stat-label">Multas Pagadas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {devoluciones.filter(dev => dev.diasRetraso > 0).length}
          </span>
          <span className="stat-label">Con Retraso</span>
        </div>
      </div>

      <div className="devoluciones-table-container">
        <table className="devoluciones-table">
          <thead>
            <tr>
              <th>Libro</th>
              <th>Usuario</th>
              <th>Fecha Devolución</th>
              <th>Días Retraso</th>
              <th>Multa</th>
              <th>Estado Libro</th>
              <th>Multa Pagada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devoluciones.map(devolucion => (
              <tr key={devolucion._id} className="devolucion-row">
                <td>
                  <div className="libro-info">
                    <strong>{devolucion.libro?.titulo || 'N/A'}</strong>
                    <br />
                    <small>ISBN: {devolucion.libro?.isbn || 'N/A'}</small>
                  </div>
                </td>
                <td>
                  <div className="usuario-info">
                    <strong>
                      {devolucion.usuario?.nombre || 'N/A'} {devolucion.usuario?.apellido || ''}
                    </strong>
                    <br />
                    <small>{devolucion.usuario?.email || ''}</small>
                  </div>
                </td>
                <td>{formatearFecha(devolucion.fechaDevolucion)}</td>
                <td>
                  {devolucion.diasRetraso > 0 ? (
                    <span className="dias-retraso bad">
                      {devolucion.diasRetraso} días
                    </span>
                  ) : (
                    <span className="dias-retraso good">A tiempo</span>
                  )}
                </td>
                <td>
                  {devolucion.multaCalculada > 0 ? (
                    <span className="multa">
                      ${devolucion.multaCalculada.toLocaleString()}
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td>
                  <span className={`estado-libro estado-${devolucion.estadoLibro}`}>
                    {getLabelEstadoLibro(devolucion.estadoLibro)}
                  </span>
                </td>
                <td>
                  {devolucion.multaCalculada > 0 ? (
                    <button
                      className={`btn-multa ${devolucion.multaPagada ? 'pagada' : 'pendiente'}`}
                      onClick={() => actualizarMulta(devolucion._id, !devolucion.multaPagada)}
                    >
                      {devolucion.multaPagada ? '✓ Pagada' : '✗ Pendiente'}
                    </button>
                  ) : (
                    <span className="multa-na">N/A</span>
                  )}
                </td>
                <td>
                  <button 
                    className="btn-ver-detalle"
                    onClick={() => verDetalle(devolucion)}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {devoluciones.length === 0 && (
          <div className="no-results">
            <p>No se han registrado devoluciones.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalRegistrar.isOpen}
        onClose={cerrarModalRegistrar}
        title="Registrar Devolución"
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

        <form className="devolucion-form" onSubmit={registrarDevolucion}>
          <div className="form-group">
            <label htmlFor="prestamoId">Préstamo a devolver *</label>
            <select
              id="prestamoId"
              name="prestamoId"
              value={formData.prestamoId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un préstamo</option>
              {prestamosActivos.map(prestamo => (
                <option key={prestamo._id} value={prestamo._id}>
                  {prestamo.libro?.titulo} - {prestamo.usuario?.nombre} {prestamo.usuario?.apellido} 
                  (Vence: {formatearFecha(prestamo.fechaDevolucion)})
                </option>
              ))}
            </select>
            {prestamosActivos.length === 0 && (
              <small style={{color: 'orange'}}>No hay préstamos activos para devolver</small>
            )}
          </div>

          {prestamoSeleccionado && (
            <div className="prestamo-info-box">
              <h4>Información del Préstamo</h4>
              <p><strong>Libro:</strong> {prestamoSeleccionado.libro?.titulo}</p>
              <p><strong>Usuario:</strong> {prestamoSeleccionado.usuario?.nombre} {prestamoSeleccionado.usuario?.apellido}</p>
              <p><strong>Fecha Préstamo:</strong> {formatearFecha(prestamoSeleccionado.fechaPrestamo)}</p>
              <p><strong>Fecha Devolución:</strong> {formatearFecha(prestamoSeleccionado.fechaDevolucion)}</p>
              <p><strong>Estado:</strong> <span className={`estado-badge estado-${prestamoSeleccionado.estado}`}>{prestamoSeleccionado.estado}</span></p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="estadoLibro">Estado del libro al devolver *</label>
            <select
              id="estadoLibro"
              name="estadoLibro"
              value={formData.estadoLibro}
              onChange={handleChange}
              required
            >
              {estadosLibro.map(estado => (
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
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Describa el estado del libro, daños, etc."
              rows="3"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="multaPagada"
                checked={formData.multaPagada}
                onChange={handleChange}
              />
              Multa pagada (si aplica)
            </label>
          </div>

          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModalRegistrar}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!formData.prestamoId}
            >
              Registrar Devolución
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalDetalle.isOpen}
        onClose={() => setModalDetalle({ isOpen: false, devolucion: null })}
        title="Detalle de Devolución"
        showConfirmButton={false}
      >
        {modalDetalle.devolucion && (
          <div className="detalle-devolucion">
            <div className="detalle-section">
              <h4>Información del Libro</h4>
              <p><strong>Título:</strong> {modalDetalle.devolucion.libro?.titulo}</p>
              <p><strong>ISBN:</strong> {modalDetalle.devolucion.libro?.isbn}</p>
              <p><strong>Autor:</strong> {modalDetalle.devolucion.libro?.autor?.nombre} {modalDetalle.devolucion.libro?.autor?.apellido}</p>
            </div>

            <div className="detalle-section">
              <h4>Información del Usuario</h4>
              <p><strong>Nombre:</strong> {modalDetalle.devolucion.usuario?.nombre} {modalDetalle.devolucion.usuario?.apellido}</p>
              <p><strong>Email:</strong> {modalDetalle.devolucion.usuario?.email}</p>
              <p><strong>Identificación:</strong> {modalDetalle.devolucion.usuario?.identificacion}</p>
            </div>

            <div className="detalle-section">
              <h4>Fechas</h4>
              <p><strong>Fecha Préstamo:</strong> {formatearFecha(modalDetalle.devolucion.fechaPrestamoOriginal)}</p>
              <p><strong>Fecha Esperada:</strong> {formatearFecha(modalDetalle.devolucion.fechaDevolucionEsperada)}</p>
              <p><strong>Fecha Devolución Real:</strong> {formatearFecha(modalDetalle.devolucion.fechaDevolucion)}</p>
            </div>

            <div className="detalle-section">
              <h4>Información de Retraso y Multa</h4>
              <p><strong>Días de Retraso:</strong> {modalDetalle.devolucion.diasRetraso} días</p>
              <p><strong>Multa Calculada:</strong> ${modalDetalle.devolucion.multaCalculada?.toLocaleString()}</p>
              <p><strong>Estado de Pago:</strong> {modalDetalle.devolucion.multaPagada ? '✓ Pagada' : '✗ Pendiente'}</p>
            </div>

            <div className="detalle-section">
              <h4>Estado del Libro</h4>
              <p><strong>Condición:</strong> <span className={`estado-libro estado-${modalDetalle.devolucion.estadoLibro}`}>
                {getLabelEstadoLibro(modalDetalle.devolucion.estadoLibro)}
              </span></p>
              {modalDetalle.devolucion.observaciones && (
                <p><strong>Observaciones:</strong> {modalDetalle.devolucion.observaciones}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListDevoluciones;