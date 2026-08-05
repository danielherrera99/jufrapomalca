import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import EventosList from '../lists/EventosList';
import EventosNewModal from '../EventosNewModal';
import EventosEditModal from '../EventosEditModal';
import ItemReadModal from '../ItemReadModal';
import MapPicker from '../MapPicker';

const EventosView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ 
    titulo: '', 
    contenido: '', 
    fecha: '', 
    hora: '', 
    lugar: '', 
    tipo: 'reunion', 
    lat: '', 
    lng: '', 
    imagenFile: null, 
    previewImagen: '' 
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/eventos?todos=true');
      const resData = response.data;
      setData(resData.eventos || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching eventos:', err);
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
      const fallback = normalize(`${item.titulo||''} ${item.descripcion||''} ${item.lugar||''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', newItem.titulo || '');
      formData.append('descripcion', newItem.contenido || '');
      formData.append('fecha', newItem.fecha ? new Date(newItem.fecha + 'T12:00:00').toISOString() : new Date().toISOString());
      formData.append('hora', newItem.hora || '18:00');
      formData.append('lugar', newItem.lugar || 'Sede Jufra');
      formData.append('tipo', newItem.tipo || 'reunion');
      formData.append('visibilidad', newItem.visibilidad || 'todos');
      formData.append('lat', newItem.lat || -6.745);
      formData.append('lng', newItem.lng || -79.824);
      if (newItem.imagenFile) formData.append('imagen', newItem.imagenFile);

      await api.post('/eventos', formData);
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', fecha: '', hora: '', lugar: '', tipo: 'reunion', lat: '', lng: '', imagenFile: null, previewImagen: '' });
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
      formData.append('descripcion', selectedItem.descripcion || selectedItem.contenido || '');
      if (selectedItem.fecha) formData.append('fecha', new Date(selectedItem.fecha).toISOString());
      formData.append('hora', selectedItem.hora || '');
      formData.append('lugar', selectedItem.lugar || '');
      formData.append('tipo', selectedItem.tipo || 'reunion');
      formData.append('visibilidad', selectedItem.visibilidad || 'todos');
      if (selectedItem.ubicacion?.lat) formData.append('lat', selectedItem.ubicacion.lat);
      if (selectedItem.ubicacion?.lng) formData.append('lng', selectedItem.ubicacion.lng);
      if (selectedItem.nuevaImagenFile) formData.append('imagen', selectedItem.nuevaImagenFile);

      await api.put(`/eventos/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/eventos/${id}`);
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
          📅 Calendario de Eventos
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar eventos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nuevo Evento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <EventosList 
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
              <h3>Crear Nuevo Evento</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <EventosNewModal newItem={newItem} setNewItem={setNewItem} MapPicker={MapPicker} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Evento</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <EventosEditModal 
                selectedItem={selectedItem} 
                setSelectedItem={setSelectedItem} 
                MapPicker={MapPicker}
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

export default EventosView;
