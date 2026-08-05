import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import HermanosEditModal from '../HermanosEditModal';

const HermanosView = ({ handleApprove }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hermanosFilter, setHermanosFilter] = useState('todos');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hermanos?todos=true');
      const resData = response.data;
      setData(resData.hermanos || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching hermanos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = Array.isArray(data) ? data : [];

    // Filter by tab
    if (hermanosFilter === 'activos') {
      filtered = filtered.filter(h => h.activo === true);
    } else if (hermanosFilter === 'inactivos') {
      filtered = filtered.filter(h => h.activo === false);
    }

    // Filter by search term
    if (!searchTerm) return filtered;

    const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    const term = normalize(searchTerm).trim();
    
    return filtered.filter(item => {
      if (!item) return false;
      const fallback = normalize(`${item.nombreCompleto||''} ${item.nombre||''} ${item.email||''} ${item.username||''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm, hermanosFilter]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/hermanos/${selectedItem._id}`, selectedItem);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el hermano: ${error.response?.data?.message || error.message}`);
    }
  };

  const localHandleApprove = async (id, e) => {
    e.stopPropagation();
    if (handleApprove) {
      // Usar la función de App.jsx que aprueba y envía notificación push
      await handleApprove(id, e);
      fetchData();
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          👥 Hermanos Jufra
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar hermano..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => alert('Los hermanos deben registrarse ellos mismos desde su propia App Móvil.')}>
            ➕ Añadir
          </button>
        </div>
      </div>

      <div className="tabs-container" style={{ marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${hermanosFilter === 'todos' ? 'active' : ''}`}
          onClick={() => setHermanosFilter('todos')}
        >
          Todos los Registros
        </button>
        <button 
          className={`tab-btn ${hermanosFilter === 'activos' ? 'active' : ''}`}
          onClick={() => setHermanosFilter('activos')}
        >
          Hermanos Activos
        </button>
        <button 
          className={`tab-btn ${hermanosFilter === 'inactivos' ? 'active' : ''}`}
          onClick={() => setHermanosFilter('inactivos')}
        >
          Solicitudes Pendientes
        </button>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : filteredData.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredData.map((item, index) => (
            <div 
              key={item._id || index} 
              className="glass-card animate-fade" 
              style={{ padding: '1.5rem', position: 'relative', cursor: 'pointer' }}
              onClick={() => openEditModal(item)}
            >
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
                {item.nombreCompleto || item.nombre || 'Registro sin título'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {item.email || item.username || ''}
              </p>
              
              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.activo ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: item.activo ? '#4CAF50' : '#F44336' }}>
                  {item.activo ? 'Activo (Aprobado)' : 'Pendiente de Aprobación'}
                </span>
                {!item.activo && (
                  <button 
                    onClick={(e) => localHandleApprove(item._id, e)}
                    style={{ display: 'block', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
                    Aprobar Acceso
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card animate-fade" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>🔍</div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No se encontraron registros</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: '400px', margin: '0 auto' }}>
            No hay resultados que coincidan con tu búsqueda o filtro actual.
          </p>
          <button 
            onClick={() => {setHermanosFilter('todos'); setSearchTerm('');}}
            className="btn btn-ghost"
            style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}
          >
            Ver todos los hermanos
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Hermano</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <HermanosEditModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
              <div className="modal-actions" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-logout" style={{ width: 'auto'}} onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HermanosView;
