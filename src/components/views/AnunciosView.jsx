import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import AnunciosList from '../lists/AnunciosList';
import AnunciosNewModal from '../AnunciosNewModal';
import AnunciosEditModal from '../AnunciosEditModal';
import ItemReadModal from '../ItemReadModal';
import MapPicker from '../MapPicker';
import SafeImage from '../SafeImage';

const AnunciosView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anunciosFilter, setAnunciosFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ titulo: '', contenido: '', fecha: '', lugar: '', artista: '', anonimo: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const getTipoIcon = (tipo) => {
    switch (tipo) {
        case 'urgente': return '🚨';
        case 'evento': return '📅';
        case 'formacion': return '📖';
        case 'apostolado': return '🙏';
        default: return '📢';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/anuncios');
      const resData = response.data;
      setData(resData.anuncios || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching anuncios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = Array.isArray(data) ? data : [];
    
    if (anunciosFilter !== 'todos') {
      filtered = filtered.filter(item => (item.tipo || 'urgente') === anunciosFilter);
    }

    if (!searchTerm) return filtered;

    const normalize = (str) => typeof str === 'string' ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
    const term = normalize(searchTerm).trim();
    
    return filtered.filter(item => {
      if (!item) return false;
      const fallback = normalize(`${item.titulo||''} ${item.contenido||''} ${item.descripcion||''}`);
      return fallback.includes(term);
    });
  }, [data, anunciosFilter, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', newItem.titulo || '');
      formData.append('contenido', newItem.contenido || '');
      formData.append('tipo', newItem.tipo || 'urgente');
      formData.append('prioridad', newItem.prioridad || 'normal');
      formData.append('destinatarios', newItem.destinatarios || 'todos');
      formData.append('destacado', newItem.destacado ? 'true' : 'false');
      
      if (newItem.archivoFile) {
        formData.append('imagen', newItem.archivoFile);
      }
      if (newItem.ubicacion?.lat) formData.append('lat', newItem.ubicacion.lat);
      if (newItem.ubicacion?.lng) formData.append('lng', newItem.ubicacion.lng);

      await api.post('/anuncios', formData);
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', fecha: '', lugar: '', artista: '', anonimo: false });
      fetchData();
    } catch (error) {
      alert(`Error al crear el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', selectedItem.titulo);
      formData.append('contenido', selectedItem.contenido);
      formData.append('tipo', selectedItem.tipo || 'urgente');
      formData.append('prioridad', selectedItem.prioridad || 'normal');
      formData.append('destinatarios', selectedItem.destinatarios || 'todos');
      formData.append('destacado', selectedItem.destacado ? 'true' : 'false');
      
      if (selectedItem.nuevaImagenFile) {
        formData.append('imagen', selectedItem.nuevaImagenFile);
      }
      if (selectedItem.ubicacion?.lat) formData.append('lat', selectedItem.ubicacion.lat);
      if (selectedItem.ubicacion?.lng) formData.append('lng', selectedItem.ubicacion.lng);

      await api.put(`/anuncios/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/anuncios/${id}`);
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
          📢 Anuncios
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar anuncios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nuevo Anuncio
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'todos', label: 'Todos', icon: '📢' }, 
          { id: 'urgente', label: 'Urgentes', icon: '🚨' }, 
          { id: 'evento', label: 'Eventos', icon: '📅' }, 
          { id: 'formacion', label: 'Formación', icon: '📖' }, 
          { id: 'apostolado', label: 'Apostolado', icon: '🙏' }
        ].map(filtro => (
          <button
            key={filtro.id}
            className={`btn ${anunciosFilter === filtro.id ? 'btn-primary' : ''}`}
            onClick={() => setAnunciosFilter(filtro.id)}
            style={{ 
              background: anunciosFilter !== filtro.id ? 'var(--surface)' : '', 
              color: anunciosFilter !== filtro.id ? 'var(--text-main)' : '', 
              border: '1px solid var(--border)', 
              whiteSpace: 'nowrap' 
            }}
          >
            {filtro.icon} {filtro.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <AnunciosList 
          filteredData={filteredData} 
          setReadItem={setReadItem} 
          getTipoIcon={getTipoIcon} 
          SafeImage={SafeImage} 
          openEditModal={openEditModal} 
          handleDelete={(id) => handleDelete(id)} 
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Anuncio</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <AnunciosNewModal newItem={newItem} setNewItem={setNewItem} MapPicker={MapPicker} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Anuncio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Anuncio</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <AnunciosEditModal 
                selectedItem={selectedItem} 
                setSelectedItem={setSelectedItem} 
                MapPicker={MapPicker} 
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

export default AnunciosView;
