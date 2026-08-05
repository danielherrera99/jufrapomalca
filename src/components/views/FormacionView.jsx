import React, { useState, useEffect, useMemo } from 'react';
import api from '../../config/api';
import FormacionList from '../lists/FormacionList';
import FormacionNewModal from '../FormacionNewModal';
import FormacionEditModal from '../FormacionEditModal';
import ItemReadModal from '../ItemReadModal';

const FormacionView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ titulo: '', descripcion: '', contenido: '', etiquetas: '', archivoFile: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [readItem, setReadItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/formacion');
      const resData = response.data;
      setData(resData.formacion || (Array.isArray(resData) ? resData : []));
    } catch (err) {
      console.error('Error fetching formacion:', err);
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
      const fallback = normalize(`${item.titulo||''} ${item.descripcion||''} ${item.contenido||''}`);
      return fallback.includes(term);
    });
  }, [data, searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('titulo', newItem.titulo || '');
      formData.append('descripcion', newItem.descripcion || '');
      formData.append('contenido', newItem.contenido || '');
      const etiqArray = (newItem.etiquetas || '').split(',').map(e => e.trim()).filter(e => e);
      etiqArray.forEach(e => formData.append('etiquetas', e));
      if (newItem.archivoFile) formData.append('archivo', newItem.archivoFile);

      await api.post('/formacion', formData);
      setIsModalOpen(false);
      setNewItem({ titulo: '', descripcion: '', contenido: '', etiquetas: '', archivoFile: null });
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
      formData.append('contenido', selectedItem.contenido || '');
      
      const etiqList = typeof selectedItem.etiquetas === 'string' 
        ? selectedItem.etiquetas.split(',').map(e => e.trim()).filter(e => e)
        : (Array.isArray(selectedItem.etiquetas) ? selectedItem.etiquetas : []);
      etiqList.forEach(e => formData.append('etiquetas', e));

      if (selectedItem.nuevaImagenFile) formData.append('archivo', selectedItem.nuevaImagenFile);

      await api.put(`/formacion/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      alert(`Error al actualizar el registro: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás totalmente seguro de que deseas eliminar esto?')) {
      try {
        await api.delete(`/formacion/${id}`);
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
          📖 Formación
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar material..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            ➕ Nuevo Material
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ margin: '3rem auto' }}></div>
      ) : (
        <FormacionList 
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
              <h3>Crear Nuevo Material</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <FormacionNewModal newItem={newItem} setNewItem={setNewItem} />
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content animate-fade" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Material</h3>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <FormacionEditModal 
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

export default FormacionView;
