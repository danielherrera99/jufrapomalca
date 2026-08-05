import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import ServiciosList from '../lists/ServiciosList';
import ServiciosNewModal from '../ServiciosNewModal';
import ServiciosEditModal from '../ServiciosEditModal';
import ItemReadModal from '../ItemReadModal';
import MapPicker from '../MapPicker';

const ServiciosView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ 
    titulo: '', 
    contenido: '', 
    fecha: '', 
    lugar: '', 
    cupoMaximo: 0, 
    lat: '', 
    lng: '', 
    imagenFile: null, 
    previewImagen: '' 
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicios');
      const resData = response.data;
      setData(resData.servicios || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching servicios:', err);
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
      formData.append('fecha', newItem.fecha ? new Date(newItem.fecha).toISOString() : new Date().toISOString());
      formData.append('lugar', newItem.lugar || 'Sede Jufra');
      formData.append('cupoMaximo', newItem.cupoMaximo || 0);
      if (newItem.lat) formData.append('lat', newItem.lat);
      if (newItem.lng) formData.append('lng', newItem.lng);
      if (newItem.imagenFile) formData.append('imagen', newItem.imagenFile);

      await api.post('/servicios', formData);
      setIsModalOpen(false);
      setNewItem({ titulo: '', contenido: '', fecha: '', lugar: '', cupoMaximo: 0, lat: '', lng: '', imagenFile: null, previewImagen: '' });
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
      formData.append('descripcion', selectedItem.descripcion || '');
      if (selectedItem.fecha) formData.append('fecha', new Date(selectedItem.fecha).toISOString());
      formData.append('lugar', selectedItem.lugar || '');
      formData.append('cupoMaximo', selectedItem.cupoMaximo || 0);
      if (selectedItem.ubicacion?.lat) formData.append('lat', selectedItem.ubicacion.lat);
      if (selectedItem.ubicacion?.lng) formData.append('lng', selectedItem.ubicacion.lng);
      if (selectedItem.nuevaImagenFile) formData.append('imagen', selectedItem.nuevaImagenFile);

      await api.put(`/servicios/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/servicios/${id}`);
        fetchData();
      } catch (err) {
        alert(`Error al intentar eliminar: ${err.message}`);
      }
    }
  };
  
  const handleParticipar = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const { data } = await api.put(`/servicios/${id}/participar`);
      alert(data.message);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al procesar inscripción');
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
          🤝 Servicios y Voluntariado
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar servicios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nuevo Servicio
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <ServiciosList 
          filteredData={filteredData} 
          setReadItem={setReadItem} 
          openEditModal={openEditModal} 
          handleDelete={(id) => handleDelete(id)} 
          handleParticipar={handleParticipar}
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Crear Nuevo Servicio</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <ServiciosNewModal newItem={newItem} setNewItem={setNewItem} MapPicker={MapPicker} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Servicio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Servicio</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <ServiciosEditModal 
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

export default ServiciosView;
