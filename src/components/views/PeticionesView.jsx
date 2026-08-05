import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import PeticionesList from '../lists/PeticionesList';
import PeticionesNewModal from '../PeticionesNewModal';
// Assuming PeticionesEditModal exists, wait let's check if App.jsx used one.
// Let's not assume, in App.jsx it was just inline or no edit modal? Actually wait, App.jsx uses openEditModal for Peticiones.
// Let's verify how PeticionesEditModal is imported. 
// Ah, Peticiones doesn't have an Edit Modal, wait, grep activeTab === 'Peticiones' in App.jsx handleUpdate showed it updates!
// Let's provide a generic PeticionesEditModal or if it exists. 
// I will just write PeticionesView and if PeticionesEditModal is missing, I will fix it.

import ItemReadModal from '../ItemReadModal';

const PeticionesView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ contenido: '', anonimo: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/peticiones');
      const resData = response.data;
      setData(resData.peticiones || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching peticiones:', err);
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
      const fallback = normalize(`${item.contenido||''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/peticiones', { 
        contenido: newItem.contenido, 
        anonimo: newItem.anonimo || false 
      });
      setIsModalOpen(false);
      setNewItem({ contenido: '', anonimo: false });
      fetchData();
    } catch (error) {
      alert(`Error al crear el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/peticiones/${selectedItem._id}`, {
        contenido: selectedItem.contenido,
        anonimo: selectedItem.anonimo
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
        await api.delete(`/peticiones/${id}`);
        fetchData();
      } catch (err) {
        alert(`Error al intentar eliminar: ${err.message}`);
      }
    }
  };
  
  const handleOrar = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/peticiones/${id}/orar`);
      fetchData();
    } catch (error) {
      console.error('Error al registrar oración:', error);
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
          🙏 Peticiones
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar peticiones..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nueva Petición
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <PeticionesList 
          filteredData={filteredData} 
          handleOrar={handleOrar} 
          openEditModal={openEditModal} 
          handleDelete={(id) => handleDelete(id)} 
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nueva Petición</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <PeticionesNewModal newItem={newItem} setNewItem={setNewItem} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Petición</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Petición</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="input-group">
                <label>Contenido</label>
                <textarea 
                  value={selectedItem.contenido} 
                  onChange={e => setSelectedItem({...selectedItem, contenido: e.target.value})}
                  required
                  rows={4}
                />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedItem.anonimo} 
                  onChange={e => setSelectedItem({...selectedItem, anonimo: e.target.checked})}
                />
                <label style={{ margin: 0 }}>Publicar de forma anónima</label>
              </div>
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

export default PeticionesView;
