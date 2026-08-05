import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../config/api';
import ActasList from '../lists/ActasList';
import ActasNewModal from '../ActasNewModal';
import ActasEditModal from '../ActasEditModal';
import ItemReadModal from '../ItemReadModal';

const ActasView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actasFilter, setActasFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ titulo: '', contenido: '', fecha: '', tipoReunion: 'consejo', acuerdoTexto: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const formatSafeDate = (dateStr, fmt = 'dd MMM yyyy') => {
    if (!dateStr) return 'Sin fecha';
    try {
      let parsed;
      if (typeof dateStr === 'string') {
        parsed = dateStr.includes('T') ? parseISO(dateStr) : new Date(dateStr);
      } else if (dateStr instanceof Date) {
        parsed = dateStr;
      } else {
        parsed = new Date(dateStr);
      }
      if (isNaN(parsed.getTime())) return 'Fecha inválida';
      return format(parsed, fmt, { locale: es });
    } catch (err) {
      return 'Error de fecha';
    }
  };

  const getSafeDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const getActaColor = (tipo) => {
    switch (tipo) {
      case 'consejo': return '#0288D1';
      case 'fraternidad': return '#388E3C';
      case 'formacion': return '#F57C00';
      case 'extraordinaria': return '#D32F2F';
      default: return '#757575';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/actas');
      const resData = response.data;
      setData(resData.actas || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching actas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = Array.isArray(data) ? data : [];
    
    if (actasFilter !== 'todas') {
      filtered = filtered.filter(item => (item.tipoReunion || 'consejo') === actasFilter);
    }

    if (!searchTerm) return filtered;

    const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    const term = normalize(searchTerm).trim();
    
    return filtered.filter(item => {
      if (!item) return false;
      const fallback = normalize(`${item.titulo||''} ${item.contenido||''} ${item.tipoReunion||''}`);
      return fallback.includes(term);
    });
  }, [data, actasFilter, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const parsedAcuerdos = (newItem.acuerdoTexto || '').split('\n').map(line => line.trim()).filter(line => line.length > 0).map(desc => ({ descripcion: desc }));
      const payload = { 
        titulo: newItem.titulo, 
        contenido: newItem.contenido, 
        tipoReunion: newItem.tipoReunion || 'consejo',
        fecha: newItem.fecha ? new Date(newItem.fecha).toISOString() : new Date().toISOString(),
        acuerdos: parsedAcuerdos
      };

      await api.post('/actas', payload);
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', fecha: '', tipoReunion: 'consejo', acuerdoTexto: '' });
      fetchData();
    } catch (error) {
      alert(`Error al crear el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const parsedAcuerdosEdit = (selectedItem.acuerdoTexto || '').split('\n').map(line => line.trim()).filter(line => line.length > 0).map(desc => ({ descripcion: desc }));
      await api.put(`/actas/${selectedItem._id}`, {
        titulo: selectedItem.titulo,
        contenido: selectedItem.contenido,
        tipoReunion: selectedItem.tipoReunion,
        fecha: selectedItem.fecha ? new Date(selectedItem.fecha).toISOString() : new Date().toISOString(),
        acuerdos: parsedAcuerdosEdit
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/actas/${id}`);
        fetchData();
      } catch (err) {
        alert(`Error al intentar eliminar: ${err.message}`);
      }
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
          📝 Actas
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar actas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nueva Acta
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'todas', label: 'Todas', border: 'transparent' }, 
          { id: 'consejo', label: 'Consejo', border: '#0288D1' }, 
          { id: 'fraternidad', label: 'Fraternidad', border: '#388E3C' }, 
          { id: 'formacion', label: 'Formación', border: '#F57C00' }, 
          { id: 'extraordinaria', label: 'Extraordinarias', border: '#D32F2F' }
        ].map(filtro => (
          <button
            key={filtro.id}
            className={`btn ${actasFilter === filtro.id ? 'btn-primary' : ''}`}
            onClick={() => setActasFilter(filtro.id)}
            style={{ 
              background: actasFilter === filtro.id ? filtro.border || 'var(--primary)' : filtro.bg || 'var(--surface)', 
              color: actasFilter === filtro.id ? 'white' : 'var(--text-main)', 
              border: `1px solid ${filtro.border || 'var(--border)'}`, 
              whiteSpace: 'nowrap',
              fontWeight: actasFilter === filtro.id ? 'bold' : 'normal'
            }}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <ActasList 
          filteredData={filteredData} 
          getActaColor={getActaColor} 
          formatSafeDate={formatSafeDate} 
          setReadItem={setReadItem} 
          openEditModal={openEditModal} 
          handleDelete={(id) => handleDelete(id)} 
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nueva Acta</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <ActasNewModal newItem={newItem} setNewItem={setNewItem} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Acta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Acta</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <ActasEditModal 
                selectedItem={selectedItem} 
                setSelectedItem={setSelectedItem} 
                getSafeDateForInput={getSafeDateForInput} 
              />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {readItem && (
        <ItemReadModal readItem={readItem} setReadItem={setReadItem} />
      )}
    </div>
  );
};

export default ActasView;
