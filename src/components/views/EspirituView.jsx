import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import EspirituList from '../lists/EspirituList';
import EspirituNewModal from '../EspirituNewModal';
import EspirituEditModal from '../EspirituEditModal';

const EspirituView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [espirituTab, setEspirituTab] = useState('oracion');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ titulo: '', contenido: '', tipo: 'oracion', categoria: '' });
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/espiritualidad');
      const resData = response.data;
      setData(resData.espiritualidad || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching espiritualidad:', err);
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
      const fallback = normalize(`${item.titulo||''} ${item.contenido||''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/espiritualidad', {
        titulo: newItem.titulo,
        contenido: newItem.contenido,
        tipo: newItem.tipo || 'oracion',
        categoria: newItem.categoria || ''
      });
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', tipo: 'oracion', categoria: '' });
      fetchData();
    } catch (error) {
      alert(`Error al crear el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/espiritualidad/${selectedItem._id}`, {
        titulo: selectedItem.titulo,
        contenido: selectedItem.contenido,
        tipo: selectedItem.tipo || 'oracion',
        categoria: selectedItem.categoria || ''
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
        await api.delete(`/espiritualidad/${id}`);
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
          🕊️ Espiritualidad Franciscana
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Añadir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <EspirituList 
          filteredData={filteredData} 
          espirituTab={espirituTab}
          setEspirituTab={setEspirituTab}
          openEditModal={openEditModal} 
          handleDelete={(id) => handleDelete(id)} 
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Añadir a Espíritu</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <EspirituNewModal newItem={newItem} setNewItem={setNewItem} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Espíritu</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <EspirituEditModal 
                selectedItem={selectedItem} 
                setSelectedItem={setSelectedItem} 
              />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsEditModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EspirituView;
