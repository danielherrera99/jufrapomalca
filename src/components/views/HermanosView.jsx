import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../../config/api';
import HermanosEditModal from '../HermanosEditModal';
import { resolveEtapa } from './DashboardView';
import { useFraternidad } from '../../context/FraternidadContext';

const etapaBadgeMap = {
  'aspirante': { label: 'Aspirante', bg: '#F1F5F9', color: '#475569' },
  'iniciado': { label: 'Iniciado(a)', bg: '#E0F2FE', color: '#0369A1' },
  'en_formacion': { label: 'En Formación', bg: '#FEF3C7', color: '#B45309' },
  'promesado': { label: 'Promesado(a)', bg: '#DCFCE7', color: '#15803D' }
};

const HermanosView = ({ handleApprove, user }) => {
  const esConsejo = ['admin', 'superadmin', 'admin_nacional', 'consejo'].includes(user?.rol);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hermanosFilter, setHermanosFilter] = useState('todos');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { selectedFraternidadId, fraternidades } = useFraternidad();

  // Diccionario rápido de fraternidades por ID
  const fratMap = useMemo(() => {
    const map = {};
    (fraternidades || []).forEach(f => {
      map[f.id] = f.nombre;
    });
    map['00000000-6a0f-b53a-d327-e42a6db2faf7'] = 'JUFRA Pomalca';
    return map;
  }, [fraternidades]);

  const fetchData = useCallback(async () => {
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
  }, [selectedFraternidadId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleFratChange = () => {
      fetchData();
    };
    window.addEventListener('fraternidad_changed', handleFratChange);
    return () => window.removeEventListener('fraternidad_changed', handleFratChange);
  }, [fetchData]);

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
      const fratName = fratMap[item.fraternidadId || item.fraternidad_id] || '';
      const fallback = normalize(`${item.nombreCompleto||''} ${item.nombre||''} ${item.apellido||''} ${item.email||''} ${item.username||''} ${item.cargo||''} ${fratName}`);
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
          {esConsejo && (
            <button className="btn btn-primary" onClick={() => alert('Los hermanos deben registrarse ellos mismos desde su propia App Móvil.')}>
              ➕ Añadir
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${hermanosFilter === 'todos' ? 'btn-primary' : ''}`}
          onClick={() => setHermanosFilter('todos')}
          style={{ background: hermanosFilter !== 'todos' ? 'var(--surface)' : '', color: hermanosFilter !== 'todos' ? 'var(--text-main)' : '', border: '1px solid var(--border)', flex: 1 }}
        >
          {esConsejo ? 'Todos los Registros' : 'Directorio Fraterno'}
        </button>
        <button 
          className={`btn ${hermanosFilter === 'activos' ? 'btn-primary' : ''}`}
          onClick={() => setHermanosFilter('activos')}
          style={{ background: hermanosFilter !== 'activos' ? 'var(--surface)' : '', color: hermanosFilter !== 'activos' ? 'var(--text-main)' : '', border: '1px solid var(--border)', flex: 1 }}
        >
          Hermanos Activos
        </button>
        {esConsejo && (
          <button 
            className={`btn ${hermanosFilter === 'inactivos' ? 'btn-primary' : ''}`}
            onClick={() => setHermanosFilter('inactivos')}
            style={{ background: hermanosFilter !== 'inactivos' ? 'var(--surface)' : '', color: hermanosFilter !== 'inactivos' ? 'var(--text-main)' : '', border: '1px solid var(--border)', flex: 1, position: 'relative' }}
          >
            Solicitudes Pendientes
            {Array.isArray(data) && data.filter(h => !h.activo).length > 0 && (
              <span style={{ marginLeft: '8px', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {data.filter(h => !h.activo).length}
              </span>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : filteredData.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredData.map((item, index) => (
            <div 
              key={item._id || index} 
              className="glass-card animate-fade" 
              style={{ padding: '1.5rem', position: 'relative', cursor: esConsejo ? 'pointer' : 'default' }}
              onClick={() => esConsejo && openEditModal(item)}
            >
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>
                {item.nombreCompleto || item.nombre || 'Registro sin título'}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {item.email || item.username || ''}
              </p>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  background: (etapaBadgeMap[resolveEtapa(item)] || etapaBadgeMap.aspirante).bg, 
                  color: (etapaBadgeMap[resolveEtapa(item)] || etapaBadgeMap.aspirante).color, 
                  fontWeight: '700' 
                }}>
                  {(etapaBadgeMap[resolveEtapa(item)] || etapaBadgeMap.aspirante).label}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: item.activo ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', color: item.activo ? '#4CAF50' : '#F44336', fontWeight: '600' }}>
                  {item.activo ? 'Activo' : 'Pendiente'}
                </span>
                {item.cargo && item.cargo !== 'ninguno' && (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(139, 90, 43, 0.1)', color: 'var(--primary)', fontWeight: '600' }}>
                    🛡️ {item.cargo}
                  </span>
                )}
                {/* Badge de Fraternidad Local */}
                <span style={{ 
                  fontSize: '0.73rem', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  background: '#f8fafc', 
                  color: '#334155', 
                  border: '1px solid #cbd5e1',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>🏛️</span>
                  <span>{fratMap[item.fraternidadId || item.fraternidad_id] || 'JUFRA Pomalca'}</span>
                </span>
                {!item.activo && esConsejo && (
                  <button 
                    onClick={(e) => localHandleApprove(item._id, e)}
                    style={{ display: 'block', marginTop: '6px', background: '#4CAF50', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '0.85rem' }}>
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
