import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';

const FinanzasView = ({ formatSafeDate, ActivityIndicator }) => {
  const [data, setData] = useState([]);
  const [resumen, setResumen] = useState({ ingresosTotales: 0, egresosTotales: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ tipo: 'ingreso', monto: '', fecha: '', descripcion: '', categoria: 'otros', comprobante_url: '' });
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finanzas');
      const resData = response.data;
      setData(resData.data || []);
      setResumen(resData.resumen || { ingresosTotales: 0, egresosTotales: 0, saldo: 0 });
    } catch (err) {
      console.error('Error fetching finanzas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = Array.isArray(data) ? data : [];
    
    if (!searchTerm) return filtered;

    const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    const term = normalize(searchTerm).trim();
    
    return filtered.filter(item => {
      if (!item) return false;
      const fallback = normalize(`${item.descripcion||''} ${item.categoria||''} ${item.tipo||''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finanzas', newItem);
      setIsModalOpen(false);
      setNewItem({ tipo: 'ingreso', monto: '', fecha: '', descripcion: '', categoria: 'otros', comprobante_url: '' });
      fetchData();
    } catch (error) {
      alert(`Error al registrar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/finanzas/${selectedItem._id}`, selectedItem);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro financiero? Esta acción alterará el saldo.')) {
      try {
        await api.delete(`/finanzas/${id}`);
        fetchData();
      } catch (err) {
        alert(`Error al intentar eliminar: ${err.message}`);
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem({ ...item, fecha: item.fecha ? new Date(item.fecha).toISOString().split('T')[0] : '' });
    setIsEditModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/finanzas/exportar/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Finanzas_JUFRA.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert('Error al exportar a Excel: ' + error.message);
    }
  };

  return (
    <div className="view-container animate-fade">
      {/* Tarjetas de Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #4CAF50' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ingresos Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>S/ {resumen.ingresosTotales.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #F44336' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Egresos Totales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F44336' }}>S/ {resumen.egresosTotales.toFixed(2)}</p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #2196F3' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Saldo Actual</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>S/ {resumen.saldo.toFixed(2)}</p>
        </div>
      </div>

      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Buscar transacción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-with-icon"
              style={{ width: '100%', paddingLeft: '35px' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={handleExport} style={{ border: '1px solid #4CAF50', color: '#4CAF50' }}>
            📊 Exportar Excel
          </button>
          <button className="btn btn-primary" onClick={() => {
              setNewItem({ tipo: 'ingreso', monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: '', categoria: 'otros', comprobante_url: '' });
              setIsModalOpen(true);
          }}>
            + Nuevo Registro
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <ActivityIndicator />
          <p>Cargando finanzas...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💰</span>
          <h3>No hay registros financieros</h3>
          <p>Los ingresos y egresos aparecerán aquí.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Registrado Por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item._id}>
                  <td>{formatSafeDate(item.fecha)}</td>
                  <td>
                    <span className={`badge badge-${item.tipo === 'ingreso' ? 'success' : 'danger'}`}>
                      {item.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td>{item.descripcion}</td>
                  <td>{item.categoria}</td>
                  <td style={{ fontWeight: 'bold', color: item.tipo === 'ingreso' ? '#4CAF50' : '#F44336' }}>
                    S/ {parseFloat(item.monto).toFixed(2)}
                  </td>
                  <td>{item.registradoPor ? item.registradoPor.nombreCompleto : 'Desconocido'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => openEditModal(item)} title="Editar">✏️</button>
                      <button className="btn-icon delete" onClick={() => handleDelete(item._id)} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsModalOpen(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Registrar Transacción</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>Tipo de Transacción</label>
                <select value={newItem.tipo} onChange={(e) => setNewItem({...newItem, tipo: e.target.value})} required>
                  <option value="ingreso">Ingreso (+)</option>
                  <option value="egreso">Egreso (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monto (S/)</label>
                <input type="number" step="0.01" min="0" value={newItem.monto} onChange={(e) => setNewItem({...newItem, monto: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" value={newItem.fecha} onChange={(e) => setNewItem({...newItem, fecha: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input type="text" value={newItem.descripcion} onChange={(e) => setNewItem({...newItem, descripcion: e.target.value})} required placeholder="Ej: Aporte mensual, compra de flores..." />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select value={newItem.categoria} onChange={(e) => setNewItem({...newItem, categoria: e.target.value})} required>
                  <option value="diezmo">Diezmo / Aporte</option>
                  <option value="donacion">Donación</option>
                  <option value="actividad">Actividad Pro-fondos</option>
                  <option value="compras">Compras</option>
                  <option value="servicios">Servicios (Luz, Agua, etc)</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setIsEditModalOpen(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Editar Transacción</h2>
              <button className="btn-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label>Tipo de Transacción</label>
                <select value={selectedItem.tipo} onChange={(e) => setSelectedItem({...selectedItem, tipo: e.target.value})} required>
                  <option value="ingreso">Ingreso (+)</option>
                  <option value="egreso">Egreso (-)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monto (S/)</label>
                <input type="number" step="0.01" min="0" value={selectedItem.monto} onChange={(e) => setSelectedItem({...selectedItem, monto: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" value={selectedItem.fecha} onChange={(e) => setSelectedItem({...selectedItem, fecha: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input type="text" value={selectedItem.descripcion} onChange={(e) => setSelectedItem({...selectedItem, descripcion: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select value={selectedItem.categoria} onChange={(e) => setSelectedItem({...selectedItem, categoria: e.target.value})} required>
                  <option value="diezmo">Diezmo / Aporte</option>
                  <option value="donacion">Donación</option>
                  <option value="actividad">Actividad Pro-fondos</option>
                  <option value="compras">Compras</option>
                  <option value="servicios">Servicios (Luz, Agua, etc)</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanzasView;
