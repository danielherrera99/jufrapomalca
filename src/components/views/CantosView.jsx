import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import CantosList from '../lists/CantosList';
import CantosNewModal from '../CantosNewModal';
import CantosEditModal from '../CantosEditModal';
import ItemReadModal from '../ItemReadModal';

const CantosView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantosFilter, setCantosFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ titulo: '', contenido: '', letra: '', artista: '', categoria: 'otro', archivoFile: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cantos');
      const resData = response.data;
      setData(resData.cantos || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching cantos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = Array.isArray(data) ? data : [];
    
    if (cantosFilter !== 'todos') {
      filtered = filtered.filter(item => item.categoria === cantosFilter);
    }

    if (!searchTerm) return filtered;

    const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    const term = normalize(searchTerm).trim();
    
    return filtered.filter(item => {
      if (!item) return false;
      const fallback = normalize(`${item.titulo||''} ${item.letra||''} ${item.artista||''} ${item.categoria||''}`);
      return fallback.includes(term);
    });
  }, [data, cantosFilter, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', newItem.titulo || '');
      formData.append('letra', newItem.letra || newItem.contenido || '');
      formData.append('autor', newItem.artista || '');
      formData.append('categoria', newItem.categoria || 'otro');
      if (newItem.archivoFile) formData.append('archivo', newItem.archivoFile);

      await api.post('/cantos', formData);
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', letra: '', artista: '', categoria: 'otro', archivoFile: null });
      fetchData();
    } catch (error) {
      alert(`Error al crear el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', selectedItem.titulo || '');
      formData.append('letra', selectedItem.letra || selectedItem.contenido || '');
      formData.append('autor', selectedItem.autor || selectedItem.artista || '');
      formData.append('categoria', selectedItem.categoria || 'otro');
      if (selectedItem.nuevaImagenFile) formData.append('archivo', selectedItem.nuevaImagenFile);

      await api.put(`/cantos/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/cantos/${id}`);
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
          🎵 Cancionero
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar cantos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nuevo Canto
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'todos', label: 'Todos', icon: '🎵' }, 
          { id: 'franciscano', label: 'Franciscanos', icon: '🕊️' }, 
          { id: 'mariano', label: 'Marianos', icon: '🌹' }, 
          { id: 'entrada', label: 'Entrada', icon: '🚶' }, 
          { id: 'animacion', label: 'Animación', icon: '🎸' }, 
          { id: 'adoracion', label: 'Adoración', icon: '🙏' }
        ].map(filtro => (
          <button
            key={filtro.id}
            className={`btn ${cantosFilter === filtro.id ? 'btn-primary' : ''}`}
            onClick={() => setCantosFilter(filtro.id)}
            style={{ 
              background: cantosFilter === filtro.id ? filtro.border || 'var(--primary)' : filtro.bg || 'var(--surface)', 
              color: cantosFilter === filtro.id ? 'white' : 'var(--text-main)', 
              border: `1px solid ${filtro.border || 'var(--border)'}`, 
              whiteSpace: 'nowrap',
              fontWeight: cantosFilter === filtro.id ? 'bold' : 'normal'
            }}
          >
            {filtro.icon} {filtro.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <CantosList 
          filteredData={filteredData} 
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
              <h3>Crear Nuevo Canto</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <CantosNewModal newItem={newItem} setNewItem={setNewItem} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Canto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Canto</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            {/* 
                Assuming CantosEditModal handles its own submit or we need to wrap it.
                Usually it either takes a onSubmit prop or we do it here.
                We'll assume it modifies selectedItem and we have a save function, 
                or the modal itself does it. Let's check how App.jsx handled updates.
            */}
            <form onSubmit={handleUpdate}>
              <CantosEditModal 
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

      {readItem && (
        <ItemReadModal readItem={readItem} setReadItem={setReadItem} />
      )}
    </div>
  );
};

export default CantosView;
